"""Remove confirmed template residue without inventing missing project content.

This is a deterministic part of the static import, not a separate CMS or a
redesign. The untouched capture remains the source of all layouts and media.
"""
import html
import re

EMPTY_CASES = {
    "/work/future-archive", "/work/studio-atlas", "/work/parallel-forms",
    "/work/silent-motif", "/work/pattern-language", "/work/spectrum-project",
}
FLOWER_ALTS = {"Orange Flower", "Purple Flower", "Yellow Flower", "Lilac Flower"}
TEMPLATE_ROLES = {"Крутой", "Чел", "ММА", "Боба", "Биба", "Сударь"}
PAGE_META = {
    "/work": ("Проекты BAEV | Презентации, конференции и брендинг",
              "Проекты агентства BAEV: презентации, конференции, стратегические сессии, брендинг и веб."),
    "/about": ("Об агентстве BAEV | Подход и команда",
               "Агентство BAEV: подход к публичной коммуникации, принципы работы и команда."),
    "/blog": ("Журнал BAEV | Презентации и публичные выступления",
              "Статьи BAEV о презентациях, структуре выступлений, sales deck и pitch deck."),
    "/contact": ("Связаться с BAEV | Обсудить проект",
                 "Обсудить проект с BAEV: презентации и публичная коммуникация для бизнеса. hello@baev.agency."),
}


def text(node):
    return " ".join(html.unescape(re.sub(r"<!--.*?-->", "", node.text(), flags=re.S)).split())


def has_class(node, name):
    return name in node.attrs.get("class", "").split()


