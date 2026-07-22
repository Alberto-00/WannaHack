#!/usr/bin/env python3
"""WannaHack — launcher server.

Plain `python -m http.server` only sends `Last-Modified`, so browsers apply
heuristic caching and keep serving the old app.jsx / data / css from disk
cache without revalidating ("codice vecchio" after an edit). This variant
sends no-store headers so every reload pulls the current files.

Usage:  serve.py [port] [bind]   (defaults: 8787  127.0.0.1)
Serves the current working directory — callers cd into the repo first.
"""
import sys
import http.server
import socketserver


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8787
    bind = sys.argv[2] if len(sys.argv) > 2 else '127.0.0.1'
    with Server((bind, port), NoCacheHandler) as httpd:
        httpd.serve_forever()


if __name__ == '__main__':
    main()
