#!/usr/bin/env python3
"""Integrate prepared Figma case mains into the existing BAEV static site.

Only apply_cases() writes output. The source catalog/partials are never changed.
Usage: python3 scripts/case_catalog.py --site /path/to/static-site [--site-url URL]
"""
from __future__ import annotations

import argparse
import copy
import html
import json
import re
from pathlib import Path
from urllib.parse import urljoin

try:
    from .build_static import Document, Node
except ImportError:
    from build_static import Document, Node

BASE_ROUTES = (
    "/work/avito-auto-2024", "/work/linear-identity", "/work/future-archive",
    "/work/studio-atlas", "/work/parallel-forms", "/work/silent-motif",
    "/work/pattern-language", "/work/spectrum-project",
)
REPO = Path(__file__).resolve().parents[1]
TEXT_TAGS = {"p", "h1", "h2", "h3", "h4", "h5", "h6", "span"}


class CaseCatalogError(ValueError):
    pass


def has_class(node, class_name):
    return class_name in node.attrs.get("class", "").split()


def text(node):
    return " ".join(html.unescape(re.sub(r"<!--.*?-->", "", node.text(), flags=re.S)).split())


def elements(node):
    return [child for child in node.children if isinstance(child, Node)]


def find(node, predicate, label):
    matches = [item for item in node.walk() if predicate(item)]
    if not matches:
        raise CaseCatalogError("Missing " + label)
    return matches[0]


def parent_map(node):
    return {id(child): item for item in node.walk() for child in elements(item)}


def route_path(output, route):
    if not re.fullmatch(r"/work/[a-z0-9-]+", route):
        raise CaseCatalogError("Invalid case route: " + str(route))
    return output / route.lstrip("/") / "index.html"


def field(node, class_name):
    return next((item for item in node.walk() if has_class(item, class_name)), None)


def field_text(node, class_name):
    found = field(node, class_name)
    return text(found) if found else ""


def set_field(node, class_name, value, required=True):
    found = [item for item in node.walk() if has_class(item, class_name)]
    if not found and required:
        raise CaseCatalogError("Missing card field ." + class_name)
    for container in found:
        leaf = next((item for item in container.walk() if item.tag in TEXT_TAGS), container)
        leaf.children = [html.escape(str(value))] if value is not None else []
    return found


def set_style(node, key, value):
    styles = {}
    for part in node.attrs.get("style", "").split(";"):
        if ":" in part:
            name, current = part.split(":", 1)
            styles[name.strip()] = current.strip()
    if value is None:
        styles.pop(key, None)
    else:
        styles[key] = value
    if styles:
        node.attrs["style"] = ";".join(name + ":" + val for name, val in styles.items())
    else:
        node.attrs.pop("style", None)


def valid_cover(value):
    return bool(value and value.strip() and value.lower().strip() not in {"null", "undefined"})


def first_image(node):
    return next((item.attrs["src"] for item in node.walk()
                 if item.tag == "img" and valid_cover(item.attrs.get("src"))), "")


def set_card(anchor, record):
    anchor.attrs["href"] = record["route"]
    anchor.attrs["data-baev-case-card"] = record["key"]
    set_field(anchor, "framer-1olvnrf", record["title"])
    set_field(anchor, "framer-18h1pl2", record["category"])
    images = [node for node in anchor.walk() if node.tag == "img"]
    if not images:
        raise CaseCatalogError("Card has no image: " + record["route"])
    for image in images:
        image.attrs["src"] = record["cover"]
        image.attrs.pop("srcset", None)
        image.attrs.pop("sizes", None)
        image.attrs["alt"] = ""  # The same link already contains the project title.
    return anchor


