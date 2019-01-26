from http.server import BaseHTTPRequestHandler, HTTPServer
import logging
import sys, os
import json

class S(BaseHTTPRequestHandler):
    def _set_response(self):
        self.send_response(200)

        tps = self.path.split('.')[-1]

        heads = {
            'png': 'image/png',
            'gif': 'image/gif',
            'html': 'text/html',
            'htm': 'text/html',
            'js': 'text/javascript',
            'css': 'text/css',
            'json': 'text/json',
            'txt': 'text/plain',
            'md': 'text/plain',
            'ico': 'image/ico',
            '/': 'text/html'
        }
        
        self.send_header('Content-type', heads[tps])
        self.end_headers()

    frame = ''

    def do_GET(self):
        logging.info("GET request,\nPath: %s\nHeaders:\n%s\n",
                     str(self.path), str(self.headers))
        self._set_response()
        if self.path.endswith('/'):
            self.path += 'index.html'
        try:
            path = open(os.path.dirname(__file__) + self.path).read()
        except:
            path = ''
        self.wfile.write(path.encode('utf8'))

    def do_POST(self):
        # <--- Gets the size of data
        content_length = int(self.headers['Content-Length'])
        # <--- Gets the data itself
        post_data = self.rfile.read(content_length)

        
        
        logging.info("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n",
                     str(self.path), str(self.headers), post_data.decode('utf8'))
        logging.info(post_data.decode('utf8'))

        self._set_response()

        self.wfile.write(post_data)


def run(server_class=HTTPServer, handler_class=S, port=8080, host="192.168.1.107"):
    logging.basicConfig(level=logging.INFO)
    server_address = (host, port)
    httpd = server_class(server_address, handler_class)
    logging.info('Starting httpd... at http://%s:%s/\n' % (host, port))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    logging.info('Stopping httpd...\n')


if __name__ == '__main__':
    from sys import argv

    if len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run()
