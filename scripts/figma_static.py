#!/usr/bin/env python3
"""Build-time conversion of the restricted JSX emitted by Figma MCP.

No JavaScript is executed, no packages or assets are downloaded.
render_context(path, asset_urls=None) returns (build_static.Node, asset constants).
Add BASE_CSS once around rendered nodes; inline declarations contain the artwork.
CLI: python3 figma_static.py context.jsx --check
     python3 figma_static.py context.jsx --format html --output artwork.html
"""
from __future__ import annotations

import argparse
import ast
import html
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

try:
    from .build_static import Node
except ImportError:
    from build_static import Node

BASE_CSS = """
[data-figma-static],[data-figma-static] *{box-sizing:border-box;border-width:0;border-style:solid}
[data-figma-static]{line-height:1.5;font-family:Arial,sans-serif;-webkit-text-size-adjust:100%}
[data-figma-static] :is(p,h1,h2,h3,h4,h5,h6,figure,blockquote,ul,ol){margin:0;padding:0}
[data-figma-static] :is(h1,h2,h3,h4,h5,h6){font-size:inherit;font-weight:inherit}
[data-figma-static] :is(img,svg,video,canvas){display:block;vertical-align:middle}
[data-figma-static] :is(img,video){max-width:100%;height:auto}
[data-figma-static] a{color:inherit;text-decoration:inherit}
""".strip()


class FigmaConversionError(ValueError):
    pass


class UnsupportedUtilities(FigmaConversionError):
    def __init__(self, classes):
        self.classes = sorted(set(classes))
        super().__init__("Unsupported utility classes: " + ", ".join(self.classes))


@dataclass
class Expr:
    source: str


@dataclass
class JSX:
    tag: str
    attrs: dict = field(default_factory=dict)
    children: list = field(default_factory=list)


@dataclass
class Component:
    name: str
    defaults: dict
    body: JSX
    default_export: bool = False


def quoted_end(text, start):
    quote = text[start]
    index = start + 1
    while index < len(text):
        if text[index] == "\\":
            index += 2
        elif text[index] == quote:
            return index + 1
        else:
            index += 1
    raise FigmaConversionError("Unclosed string at offset " + str(start))


def balanced_end(text, start):
    pairs = {"(": ")", "[": "]", "{": "}"}
    if text[start] not in pairs:
        raise FigmaConversionError("Expected opening delimiter at " + str(start))
    stack = [pairs[text[start]]]
    index = start + 1
    while index < len(text):
        char = text[index]
        if char in ('"', "'", chr(96)):
            index = quoted_end(text, index)
            continue
        if text.startswith("/*", index):
            end = text.find("*/", index + 2)
            if end < 0:
                raise FigmaConversionError("Unclosed comment")
            index = end + 2
            continue
        if char in pairs:
            stack.append(pairs[char])
        elif char in ")]}":
            if not stack or char != stack.pop():
                raise FigmaConversionError("Unbalanced expression at " + str(index))
            if not stack:
                return index + 1
        index += 1
    raise FigmaConversionError("Unclosed delimiter at offset " + str(start))


def split_top(text, delimiter=","):
    """Split outside strings and balanced groups."""
    result, start, index = [], 0, 0
    while index < len(text):
        char = text[index]
        if char in ('"', "'", chr(96)):
            index = quoted_end(text, index)
        elif char in "([{":
            index = balanced_end(text, index)
        elif text.startswith(delimiter, index):
            result.append(text[start:index].strip())
            index += len(delimiter)
            start = index
        else:
            index += 1
    result.append(text[start:].strip())
    return result


def js_string(source, env):
    if source[0] == chr(96):
        inner = source[1:-1]
        inner = re.sub(r"\$\{([^{}]+)\}", lambda m: str(evaluate(m.group(1), env)), inner)
        return inner.replace("\\" + chr(96), chr(96)).replace("\\n", "\n").replace("\\t", "\t")
    try:
        return ast.literal_eval(source)
    except (ValueError, SyntaxError) as error:
        raise FigmaConversionError("Unsupported string literal: " + source[:100]) from error