def set_index_row(anchor, record):
    anchor.attrs["href"] = record["route"]
    anchor.attrs["data-baev-cursor-image"] = record["cover"]
    anchor.attrs["data-baev-case-row"] = record["key"]
    set_field(anchor, "framer-65urlu", record["title"])
    set_field(anchor, "framer-4mpyb", record["client"], required=False)
    set_field(anchor, "framer-1izlagv", record["category"])
    cells = set_field(anchor, "framer-aczo0l", record.get("year"))
    for cell in cells:
        if record.get("year") is None:
            cell.attrs["aria-hidden"] = "true"
            set_style(cell, "visibility", "hidden")
        else:
            cell.attrs.pop("aria-hidden", None)
            set_style(cell, "visibility", None)


def replace_nodes(parent, old_nodes, new_nodes):
    identities = {id(node) for node in old_nodes}
    if not identities:
        raise CaseCatalogError("Cannot replace an empty template group")
    result, inserted = [], False
    for child in parent.children:
        if isinstance(child, Node) and id(child) in identities:
            if not inserted:
                result.extend(new_nodes)
                inserted = True
        else:
            result.append(child)
    if not inserted:
        raise CaseCatalogError("Template nodes are not direct children")
    parent.children = result


def clone(node):
    result = copy.deepcopy(node)
    # Repeated card wrappers must not introduce duplicate HTML IDs.
    for item in result.walk():
        item.attrs.pop("id", None)
    return result


def index_groups(home, container=None):
    if container is None:
        container = find(home, lambda n: has_class(n, "framer-cs0toj"), "homepage Index")
    groups = []
    for child in elements(container):
        anchors = [n for n in child.walk() if n.tag == "a" and has_class(n, "framer-pE5Vm")]
        if anchors:
            routes = {n.attrs.get("href") for n in anchors}
            if len(routes) != 1:
                raise CaseCatalogError("A homepage index group contains different project routes")
            groups.append((child, anchors, next(iter(routes))))
    return container, groups


def work_cards(work):
    anchors = [n for n in work.walk() if n.tag == "a" and has_class(n, "framer-m7m9in")]
    if not anchors:
        raise CaseCatalogError("No original /work catalog cards")
    parents = parent_map(work)
    container = parents[id(anchors[0])]
    if any(parents[id(n)] is not container for n in anchors):
        raise CaseCatalogError("Work cards do not share their original container")
    return container, anchors


def read_base_records(work, home):
    _, cards = work_cards(work)
    _, groups = index_groups(home)
    rows = {route: anchors[0] for _, anchors, route in groups}
    result = {}
    order = []
    for card in cards:
        route = card.attrs.get("href")
        if route not in BASE_ROUTES or route in result:
            continue
        row = rows.get(route)
        if row is None:
            raise CaseCatalogError("Missing homepage row for " + route)
        year = field_text(row, "framer-aczo0l")
        result[route] = {
            "key": route.rsplit("/", 1)[-1], "route": route,
            "title": field_text(card, "framer-1olvnrf").replace("Dorchestr", "Dorchester"),
            "client": field_text(row, "framer-4mpyb").replace("Dorchestr", "Dorchester"),
            "category": field_text(card, "framer-18h1pl2"),
            "year": int(year) if re.fullmatch(r"\d{4}", year) else None,
            "cover": first_image(card),
        }
        if not result[route]["title"] or not valid_cover(result[route]["cover"]):
            raise CaseCatalogError("Incomplete original catalog card: " + route)
        order.append(route)
    if len(result) != 8:
        raise CaseCatalogError("Expected all 8 existing catalog projects")
    return result, order


def update_catalog(work, home, records):
    container, cards = work_cards(work)
    existing = {n.attrs.get("href"): n for n in cards}
    template = cards[0]
    updated = []
    for record in records:
        card = existing.get(record["route"])
        card = card if card is not None else clone(template)
        updated.append(set_card(card, record))
    replace_nodes(container, cards, updated)

    # Desktop and phone use separate responsive Index containers.
    containers = [n for n in home.walk() if has_class(n, "framer-cs0toj")]
    if len(containers) != 2:
        raise CaseCatalogError("Expected desktop and mobile Index containers")
    for container in containers:
        _, groups = index_groups(home, container)
        existing = {route: group for group, _, route in groups}
        template = groups[-1][0]
        updated = []
        for record in records:
            group = existing.get(record["route"])
            group = group if group is not None else clone(template)
            anchors = [n for n in group.walk() if n.tag == "a" and has_class(n, "framer-pE5Vm")]
            if len(anchors) != 1:
                raise CaseCatalogError("Expected one project link in each responsive index row")
            set_index_row(anchors[0], record)
            updated.append(group)
        replace_nodes(container, [group for group, _, _ in groups], updated)


