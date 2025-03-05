const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        // 读取 index.html
        fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, html) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
                return;
            }

            // 注入环境变量
            const apiKey = process.env.GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
                res.writeHead(500);
                res.end('Error: GOOGLE_MAPS_API_KEY environment variable is not set');
                return;
            }

            // 在 </head> 标签前注入 API 密钥
            const modifiedHtml = html.replace(
                '</head>',
                `<script>window.GOOGLE_MAPS_API_KEY = '${apiKey}';</script></head>`
            );

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(modifiedHtml);
        });
    } else if (req.url === '/script.js') {
        fs.readFile(path.join(__dirname, 'script.js'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading script.js');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(data);
        });
    } else if (req.url === '/styles.css') {
        fs.readFile(path.join(__dirname, 'styles.css'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading styles.css');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
}); 