def evaluate(source, env):
    source = source.strip()
    if not source or source.startswith("/*"):
        return None
    parts = split_top(source, "||")
    if len(parts) > 1:
        for part in parts:
            value = evaluate(part, env)
            if value:
                return value
        return value
    if source[0] in ('"', "'", chr(96)) and quoted_end(source, 0) == len(source):
        return js_string(source, env)
    if source[0] == "(" and balanced_end(source, 0) == len(source):
        return evaluate(source[1:-1], env)
    if source[0] == "{" and balanced_end(source, 0) == len(source):
        result = {}
        for pair in split_top(source[1:-1]):
            if not pair:
                continue
            parts = split_top(pair, ":")
            if len(parts) < 2:
                raise FigmaConversionError("Unsupported object field: " + pair)
            key = parts[0]
            if key[0] in ('"', "'"):
                key = js_string(key, env)
            if not re.fullmatch(r"(?:--)?[\w-]+", key):
                raise FigmaConversionError("Unsupported object key: " + key)
            result[key] = evaluate(":".join(parts[1:]), env)
        return result
    if source in ("null", "undefined"):
        return None
    if source in ("true", "false"):
        return source == "true"
    if re.fullmatch(r"-?(?:\d+(?:\.\d*)?|\.\d+)", source):
        return float(source) if "." in source else int(source)
    if re.fullmatch(r"[A-Za-z_$][\w$]*", source) and source in env:
        return env[source]
    if re.fullmatch(r"[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+", source):
        value = env
        for key in source.split("."):
            if not isinstance(value, dict) or key not in value:
                break
            value = value[key]
        else:
            return value
    raise FigmaConversionError("Unsupported expression: " + source[:180])


def jsx_whitespace(value):
    # JSX removes indentation/newline-only nodes, retaining intentional inline spaces.
    lines = value.replace("\r", "").replace("\t", " ").split("\n")
    last = max((i for i, line in enumerate(lines) if line.strip()), default=-1)
    result = []
    for i, line in enumerate(lines):
        if i:
            line = line.lstrip(" ")
        if i < len(lines) - 1:
            line = line.rstrip(" ")
        if line:
            result.append(line + (" " if i < last else ""))
    return "".join(result)


class JSXParser:
    def __init__(self, source, position=0):
        self.source, self.pos = source, position

    def whitespace(self):
        while self.pos < len(self.source) and self.source[self.pos].isspace():
            self.pos += 1

    def name(self):
        match = re.match(r"[A-Za-z_$][\w$:.-]*", self.source[self.pos:])
        if not match:
            raise FigmaConversionError("Expected JSX name near " + self.source[self.pos:self.pos + 100])
        self.pos += len(match[0])
        return match[0]

    def expression(self):
        end = balanced_end(self.source, self.pos)
        result = Expr(self.source[self.pos + 1:end - 1])
        self.pos = end
        return result

    def element(self):
        self.whitespace()
        if not self.source.startswith("<", self.pos):
            raise FigmaConversionError("Expected JSX element at " + str(self.pos))
        self.pos += 1
        tag = "" if self.source.startswith(">", self.pos) else self.name()
        node = JSX(tag)
        while True:
            self.whitespace()
            if self.source.startswith("/>", self.pos):
                self.pos += 2
                return node
            if self.source.startswith(">", self.pos):
                self.pos += 1
                break
            key = self.name()
            self.whitespace()
            value = True
            if self.source.startswith("=", self.pos):
                self.pos += 1
                self.whitespace()
                if self.source[self.pos] in ('"', "'"):
                    end = quoted_end(self.source, self.pos)
                    value = html.unescape(self.source[self.pos + 1:end - 1])
                    self.pos = end
                elif self.source[self.pos] == "{":
                    value = self.expression()
                else:
                    raise FigmaConversionError("Unsupported JSX attribute value: " + key)
            node.attrs[key] = value
        while self.pos < len(self.source):
            if self.source.startswith("</", self.pos):
                self.pos += 2
                closing = "" if self.source.startswith(">", self.pos) else self.name()
                self.whitespace()
                if closing != tag or not self.source.startswith(">", self.pos):
                    raise FigmaConversionError("Mismatched JSX closing tag for " + tag)
                self.pos += 1
                return node
            if self.source[self.pos] == "<":
                node.children.append(self.element())
            elif self.source[self.pos] == "{":
                node.children.append(self.expression())
            else:
                end = self.pos
                while end < len(self.source) and self.source[end] not in "<{":
                    end += 1
                value = jsx_whitespace(self.source[self.pos:end])
                if value:
                    node.children.append(value)
                self.pos = end
        raise FigmaConversionError("Unclosed JSX tag: " + tag)