def apply_content_cleanup(doc, route, project_covers):
    Node = type(doc)
    counts = {}

    def count(key):
        counts[key] = counts.get(key, 0) + 1

    def element(tag, attrs, value):
        node = Node(tag, attrs)
        node.children = [html.escape(value)]
        return node

    title_node = next(n for n in doc.walk() if n.tag == "title")
    original_title = re.sub(r"\s*[-|]\s*FreeLab\s*$", "", text(title_node), flags=re.I)

    def prune(parent, ancestors=()):
        children = []
        for node in parent.children:
            if not isinstance(node, Node):
                children.append(node)
                continue
            if node.tag in {"style", "script", "head"}:
                children.append(node)
                continue
            value = text(node)
            if route == "/work/studio-atlas" and has_class(node, "framer-1qj1z1f") and any(
                n.tag == "a" and n.attrs.get("href") == route for n in node.children if isinstance(n, Node)
            ):
                count("self_recommendation_removed")
                continue
            if node.tag in {"a", "p", "span"} and value == "+7 (999) 000-00-00":
                count("placeholder_phone_removed")
                continue
            if route == "/about" and node.attrs.get("data-framer-name") == "Designer":
                if any(n.tag == "p" and text(n) == "Член команды" for n in node.walk()):
                    count("placeholder_team_card_removed")
                    continue
            if route == "/about" and node.tag == "p" and value in TEMPLATE_ROLES:
                count("unconfirmed_team_role_removed")
                continue
            if route == "/work/spectrum-project" and node.tag == "p" and value.startswith("The project began with a search for clarity"):
                count("vk_template_paragraph_removed")
                continue
            if route.startswith("/blog/") and node.tag == "p" and "Ключевые запросы:" in value:
                prefix = value.split("Ключевые запросы:", 1)[0].rstrip()
                count("editorial_keyword_tail_removed")
                if not prefix:
                    continue
                node.children = [html.escape(prefix)]
            if node.tag in {"p", "span", "h2", "h3", "h4"} and value == "Next Blog":
                node.children = ["Другие статьи"]
                count("related_articles_label_localized")
            if node.tag == "img" and node.attrs.get("alt") in FLOWER_ALTS:
                in_named_link = any(n.tag == "a" and text(n) for n in ancestors + (parent,))
                node.attrs["alt"] = "" if in_named_link else (
                    original_title if route.startswith("/work/") else "")
                count("template_image_alt_replaced")

            # Preserve every original responsive variant and every style attribute.
            # Only the semantic level changes, never the actual title or its size.
            if route.startswith("/work/") and node.tag == "h4" and parent.attrs.get("data-framer-name") == "Title" and any(
                has_class(parent, cls) for cls in ("framer-11uxe8r", "framer-12pddjo", "framer-q8d9qs")
            ):
                node.tag = "h1"
                parent.attrs.pop("tabindex", None)
                count("page_title_promoted")
            elif route == "/work" and node.tag == "h2" and value == "Проекты":
                node.tag = "h1"
                count("page_title_promoted")
            elif route == "/blog" and node.tag == "h2" and value == "BAEV Журнал":
                node.tag = "h1"
                count("page_title_promoted")
            elif route.startswith("/blog/") and node.tag == "h4" and has_class(parent, "framer-1ea17e"):
                node.tag = "h1"
                count("page_title_promoted")
            elif route == "/about" and node.tag in {"h1", "h2"}:
                if has_class(parent, "framer-1ut9uld") and value == "BAEV Agency":
                    node.tag = "h1"
                elif node.tag == "h1":
                    node.tag = "h2"
                    count("section_heading_normalized")

            prune(node, ancestors + (parent,))
            if route in EMPTY_CASES and node.tag == "section" and has_class(node, "framer-oec2f5") and node.attrs.get("data-framer-name") == "Content":
                media = any(
                    (n.tag in {"img", "video", "audio", "source", "iframe", "embed"} and n.attrs.get("src"))
                    or (n.tag == "a" and n.attrs.get("href")) or n.tag in {"canvas", "object"}
                    for n in node.walk()
                )
                if not text(node) and not media:
                    count("empty_case_body_removed")
                    continue
            children.append(node)
        parent.children = children

    body = next(n for n in doc.walk() if n.tag == "body")
    prune(body)

    if route == "/about":
        for card in doc.walk():
            if not (has_class(card, "framer-mayz5s") or card.attrs.get("data-framer-name") == "Designer"):
                continue
            name = next((text(n) for n in card.walk() if n.attrs.get("data-framer-name") == "Name"), "")
            if name:
                for image in card.walk():
                    if image.tag == "img" and not image.attrs.get("alt"):
                        image.attrs["alt"] = name

    for index, form in enumerate(n for n in doc.walk() if n.tag == "form"):
        message_required = any(n.tag == "textarea" and n.attrs.get("name") == "MessageEmail" and "required" in n.attrs for n in form.walk())
        for field in form.walk():
            if message_required and field.tag == "label" and text(field) == "Сообщение":
                for part in field.walk():
                    part.children = ["Сообщение 🞵" if isinstance(child, str) and html.unescape(child).strip() == "Сообщение" else child for child in part.children]
            if field.tag == "input" and field.attrs.get("name") in {"Name", "Email"}:
                field.attrs["required"] = None
                field.attrs["autocomplete"] = "email" if field.attrs["name"] == "Email" else "name"
                if field.attrs["name"] == "Email":
                    field.attrs["type"] = "email"
            if field.tag == "textarea" and field.attrs.get("name") == "MessageEmail":
                field.attrs["placeholder"] = "Расскажите о задаче, сроках и аудитории"
            if field.tag == "button" and has_class(field, "framer-2LXrH"):
                field.attrs.update({"type": "button", "tabindex": "-1", "aria-hidden": "true"})
            if field.tag == "button" and field.attrs.get("type") == "submit":
                for label in field.walk():
                    if label.tag in {"p", "span"} and text(label) == "Отправить запрос":
                        label.children = ["Подготовить письмо"]
                field.attrs["title"] = "Открыть черновик письма в почтовой программе"
                field.attrs["aria-describedby"] = "baev-contact-help-" + str(index)
        form.children.append(element("p", {
            "class": "baev-form-help", "id": "baev-contact-help-" + str(index)
        }, "Кнопка откроет черновик в вашей почтовой программе. Отправьте письмо из нее."))
        count("contact_form_clarified")

    title, description = PAGE_META.get(route, (original_title, ""))
    if route.startswith(("/work/", "/blog/")):
        title = original_title + " | BAEV"
    if route.startswith("/work/"):
        description = original_title + ". Проект агентства BAEV."
    elif route.startswith("/blog/"):
        content = next((n for n in doc.walk() if has_class(n, "framer-fgvene")), None)
        if content:
            description = next((text(n) for n in content.walk() if n.tag == "p" and len(text(n)) >= 40), "")
        if len(description) > 180:
            description = description[:177].rsplit(" ", 1)[0] + "..."
        if not description:
            description = original_title + ". Журнал BAEV."
    title_node.children = [html.escape(title)]
    head = next(n for n in doc.walk() if n.tag == "head")
    for key, value, attr in [
        ("og:title", title, "property"), ("twitter:title", title, "name"),
        ("og:site_name", "BAEV", "property"),
        ("description", description, "name"), ("og:description", description, "property"),
        ("twitter:description", description, "name"),
    ]:
        if not value:
            continue
        found = [n for n in head.walk() if n.tag == "meta" and (n.attrs.get("name") == key or n.attrs.get("property") == key)]
        if found:
            for node in found:
                node.attrs["content"] = value
        else:
            head.children.append(Node("meta", {attr: key, "content": value}))
    count("page_metadata_cleaned")
    return counts
