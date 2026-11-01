"""Local preview server with the same clean-URL behaviour as CloudFront: /about -> about.html."""
import http.server, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def translate_path(self, path):
        p = super().translate_path(path)
        if not os.path.exists(p) and os.path.isfile(p + ".html"): return p + ".html"
        return p
    def end_headers(self):
        self.send_header("Cache-Control", "no-store"); super().end_headers()
http.server.ThreadingHTTPServer(("", int(sys.argv[1]) if len(sys.argv) > 1 else 8766), H).serve_forever()