def parse_module(source):
    components, entry, last_end = {}, None, 0
    for match in re.finditer(r"(?m)^(export\s+default\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(", source):
        name = match[2]
        start = source.index("(", match.start())
        end = balanced_end(source, start)
        parameters = source[start + 1:end - 1].strip()
        defaults = {}
        if parameters:
            if not parameters.startswith("{"):
                raise FigmaConversionError("Only destructured component parameters are supported: " + name)
            destructure_end = balanced_end(parameters, 0)
            for parameter in split_top(parameters[1:destructure_end - 1]):
                if not parameter:
                    continue
                parts = split_top(parameter, "=")
                key = parts[0].strip()
                if not re.fullmatch(r"[A-Za-z_$][\w$]*", key) or len(parts) > 2:
                    raise FigmaConversionError("Unsupported component parameter: " + parameter)
                defaults[key] = Expr(parts[1]) if len(parts) == 2 else None
        cursor = end
        while cursor < len(source) and source[cursor].isspace():
            cursor += 1
        if source[cursor:cursor + 1] != "{":
            raise FigmaConversionError("Expected component body: " + name)
        returned = re.match(r"\{\s*return\s*(\()?\s*", source[cursor:])
        if not returned:
            raise FigmaConversionError("Component must directly return JSX: " + name)
        parser = JSXParser(source, cursor + returned.end())
        body = parser.element()
        parser.whitespace()
        if returned[1]:
            if source[parser.pos:parser.pos + 1] != ")":
                raise FigmaConversionError("Expected return closing parenthesis: " + name)
            parser.pos += 1
        parser.whitespace()
        if source[parser.pos:parser.pos + 1] == ";":
            parser.pos += 1
        parser.whitespace()
        if source[parser.pos:parser.pos + 1] != "}":
            raise FigmaConversionError("Unexpected code after JSX return: " + name)
        last_end = max(last_end, parser.pos + 1)
        components[name] = Component(name, defaults, body, bool(match[1]))
        if match[1]:
            if entry:
                raise FigmaConversionError("More than one default component")
            entry = name
    if not entry:
        raise FigmaConversionError("No complete default-exported JSX component found")
    constants = {}
    for match in re.finditer(r"(?m)^const\s+([A-Za-z_$][\w$]*)\s*=\s*", source[:last_end]):
        start = match.end()
        if source[start] not in ('"', "'", chr(96)):
            raise FigmaConversionError("Unsupported top-level constant: " + match[1])
        end = quoted_end(source, start)
        constants[match[1]] = evaluate(source[start:end], constants)
    return components, entry, constants


def arbitrary(value):
    return value.replace("\\_", "\0").replace("_", " ").replace("\0", "_").strip()


def color_value(value):
    return {"black": "#000", "white": "#fff", "transparent": "transparent",
            "current": "currentColor"}.get(value, value)


