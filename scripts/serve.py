#!/usr/bin/env python3
"""Local-only static preview with clean URLs and byte-range video playback."""
import argparse, mimetypes, re
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote, urlsplit
ROOT=Path(__file__).resolve().parents[1]
class Handler(BaseHTTPRequestHandler):
    def do_HEAD(self): self.send_file(False)
    def do_GET(self): self.send_file(True)
    def send_file(self,body):
        url=unquote(urlsplit(self.path).path)
        if ".." in url.split("/") or any(s.startswith(".") for s in url.split("/") if s):
            self.send_error(404); return
        candidate=ROOT/url.lstrip("/")
        if candidate.is_dir(): candidate=candidate/"index.html"
        if not candidate.is_file() or (candidate.suffix not in {".html",".css",".js",".json",".woff",".woff2",".ttf",".otf",".png",".jpg",".jpeg",".webp",".gif",".svg",".ico",".mp4",".webm",".avif"}):
            self.send_error(404); return
        if candidate.suffix==".json" or url.split('/')[1] in {'content','evidence'} or ("/scripts/" in str(candidate) and candidate.name not in {"site.js","cases.js"}):
            self.send_error(404); return
        size=candidate.stat().st_size; start=0; end=size-1; status=200
        byte_range=self.headers.get("Range","")
        if byte_range and (match:=re.fullmatch(r"bytes=(\d+)-(\d*)",byte_range)):
            start=int(match[1]); end=min(int(match[2]) if match[2] else end,end); status=206
            if start>=size or end<start:
                self.send_response(416); self.send_header("Content-Range",f"bytes */{size}"); self.end_headers(); return
        self.send_response(status)
        self.send_header("Content-Type",mimetypes.guess_type(candidate)[0] or "application/octet-stream")
        self.send_header("Content-Length",str(end-start+1))
        self.send_header("Accept-Ranges","bytes")
        self.send_header("Cache-Control","no-cache")
        self.send_header("X-Content-Type-Options","nosniff")
        if status==206: self.send_header("Content-Range",f"bytes {start}-{end}/{size}")
        self.end_headers()
        if body:
            try:
                with candidate.open("rb") as f:
                    f.seek(start); remaining=end-start+1
                    while remaining>0:
                        data=f.read(min(262144,remaining))
                        if not data: break
                        self.wfile.write(data); remaining-=len(data)
            except (BrokenPipeError,ConnectionResetError): pass
    def log_message(self,format,*args):
        if args and str(args[1] if len(args)>1 else "").startswith(("4","5")):
            super().log_message(format,*args)
if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--port",type=int,default=4187)
    args=parser.parse_args()
    server=ThreadingHTTPServer(("127.0.0.1",args.port),Handler)
    print(f"BAEV preview http://127.0.0.1:{args.port}",flush=True)
    server.serve_forever()