def next_projects(doc):
    return find(doc, lambda n: n.attrs.get("data-framer-name") == "Next projects", "Next projects sibling")


def next_container(doc):
    block = next_projects(doc)
    return find(block, lambda n: n.attrs.get("data-framer-name") == "Projects", "Next projects cards")


def next_slots(container):
    return [child for child in elements(container)
            if any(n.tag == "a" and n.attrs.get("href", "").startswith("/work/") for n in child.walk())]


def update_next(doc, route, records, donor_slots):
    container = next_container(doc)
    slots = next_slots(container)
    if not slots:
        raise CaseCatalogError("No related-project card slots on " + route)
    # One old source page had its self-recommendation removed. Restore the same
    # three positional templates, including their original mobile visibility.
    target_slots = slots if len(slots) == 3 else [clone(slot) for slot in donor_slots]
    if len(target_slots) != 3:
        raise CaseCatalogError("Expected three related-project templates")
    index = next(i for i, record in enumerate(records) if record["route"] == route)
    targets = [records[(index + offset) % len(records)] for offset in (1, 2, 3)]
    for slot, target in zip(target_slots, targets):
        anchors = [n for n in slot.walk() if n.tag == "a" and n.attrs.get("href", "").startswith("/work/")]
        if len(anchors) != 1:
            raise CaseCatalogError("A related-project slot needs exactly one link")
        set_card(anchors[0], target)
    if target_slots is not slots:
        replace_nodes(container, slots, target_slots)
    return [record["route"] for record in targets]


def description_from(main):
    description = main.attrs.get("data-case-description", "").strip()
    if not description:
        intro = next((n for n in main.walk() if has_class(n, "baev-case-intro-copy")), None)
        if intro:
            description = text(intro)
    if not description:
        raise CaseCatalogError("Missing native case introduction/description")
    description = " ".join(html.unescape(description).split())
    if len(description) > 190:
        description = description[:187].rsplit(" ", 1)[0] + "..."
    return description


def set_meta(head, key, value, attribute="property"):
    matches = [n for n in head.walk() if n.tag == "meta"
               and (n.attrs.get("name") == key or n.attrs.get("property") == key)]
    if not matches:
        matches = [Node("meta", {attribute: key})]
        head.children.append(matches[0])
    for item in matches:
        item.attrs["content"] = value