FIXED = {
    "absolute": ("position", "absolute"), "relative": ("position", "relative"),
    "fixed": ("position", "fixed"), "sticky": ("position", "sticky"),
    "block": ("display", "block"), "inline-block": ("display", "inline-block"),
    "flex": ("display", "flex"), "inline-flex": ("display", "inline-flex"),
    "grid": ("display", "grid"), "contents": ("display", "contents"),
    "hidden": ("display", "none"), "flex-col": ("flex-direction", "column"),
    "flex-row": ("flex-direction", "row"), "flex-wrap": ("flex-wrap", "wrap"),
    "shrink-0": ("flex-shrink", "0"), "grow": ("flex-grow", "1"),
    "flex-none": ("flex", "none"),
    "items-start": ("align-items", "flex-start"), "items-center": ("align-items", "center"),
    "items-end": ("align-items", "flex-end"), "items-stretch": ("align-items", "stretch"),
    "content-stretch": ("align-content", "stretch"),
    "justify-start": ("justify-content", "flex-start"), "justify-end": ("justify-content", "flex-end"),
    "justify-center": ("justify-content", "center"), "justify-between": ("justify-content", "space-between"),
    "overflow-hidden": ("overflow", "hidden"), "overflow-clip": ("overflow", "clip"),
    "overflow-visible": ("overflow", "visible"),
    "pointer-events-none": ("pointer-events", "none"),
    "not-italic": ("font-style", "normal"), "italic": ("font-style", "italic"),
    "font-light": ("font-weight", "300"), "font-normal": ("font-weight", "400"),
    "font-medium": ("font-weight", "500"), "font-semibold": ("font-weight", "600"),
    "font-bold": ("font-weight", "700"),
    "text-right": ("text-align", "right"), "text-center": ("text-align", "center"),
    "text-left": ("text-align", "left"),
    "whitespace-nowrap": ("white-space", "nowrap"), "whitespace-pre-wrap": ("white-space", "pre-wrap"),
    "whitespace-pre": ("white-space", "pre"), "whitespace-normal": ("white-space", "normal"),
    "max-w-none": ("max-width", "none"), "border-solid": ("border-style", "solid"),
    "mask-alpha": ("mask-mode", "alpha"), "mask-luminance": ("mask-mode", "luminance"),
    "mask-no-repeat": ("mask-repeat", "no-repeat"), "mask-no-clip": ("mask-clip", "no-clip"),
    "mask-intersect": ("mask-composite", "intersect"),
}
SIMPLE_PREFIX = {
    "w": "width", "h": "height", "min-w": "min-width", "min-h": "min-height",
    "max-w": "max-width", "max-h": "max-height", "top": "top", "left": "left",
    "right": "right", "bottom": "bottom", "inset": "inset",
    "gap": "gap", "gap-x": "column-gap", "gap-y": "row-gap",
    "leading": "line-height", "tracking": "letter-spacing",
    "rounded": "border-radius", "aspect": "aspect-ratio",
    "grid-cols": "grid-template-columns", "grid-rows": "grid-template-rows",
    "mask-position": "mask-position", "mask-size": "mask-size",
    "z": "z-index", "order": "order",
}
SPACING = {
    "p": ("padding",), "px": ("padding-left", "padding-right"),
    "py": ("padding-top", "padding-bottom"), "pt": ("padding-top",),
    "pr": ("padding-right",), "pb": ("padding-bottom",), "pl": ("padding-left",),
    "m": ("margin",), "mx": ("margin-left", "margin-right"),
    "my": ("margin-top", "margin-bottom"), "mt": ("margin-top",),
    "mr": ("margin-right",), "mb": ("margin-bottom",), "ml": ("margin-left",),
}
FONT_WEIGHTS = {"thin": "100", "extralight": "200", "light": "300", "regular": "400",
                "normal": "400", "medium": "500", "semibold": "600", "bold": "700",
                "extrabold": "800", "black": "900"}


