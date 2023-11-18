const { readFile, accessSync, constants } = require('fs')
const { createServer } = require('http')
const { join, normalize, resolve, extname } = require('path')

const types = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    json: 'application/json',
    xml: 'application/xml',
    rdf: 'application/rdf+xml',
    ttl: 'text/turtle',
    jsonld: 'application/ld+json',
    srj: 'application/sparql-results+json'
};

module.exports = class HttpServer {

    constructor(port = 8666, directoryName = './site/public') {
        this.port = port
        this.root = normalize(resolve(directoryName));

        this.server = createServer((req, res) => {
            console.log(`${req.method} ${req.url}`);

            const extension = extname(req.url).slice(1);
            const type = extension ? types[extension] : types.html;
            const supportedExtension = Boolean(type);

            if (!supportedExtension) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('404: File not found');
                return;
            }

            let fileName = req.url;
            if (req.url === '/') fileName = 'index.html';
            else if (!extension) {
                try {
                    accessSync(join(root, req.url + '.html'), constants.F_OK);
                    fileName = req.url + '.html';
                } catch (e) {
                    fileName = join(req.url, 'index.html');
                }
            }

            const filePath = join(this.root, fileName);
            const isPathUnderRoot = normalize(resolve(filePath)).startsWith(this.root);

            if (!isPathUnderRoot) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('404: File not found');
                return;
            }

            readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('404: File not found');
                } else {
                    res.writeHead(200, { 'Content-Type': type });
                    res.end(data);
                }
            });
        });
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`Server is listening on port ${this.port}`);
        })
    }
}

//exports.HttpServer = HttpServer