def metadata(doc, record, site_url):
    head = find(doc, lambda n: n.tag == "head", "document head")
    title = find(head, lambda n: n.tag == "title", "page title")
    title.children = [html.escape(record["title"] + " | BAEV")]
    cover = urljoin(site_url.rstrip("/") + "/", record["cover"]) if site_url else record["cover"]
    for key, value, attr in (
        ("description", record["description"], "name"),
        ("og:title", record["title"] + " | BAEV", "property"),
        ("twitter:title", record["title"] + " | BAEV", "name"),
        ("og:description", record["description"], "property"),
        ("twitter:description", record["description"], "name"),
        ("og:image", cover, "property"), ("twitter:image", cover, "name"),
        ("og:site_name", "BAEV", "property"), ("og:type", "website", "property"),
        ("twitter:card", "summary_large_image", "name"),
    ):
        set_meta(head, key, value, attr)
    for node in head.walk():
        if node.tag == "meta" and (node.attrs.get("property") or node.attrs.get("name")) in {
            "og:image:secure_url", "twitter:image:src"
        }:
            node.attrs["content"] = cover
    head.children = [n for n in head.children if not (
        isinstance(n, Node) and (
            (n.tag == "link" and n.attrs.get("rel") == "canonical") or
            (n.tag == "meta" and (n.attrs.get("property") or n.attrs.get("name")) == "og:url")
        )
    )]
    if site_url:
        canonical = site_url.rstrip("/") + record["route"]
        head.children.append(Node("link", {"rel": "canonical", "href": canonical}))
        set_meta(head, "og:url", canonical)
    for stylesheet in ("/styles/cases.css", "/styles/case-runtime.css"):
        if not any(n.tag == "link" and n.attrs.get("href") == stylesheet for n in head.walk()):
            head.children.append(Node("link", {"rel": "stylesheet", "href": stylesheet}))
    body = find(doc, lambda n: n.tag == "body", "document body")
    body.attrs["data-baev-case"] = record["key"]
    main = find(doc, lambda n: n.tag == "main" and has_class(n, "baev-case"), "native case main")
    background = re.search(r"(?:^|;)\s*background-color\s*:\s*([^;]+)", main.attrs.get("style", ""))
    if not background:
        raise CaseCatalogError("Case main needs a background-color for navigation: " + record["key"])
    set_style(body, "--case-nav-bg", main.attrs.get("data-case-opening-background") or background[1].strip())
    set_style(body, "--case-nav-fg", "#fff" if record["key"] in {"avito", "vk", "rocket", "askona"} else "#191b1d")
    sections = [n for n in elements(main) if n.tag == "section"]
    hero = next((i for i, n in enumerate(sections) if has_class(n, "baev-case-row--hero")), None)
    if hero is None or hero + 1 >= len(sections):
        raise CaseCatalogError("Missing first case section after hero: " + record["key"])
    for n in main.walk():
        n.attrs.pop("data-baev-header-scroll-target", None)
    sections[hero + 1].attrs["data-baev-header-scroll-target"] = ""
    if not any(n.tag == "script" and n.attrs.get("src") == "/scripts/cases.js" for n in body.walk()):
        body.children.append(Node("script", {"src": "/scripts/cases.js", "defer": None}))


def replace_main(doc, main):
    current = find(doc, lambda n: n.tag == "main", "original case main")
    parent = parent_map(doc)[id(current)]
    parent.children = [
        copy.deepcopy(main) if child is current else child
        for child in parent.children
        if not (isinstance(child, Node) and child.attrs.get("data-framer-name") == "Nav Trigger")
    ]


def site_routes(output, pending):
    paths = {output / "index.html", output / "work/index.html", output / "blog/index.html",
             output / "about/index.html", output / "contact/index.html"}
    paths.update((output / "work").glob("*/index.html"))
    paths.update((output / "blog").glob("*/index.html"))
    paths.update(pending)
    return sorted("/" if p == output / "index.html" else "/" + str(p.parent.relative_to(output))
                  for p in paths if p.exists() or p in pending)