def utilities(class_name):
    styles, unknown, gradient, transforms = {}, [], {}, {}
    if class_name is not None and not isinstance(class_name, str):
        raise FigmaConversionError("className must resolve to a string")
    # Figma uses underscores inside arbitrary values, so whitespace separates tokens.
    for token in (class_name or "").split():
        if token in FIXED:
            key, value = FIXED[token]
            styles[key] = value
            continue
        if token.startswith("[") and token.endswith("]") and ":" in token:
            key, value = token[1:-1].split(":", 1)
            if not re.fullmatch(r"(?:--)?[a-zA-Z][a-zA-Z0-9-]*", key):
                unknown.append(token)
            else:
                styles[key] = arbitrary(value)
            continue
        match = re.fullmatch(r"(-?[\w-]+)-\[(.*)\]", token)
        if match:
            prefix, value = match[1], arbitrary(match[2])
        else:
            match = re.fullmatch(r"(-?[\w-]+)-([^\[\]]+)", token)
            if not match:
                unknown.append(token)
                continue
            prefix, value = match[1], match[2]
        if prefix in SIMPLE_PREFIX:
            if not "[" in token:
                named = {"full": "100%", "auto": "auto", "screen": "100vh" if "h" in prefix else "100vw",
                         "min": "min-content", "max": "max-content", "fit": "fit-content"}
                if value in named and prefix in {"w", "h", "min-w", "min-h", "max-w", "max-h"}:
                    value = named[value]
                elif re.fullmatch(r"\d+/\d+", value) and prefix in {"w", "h", "top", "left", "right", "bottom"}:
                    a, b = value.split("/")
                    value = format(float(a) / float(b) * 100, "g") + "%"
                elif value.isdigit():
                    if prefix in {"grid-cols", "grid-rows"}:
                        value = "repeat(" + value + ",minmax(0,1fr))"
                    elif prefix not in {"z", "order"}:
                        value = format(float(value) * 0.25, "g") + "rem"
                else:
                    unknown.append(token)
                    continue
            styles[SIMPLE_PREFIX[prefix]] = value
        elif prefix in SPACING:
            if "[" not in token and re.fullmatch(r"-?\d+(?:\.\d+)?", value):
                value = format(float(value) * .25, "g") + "rem"
            for prop in SPACING[prefix]:
                styles[prop] = value
        elif prefix == "size":
            if "[" not in token:
                if value == "full":
                    value = "100%"
                elif value.isdigit():
                    value = format(float(value) * .25, "g") + "rem"
                else:
                    unknown.append(token)
                    continue
            styles.update({"width": value, "height": value})
        elif prefix == "object" and value in {"cover", "contain", "fill", "none", "scale-down"}:
            styles["object-fit"] = value
        elif prefix == "object" and value in {"bottom", "top", "left", "right", "center"}:
            styles["object-position"] = value
        elif prefix == "text":
            if value.startswith(("#", "rgb", "hsl", "var(")) or value in {"white", "black", "transparent", "current"}:
                styles["color"] = color_value(value)
            elif "[" in token:
                styles["font-size"] = value
            else:
                unknown.append(token)
        elif prefix == "bg":
            if value.startswith(("#", "rgb", "hsl")) or value in {"white", "black", "transparent", "current"}:
                styles["background-color"] = color_value(value)
            elif value.startswith(("url(", "linear-gradient(", "radial-gradient(")):
                styles["background-image"] = value
            else:
                unknown.append(token)
        elif prefix == "bg-gradient-to" and value in {"b", "t", "l", "r", "br", "bl", "tr", "tl"}:
            gradient["direction"] = {"b": "bottom", "t": "top", "l": "left", "r": "right",
                                     "br": "bottom right", "bl": "bottom left", "tr": "top right", "tl": "top left"}[value]
        elif prefix in {"from", "via", "to"}:
            key = prefix + ("_position" if re.fullmatch(r"-?[\d.]+(?:%|px|rem|em)", value) else "")
            gradient[key] = color_value(value)
        elif prefix == "opacity" and re.fullmatch(r"\d+(?:\.\d+)?", value):
            styles["opacity"] = format(float(value) / (1 if "[" in token else 100), "g")
        elif prefix == "blur":
            styles["filter"] = "blur(" + value + ")"
        elif prefix == "border":
            prop = "border-color" if value.startswith(("#", "rgb", "hsl")) else "border-width"
            styles[prop] = value
        elif prefix == "font" and "[" in token:
            family, _, weight = value.strip("'\"").partition(":")
            styles["font-family"] = '"' + family.replace('"', '\\"') + '",sans-serif'
            if weight:
                if weight.lower() not in FONT_WEIGHTS:
                    unknown.append(token)
                else:
                    styles["font-weight"] = FONT_WEIGHTS[weight.lower()]
        elif prefix in {"col", "row"} and value.isdigit():
            styles["grid-column" if prefix == "col" else "grid-row"] = value
        elif prefix.lstrip("-") in {"translate-x", "translate-y"}:
            if re.fullmatch(r"\d+/\d+", value):
                a, b = value.split("/")
                value = format(float(a) / float(b) * 100, "g") + "%"
            elif "[" not in token and value.isdigit():
                value = format(float(value) * .25, "g") + "rem"
            if prefix.startswith("-"):
                value = value[1:] if value.startswith("-") else "-" + value
            transforms[prefix.lstrip("-")[-1]] = value
        elif prefix == "rotate":
            transforms["rotate"] = value if value.endswith(("deg", "rad", "turn")) else value + "deg"
        elif prefix == "scale":
            transforms["scale"] = value if "[" in token else format(float(value) / 100, "g")
        else:
            unknown.append(token)
    if gradient:
        if "direction" not in gradient or "from" not in gradient:
            unknown.append("incomplete-gradient:" + class_name)
        else:
            stops = []
            for key, default in (("from", "0%"), ("via", "50%"), ("to", "100%")):
                if key == "via" and key not in gradient:
                    continue
                stops.append(gradient.get(key, "transparent") + " " + gradient.get(key + "_position", default))
            styles["background-image"] = "linear-gradient(to " + gradient["direction"] + "," + ",".join(stops) + ")"
    if transforms:
        pieces = []
        if "x" in transforms or "y" in transforms:
            pieces.append("translate(" + transforms.get("x", "0") + "," + transforms.get("y", "0") + ")")
        if "rotate" in transforms:
            pieces.append("rotate(" + transforms["rotate"] + ")")
        if "scale" in transforms:
            pieces.append("scale(" + transforms["scale"] + ")")
        styles["transform"] = " ".join(pieces)
    return styles, unknown


