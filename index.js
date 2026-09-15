const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
// Tentukan folder statis yang ingin disajikan (misalnya folder 'public')
const PUBLIC_DIR = path.join(__dirname, 'public');

// Daftar tipe konten umum berdasarkan ekstensi file
const MIME_TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
	// Hanya layani metode GET dan HEAD
	if (req.method !== 'GET' && req.method !== 'HEAD') {
		res.writeHead(405, { 'Content-Type': 'text/plain' });
		res.end('Method Not Allowed');
		return;
	}

	// Ambil path URL dan arahkan root ('/') ke 'index.html'
	let safePath = path.normalize(req.url.split('?')[0]);
	if (safePath === '/' || safePath === '\\') {
		safePath = '/index.html';
	}

	// Tentukan path lengkap file pada sistem
	const filePath = path.join(PUBLIC_DIR, safePath);

	// Pencegahan akses di luar folder tujuan (Directory Traversal Attack)
	if (!filePath.startsWith(PUBLIC_DIR)) {
		res.writeHead(403, { 'Content-Type': 'text/plain' });
		res.end('Forbidden');
		return;
	}

	// Periksa apakah file ada
	fs.stat(filePath, (err, stats) => {
		if (err || !stats.isFile()) {
			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.end('404 Not Found');
			return;
		}

		const ext = path.extname(filePath).toLowerCase();
		const contentType = MIME_TYPES[ext] || 'application/octet-stream';

		res.writeHead(200, { 'Content-Type': contentType });

		// Jika metode HEAD, cukup kirim header tanpa isi file
		if (req.method === 'HEAD') {
			res.end();
			return;
		}

		// Alirkan isi file langsung ke respon
		const stream = fs.createReadStream(filePath);
		stream.pipe(res);

		stream.on('error', () => {
			if (!res.headersSent) {
				res.writeHead(500, { 'Content-Type': 'text/plain' });
			}
			res.end('Internal Server Error');
		});
	});
});

server.listen(PORT, () => {
	console.log(`Server berjalan di http://localhost:${PORT}`);
});