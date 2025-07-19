import { createServer } from 'http';
import { readFileSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  let filePath = join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
  
  try {
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      filePath = join(filePath, 'index.html');
    }
    
    const ext = extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    const content = readFileSync(filePath);
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
    
  } catch (error) {
    // If file not found, serve index.html for SPA routing
    if (error.code === 'ENOENT') {
      try {
        const indexPath = join(__dirname, 'dist', 'index.html');
        const indexContent = readFileSync(indexPath);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(indexContent);
      } catch (indexError) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Server Error');
    }
  }
});

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at:`);
  console.log(`   Local:   http://localhost:${PORT}/`);
  console.log(`   Network: http://127.0.0.1:${PORT}/`);
  console.log(`   WSL:     http://172.25.39.148:${PORT}/`);
  console.log(`   WSL:     http://10.255.255.254:${PORT}/`);
  console.log(`\n📱 Try opening any of these URLs in your Windows browser`);
  console.log(`\n🎯 Features available:`);
  console.log(`   • Landing page with dark/light theme`);
  console.log(`   • Create coloring pages (/create)`);
  console.log(`   • View gallery (/gallery)`);
  console.log(`   • Authentication system`);
  console.log(`   • Breadcrumbs navigation`);
  console.log(`\n🔧 If connection fails, try the network IP addresses above`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error.message);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});