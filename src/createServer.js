'use strict';

const http = require('http');
const fs = require('fs/promises');
const path = require('path');

function createServer() {
  return http.createServer(async (request, response) => {
    if (request.url.includes('//')) {
      response.statusCode = 404;
      response.setHeader('Content-type', 'text/plain');
      response.end('Path cannot contain double slashes');

      return;
    }

    const url = new URL(request.url || '/', `http://${request.headers.host}`);
    const { pathname } = url;

    if (!pathname.startsWith('/file')) {
      response.statusCode = 400;
      response.setHeader('Content-type', 'text/plain');

      response.end(
        `To load files, use the path starting with /file/. For example: /file/index.html`,
      );

      return;
    }

    const relativePath = pathname.replace(/^\/file\/?/, '') || 'index.html';
    const filePath = path.join(__dirname, '../public', relativePath);
    const publicDir = path.resolve(__dirname, '../public');

    if (!filePath.startsWith(publicDir)) {
      response.statusCode = 400;
      response.setHeader('Content-Type', 'text/plain');

      return response.end('Cannot access files outside public folder');
    }

    try {
      const fileData = await fs.readFile(filePath, 'utf-8');

      response.statusCode = 200;
      response.setHeader('Content-type', 'text/plain');
      response.end(fileData);
    } catch (error) {
      response.statusCode = 404;
      response.setHeader('Content-type', 'text/plain');
      response.end('File not found');
    }
  });
}

module.exports = {
  createServer,
};