UNITLESS = {"opacity", "z-index", "font-weight", "line-height", "order", "flex", "flex-grow",
            "flex-shrink", "grid-column", "grid-row", "scale"}
ATTR_NAMES = {"htmlFor": "for", "tabIndex": "tabindex", "viewBox": "viewBox",
              "fillRule": "fill-rule", "clipRule": "clip-rule", "strokeWidth": "stroke-width",
              "strokeLinecap": "stroke-linecap", "strokeLinejoin": "stroke-linejoin",
              "stopColor": "stop-color", "stopOpacity": "stop-opacity"}


def css_property(key):
    if key.startswith("--"):
        return key
    return re.sub(r"[A-Z]", lambda m: "-" + m[0].lower(), key)


def style_object(value):
    if not isinstance(value, dict):
        raise FigmaConversionError("style must be a literal object")
    result = {}
    for key, item in value.items():
        if item is None:
            continue
        key = css_property(key)
        if isinstance(item, (int, float)) and key not in UNITLESS and not key.startswith("--") and item:
            item = str(item) + "px"
        result[key] = str(item)
    return result


def style_text(styles):
    prefixed = {}
    for key, value in styles.items():
        if key.startswith("mask-"):
            prefixed["-webkit-" + key] = "source-in" if key == "mask-composite" and value == "intersect" else value
        prefixed[key] = value
    return ";".join(key + ":" + value for key, value in prefixed.items())