def apply_cases(output: Path, site_url=""):
    """Replace 11 case mains, preserve 4 original cases, and link all 15 projects.

    Source directory: output/content/cases if present; otherwise this script's
    repository content/cases (useful for an isolated --site fixture).
    All inputs and destinations are validated before output files are written.
    """
    output = Path(output).resolve()
    source = output / "content/cases"
    if not (source / "catalog.json").exists():
        source = REPO / "content/cases"
    config = json.loads((source / "catalog.json").read_text(encoding="utf-8"))
    cases = config["cases"]
    if len(cases) != 11 or len({item["key"] for item in cases}) != 11 or len({item["route"] for item in cases}) != 11:
        raise CaseCatalogError("Expected 11 unique configured cases")
    work_path, home_path = output / "work/index.html", output / "index.html"
    work = Document(work_path.read_text(encoding="utf-8")).root
    home = Document(home_path.read_text(encoding="utf-8")).root
    records, order = read_base_records(work, home)
    template = Document((output / "work/avito-auto-2024/index.html").read_text(encoding="utf-8")).root
    donor_slots = [copy.deepcopy(n) for n in next_slots(next_container(template))]
    if len(donor_slots) != 3:
        raise CaseCatalogError("Baseline Avito must contain three Next projects slots")
    partials = {}
    for item in cases:
        key, route = item["key"], item["route"]
        if not re.fullmatch(r"[a-z0-9-]+", key):
            raise CaseCatalogError("Invalid case key: " + str(key))
        route_path(output, route)
        partial = Document((source / (key + ".html")).read_text(encoding="utf-8")).root
        mains = [n for n in partial.walk() if n.tag == "main" and has_class(n, "baev-case")]
        if len(mains) != 1:
            raise CaseCatalogError("Expected one main.baev-case in " + key + ".html")
        main = mains[0]
        old = records.get(route, {})
        cover = main.attrs.get("data-case-cover", "")
        if not valid_cover(cover):
            # Avito's first extracted Figma image is a logo, not its case cover.
            cover = old.get("cover", "") if key == "avito" else first_image(main)
        if not valid_cover(cover):
            cover = next((n.attrs.get("poster") for n in main.walk()
                          if n.tag == "video" and valid_cover(n.attrs.get("poster"))), old.get("cover", ""))
        if not valid_cover(cover):
            raise CaseCatalogError("Missing real case cover: " + key)
        record = dict(item, cover=cover, description=description_from(main))
        record["title"] = record["title"].replace("Dorchestr", "Dorchester")
        record["client"] = record["client"].replace("Dorchestr", "Dorchester")
        if key == "vk":
            record["year"] = 2024
        if route not in records:
            order.append(route)
        records[route] = record
        partials[route] = main
    ordered = [records[route] for route in order]
    if len(ordered) != 15 or len(set(order)) != 15:
        raise CaseCatalogError("Expected 15 unique projects after adding seven cases")
    pending, next_links = {}, {}
    for record in ordered:
        route = record["route"]
        path = route_path(output, route)
        if route in partials:
            doc = copy.deepcopy(template)
            replace_main(doc, partials[route])
            metadata(doc, record, site_url)
        else:
            if not path.exists():
                raise CaseCatalogError("Missing preserved original case: " + route)
            doc = Document(path.read_text(encoding="utf-8")).root
        next_links[route] = update_next(doc, route, ordered, donor_slots)
        pending[path] = doc.render()
    update_catalog(work, home, ordered)
    pending[work_path], pending[home_path] = work.render(), home.render()
    catalog_links = [n.attrs["href"] for n in work.walk() if n.tag == "a" and has_class(n, "framer-m7m9in")]
    index_orders = [[route for _, _, route in index_groups(home, n)[1]]
                    for n in home.walk() if has_class(n, "framer-cs0toj")]
    if catalog_links != order or any(routes != order for routes in index_orders):
        raise CaseCatalogError("Catalog/index order validation failed")
    for route, links in next_links.items():
        if route in links or len(set(links)) != 3 or any(route_path(output, target) not in pending for target in links):
            raise CaseCatalogError("Invalid next-project destination on " + route)
    routes = site_routes(output, pending)
    for path, contents in pending.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(contents, encoding="utf-8")
    return {
        "configuredCases": 11, "projectCount": 15, "generatedCaseRoutes": list(partials),
        "preservedCaseRoutes": [r for r in order if r not in partials],
        "catalogRoutes": order, "homeDesktopRows": len(index_orders[0]), "homeMobileRows": len(index_orders[1]),
        "nextProjects": next_links, "siteRoutes": routes, "siteRouteCount": len(routes),
        "covers": {r["key"]: r["cover"] for r in ordered},
        "writtenFiles": [str(p.relative_to(output)) for p in pending],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site", required=True, type=Path)
    parser.add_argument("--site-url", default="")
    args = parser.parse_args()
    try:
        report = apply_cases(args.site, args.site_url)
    except (CaseCatalogError, OSError, KeyError, json.JSONDecodeError) as error:
        print(json.dumps({"ok": False, "error": str(error)}, ensure_ascii=False))
        return 2
    print(json.dumps({"ok": True, **report}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

