#!/usr/bin/env python3
"""Import a captured BAEV site as independent static pages, without network access.
Usage: python3 scripts/build_static.py --source /path/to/capture
"""
import argparse, hashlib, html, json, re, shutil
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, urldefrag

VOID = set("area base br col embed hr img input link meta param source track wbr".split())
HOST = "stale-darling-800892.framer.app"
URL_RE = re.compile(r"""https?://[^\s"'<>\\)]+""")
DROP_ATTRS = {"data-framer-hydrate-v2","data-framer-ssr-released-at","data-framer-page-optimized-at",
              "data-framer-generated-page","data-framer-bundle","data-framer-layout-hint-center-x"}
class Node:
    def __init__(self, tag="", attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []
    def render(self):
        contents = "".join(x.render() if isinstance(x,Node) else x for x in self.children)
        if not self.tag: return contents
        attrs = "".join(" "+k+("" if v is None else '="'+html.escape(str(v),quote=True)+'"')
                        for k,v in self.attrs.items())
        return "<"+self.tag+attrs+">"+("" if self.tag in VOID else contents+"</"+self.tag+">")
    def text(self):
        return "".join(x.text() if isinstance(x,Node) else x for x in self.children)
    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child,Node): yield from child.walk()
class Document(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=False)
        self.root=Node(); self.stack=[self.root]; self.feed(source); self.close()
    def handle_starttag(self, tag, attrs):
        node=Node(tag,attrs); self.stack[-1].children.append(node)
        if tag not in VOID: self.stack.append(node)
    def handle_startendtag(self, tag, attrs):
        self.stack[-1].children.append(Node(tag,attrs))
    def handle_endtag(self,tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag==tag:
                del self.stack[i:]; return
    def handle_data(self,data): self.stack[-1].children.append(data)
    def handle_entityref(self,name): self.handle_data("&"+name+";")
    def handle_charref(self,name): self.handle_data("&#"+name+";")
    def handle_decl(self,decl): self.handle_data("<!"+decl+">")
    def handle_comment(self,data):
        if not any(s in data.lower() for s in ["framer","published at","build time"]):
            self.handle_data("<!--"+data+"-->")
def norm(url):
    return urldefrag(html.unescape(url).replace("\\u0026","&").replace("\\/","/"))[0]
def props(style):
    return dict((k.strip(),v.strip()) for part in style.split(";") if ":" in part
                for k,v in [part.split(":",1)])

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source",required=True,type=Path)
    parser.add_argument("--output",type=Path,default=Path(__file__).resolve().parents[1])
    parser.add_argument("--site-url",default="")
    args=parser.parse_args(); capture=args.source.resolve(); output=args.output.resolve()
    manifest=json.loads((capture/"manifest.json").read_text())
    mapping=json.loads((capture/"url-map.json").read_text())
    for record in manifest.get("assets",{}).values():
        if record.get("path") and record.get("final_url"):
            mapping.setdefault(norm(record["final_url"]),record["path"])
    report={"source":"https://"+HOST+"/","pages":[],"assets":[],"removed_scripts":0,"reveals":0}
    unknown=set()
    def local_url(value,base):
        value=html.unescape(value)
        if not value or value.startswith(("data:","#","mailto:","tel:","javascript:")): return value
        absolute=urljoin(base,value); key=norm(absolute); parts=urlsplit(absolute)
        if key in mapping:
            return "/"+mapping[key]+("#"+parts.fragment if parts.fragment else "")
        if parts.netloc==HOST:
            return (parts.path.rstrip("/") or "/")+("?" + parts.query if parts.query else "")+(
                "#"+parts.fragment if parts.fragment else "")
        if "framerusercontent.com" in parts.netloc or parts.netloc in {"fonts.gstatic.com","fonts.googleapis.com"}:
            unknown.add(absolute)
        return value
    def urls(text,base):
        return URL_RE.sub(lambda m:local_url(m.group(0),base),text)
    def css(text,base):
        text=urls(text,base)
        text=re.sub(r"""url\(\s*(["']?)([^)'"]+)\1\s*\)""",
                    lambda m:"url("+m.group(1)+local_url(m.group(2).strip(),base)+m.group(1)+")",text)
        return re.sub(r"""(@import\s+)(["'])([^"']+)\2""",
                      lambda m:m.group(1)+m.group(2)+local_url(m.group(3),base)+m.group(2),text)
    project_covers={}
    work_doc=Document((capture/"raw/work/index.html").read_text()).root
    for card in work_doc.walk():
        if card.tag=="a" and "/work/" in card.attrs.get("href",""):
            cover=next((n.attrs.get("src") for n in card.walk() if n.tag=="img" and n.attrs.get("src")),None)
            if cover: project_covers[local_url(card.attrs["href"],"https://"+HOST+"/work")]=local_url(cover,"https://"+HOST+"/work")
    index_routes={"Haval Dealer Conference":"/work/linear-identity","Альфа Конфа":"/work/future-archive","Спортмастер":"/work/studio-atlas"}
    def transform(doc,url,route):
        appear={}
        for n in doc.walk():
            if n.tag=="script" and n.attrs.get("id")=="__framer__appearAnimationsContent":
                try: appear=json.loads(n.text())
                except json.JSONDecodeError: pass
        hero_done=False
        def visit(parent):
            nonlocal hero_done
            children=[]
            for n in parent.children:
                if not isinstance(n,Node): children.append(n); continue
                a=n.attrs; rel=(a.get("rel") or "").lower(); ident=a.get("id",""); cls=a.get("class","")
                if n.tag=="script": report["removed_scripts"]+=1; continue
                if ident=="__framer-badge-container" or ident.startswith("__framer-editor"): continue
                if n.tag=="link" and (rel in {"modulepreload","preconnect","dns-prefetch"} or
                    (rel=="preload" and a.get("as")=="script")): continue
                if n.tag=="meta" and (a.get("name","").startswith("framer") or a.get("name")=="generator"): continue
                if n.tag=="input" and a.get("aria-hidden")=="true" and "scale(0)" in a.get("style",""): continue
                if (n.tag=="link" and rel=="canonical") or (n.tag=="meta" and a.get("property")=="og:url"):
                    if not args.site_url: continue
                    a["href" if n.tag=="link" else "content"]=args.site_url.rstrip("/")+route
                for k in DROP_ATTRS: a.pop(k,None)
                if n.tag=="html": a["lang"]="ru"
                for k in ("src","poster"):
                    if k in a and (a[k] is None or str(a[k]).strip().lower() in {"","null","undefined"}): a.pop(k,None)
                for k in ["src","poster","href","action","xlink:href"]:
                    if a.get(k):
                        if k=="href" and "framer.com" in urlsplit(urljoin(url,a[k])).netloc:
                            a.pop(k,None); a["aria-disabled"]="true"; a["data-baev-unconfirmed-contact"]=""; continue
                        a[k]=local_url(a[k],url)
                if n.tag=="a" and "framer-pE5Vm" in cls:
                    label=re.sub(r"<!--.*?-->","",n.text(),flags=re.S)
                    for title,target in index_routes.items():
                        if title in label: a["href"]=target
                    if a.get("href") in project_covers: a["data-baev-cursor-image"]=project_covers[a["href"]]
                if a.get("srcset"): a["srcset"]=urls(a["srcset"],url)
                if n.tag=="meta" and a.get("content","").startswith("https://"): a["content"]=local_url(a["content"],url)
                if n.tag=="style": n.children=[css(n.text(),url)]
                if a.get("style"):
                    a["style"]=css(a["style"],url); styles=props(a["style"])
                    try: opacity=float(styles.get("opacity","1"))
                    except ValueError: opacity=1
                    reveal=opacity<=.01 and (n.tag=="span" or "data-framer-appear-id" in a or (
                        bool(re.sub(r"<!--.*?-->","",n.text(),flags=re.S).strip()) and "cursors" not in cls and a.get("aria-hidden")!="true"))
                    if reveal:
                        a["data-baev-reveal"]=""; a["data-baev-from-opacity"]=styles.pop("opacity","0.001")
                        t=styles.get("transform")
                        if t and t!="none":
                            a["data-baev-from-transform"]=t
                            if "%" not in t: styles.pop("transform",None)
                            else:
                                final=" ".join(re.findall(r"\w+\([^)]*%[^)]*\)",t)) or "none"
                                a["data-baev-to-transform"]=final; styles["transform"]=final
                        if styles.get("filter"): a["data-baev-from-filter"]=styles.pop("filter")
                        transition=appear.get(a.get("data-framer-appear-id"),{}).get("default",{}).get("animate",{}).get("transition",{})
                        a["data-baev-delay"]=str(round(float(transition.get("delay",.1))*1000))
                        a["data-baev-duration"]=str(round(float(transition.get("duration",1))*1000))
                        if transition:
                            a["data-baev-transition-type"]=transition.get("type","tween")
                            a["data-baev-bounce"]=str(transition.get("bounce",0))
                            mobile=appear.get(a.get("data-framer-appear-id"),{}).get("1j0e0ep",{}).get("animate",{}).get("transition",{})
                            if mobile:
                                a["data-baev-delay-mobile"]=str(round(float(mobile.get("delay",.1))*1000))
                                a["data-baev-duration-mobile"]=str(round(float(mobile.get("duration",1))*1000))
                        report["reveals"]+=1
                        a["style"]=";".join(k+":"+v for k,v in styles.items())
                if n.tag=="form":
                    a["action"]="mailto:hello@baev.agency"; a["method"]="post"; a["enctype"]="text/plain"
                    a["data-baev-contact-form"]=""; a["data-baev-email"]="hello@baev.agency"
                if n.tag=="video":
                    a["muted"]=a["playsinline"]=""; a["preload"]="none"
                    if route=="/" and not hero_done:
                        a["autoplay"]=""; a["fetchpriority"]="high"; a["data-baev-hero-video"]=""; hero_done=True
                if n.tag=="a" and a.get("target")=="_blank": a["rel"]="noopener noreferrer"
                visit(n); children.append(n)
            parent.children=children
        visit(doc)
        head=next(n for n in doc.walk() if n.tag=="head")
        body=next(n for n in doc.walk() if n.tag=="body")
        head.children.append(Node("link",{"rel":"stylesheet","href":"/styles/site.css"}))
        body.children.append(Node("script",{"src":"/scripts/site.js","defer":None}))
        return doc.render()
    pages=manifest.get("pages",{})
    if len(pages)!=19: raise SystemExit("Expected19pages; got "+str(len(pages)))
    for url,record in pages.items():
        path=record.get("path")
        if not path or not (capture/path).is_file(): raise SystemExit("Missing HTML: "+url)
        route=urlsplit(url).path.rstrip("/") or "/"
        dest=output/(route.strip("/")+"/index.html" if route!="/" else "index.html")
        content=transform(Document((capture/path).read_text()).root,url,route)
        dest.parent.mkdir(parents=True,exist_ok=True); dest.write_text(content)
        report["pages"].append({"route":route,"path":str(dest.relative_to(output)),
            "bytes":dest.stat().st_size,"sha256":hashlib.sha256(content.encode()).hexdigest()})
    for url,record in manifest.get("assets",{}).items():
        path=record.get("path")
        if not path: continue
        src,dst=capture/path,output/path
        if not src.is_file(): raise SystemExit("Missing asset: "+path)
        dst.parent.mkdir(parents=True,exist_ok=True)
        if record.get("kind")=="css" or path.endswith(".css"): dst.write_text(css(src.read_text(),url))
        else: shutil.copy2(src,dst)
        report["assets"].append({"path":path,"bytes":dst.stat().st_size,"source_sha256":record.get("sha256")})
    report["unresolved"]=sorted(unknown); evidence=output/"evidence"; evidence.mkdir(exist_ok=True)
    (evidence/"import-report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    (evidence/"source-provenance.json").write_text(json.dumps({"source":report["source"],"pages":pages,
        "assets":manifest.get("assets",{})},ensure_ascii=False,indent=2)+"\n")
    print(json.dumps({"pages":len(report["pages"]),"assets":len(report["assets"]),"reveals":report["reveals"],
        "removed_scripts":report["removed_scripts"],"unresolved_count":len(unknown),"unresolved_sample":sorted(unknown)[:5]},ensure_ascii=False))
    if unknown: raise SystemExit("Incomplete asset capture; rerun after downloader completes.")
if __name__=="__main__": main()