class Compiler:
    def __init__(self, source, asset_urls=None):
        self.components, self.entry, self.assets = parse_module(source)
        asset_urls = asset_urls or {}
        self.constants = {name: asset_urls.get(url, url) for name, url in self.assets.items()}
        self.unknown = set()
        self.classes = set()
        self.stack = []

    def component(self, name, props=None):
        if name not in self.components:
            raise FigmaConversionError("Unknown component: " + name)
        if name in self.stack:
            raise FigmaConversionError("Recursive component: " + " -> ".join(self.stack + [name]))
        component = self.components[name]
        env = dict(self.constants)
        for key, value in component.defaults.items():
            env[key] = evaluate(value.source, env) if isinstance(value, Expr) else value
        env.update(props or {})
        self.stack.append(name)
        try:
            node = self.render(component.body, env)
        finally:
            self.stack.pop()
        if node.tag:
            node.attrs["data-figma-component"] = name
            # Preserve explicit instance annotations when an export includes them.
            for key, value in (props or {}).items():
                if key.startswith("data-"):
                    if key in node.attrs and node.attrs[key] != value:
                        node.attrs["data-figma-template-" + key[5:]] = node.attrs[key]
                    node.attrs[key] = value
        return node

    def render(self, jsx, env):
        props = {key: evaluate(value.source, env) if isinstance(value, Expr) else value
                 for key, value in jsx.attrs.items()}
        if jsx.tag and (jsx.tag[0].isupper() or jsx.tag in self.components):
            if jsx.children:
                props["children"] = jsx.children
            return self.component(jsx.tag, props)
        node = Node(jsx.tag)
        styles = {}
        for key, value in props.items():
            if key == "className":
                self.classes.update((value or "").split())
                converted, unknown = utilities(value)
                styles.update(converted)
                self.unknown.update(unknown)
                if value:
                    node.attrs["class"] = value
                    node.attrs["data-figma-classes"] = value
            elif key == "style":
                continue
            elif value is None or value is False:
                continue
            elif key.startswith("on") and len(key) > 2 and key[2].isupper():
                raise FigmaConversionError("Runtime event handler is unsupported: " + key)
            else:
                node.attrs[ATTR_NAMES.get(key, key)] = None if value is True else value
        if "style" in props:
            styles.update(style_object(props["style"]))
        if styles:
            node.attrs["style"] = style_text(styles)
        if isinstance(jsx.attrs.get("src"), Expr):
            source = jsx.attrs["src"].source.strip()
            if source in self.assets:
                node.attrs["data-figma-asset"] = source
        for child in jsx.children:
            if isinstance(child, JSX):
                node.children.append(self.render(child, env))
            elif isinstance(child, Expr):
                value = evaluate(child.source, env)
                if value is None or isinstance(value, bool):
                    continue
                if isinstance(value, (str, int, float)):
                    node.children.append(html.escape(str(value)))
                else:
                    raise FigmaConversionError("Unsupported JSX child value: " + child.source)
            else:
                node.children.append(html.escape(html.unescape(child)))
        return node

    def compile(self):
        node = self.component(self.entry)
        # Validate all component fallbacks too, even if instances override className.
        for name in self.components:
            if name != self.entry:
                self.component(name)
        if self.unknown:
            raise UnsupportedUtilities(self.unknown)
        if node.tag:
            node.attrs["data-figma-static"] = self.entry
        else:
            for child in node.children:
                if isinstance(child, Node) and child.tag:
                    child.attrs["data-figma-static"] = self.entry
        return node


def render_context(path, asset_urls=None):
    """Return a static Node and {constant_name: original_asset_url}.

    asset_urls optionally maps original URLs to local URLs. Both src expressions
    and URLs interpolated into mask/background styles use that map.
    Unknown utilities, identifiers, components or dynamic code raise ValueError.
    """
    compiler = Compiler(Path(path).read_text(encoding="utf-8"), asset_urls)
    node = compiler.compile()
    return node, dict(compiler.assets)


def html_document(node, title="Figma artwork"):
    return ('<!doctype html><html lang="ru"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1">'
            "<title>" + html.escape(title) + "</title><style>" + BASE_CSS +
            "body{margin:0}</style></head><body>" + node.render() + "</body></html>")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("context", type=Path)
    parser.add_argument("--asset-map", type=Path)
    parser.add_argument("--format", choices=("html", "json"), default="json")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--check", action="store_true", help="Print only the conversion inventory")
    args = parser.parse_args()
    try:
        asset_urls = json.loads(args.asset_map.read_text()) if args.asset_map else None
        compiler = Compiler(args.context.read_text(encoding="utf-8"), asset_urls)
        node = compiler.compile()
        summary = {"source": str(args.context), "component": compiler.entry,
                   "nodes": sum(1 for _ in node.walk()), "assets": len(compiler.assets),
                   "components": len(compiler.components), "utilities": len(compiler.classes),
                   "unsupported": []}
        if args.check:
            result = json.dumps(summary, ensure_ascii=False, indent=2)
        elif args.format == "html":
            result = html_document(node, compiler.entry)
        else:
            result = json.dumps({"html": node.render(), "css": BASE_CSS, "assets": compiler.assets,
                                 "summary": summary}, ensure_ascii=False, indent=2)
        if args.output:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_text(result + "\n", encoding="utf-8")
        else:
            print(result)
        return 0
    except FigmaConversionError as error:
        print(json.dumps({"source": str(args.context), "error": str(error),
                          "unsupported": getattr(error, "classes", [])}, ensure_ascii=False), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())

