'use strict';

const fs = require('fs');
const url = require('url');
const path = require('path');
const mime = require('mime');
const zlib = require('zlib');

const cache = {};
const DATE_OFFSET = 604800000;

module.exports = options => $ => {
	const pathname = $.url.pathname;
	const mimeType = mime.lookup(pathname);
	const extension = path.extname(pathname);

	if (extension) {
		$.header('Content-Type', mimeType);
		$.status(200);
		const source = options.path + $.url.pathname;
		fs.stat(source, (error, stats) => {
			if (!error) {
				$.header('Last-Modified', new Date(stats.mtime).toUTCString());
				$.header('Expires', new Date(new Date().getTime() + DATE_OFFSET).toUTCString());
				$.header('Cache-Control', 'public');
				const modifiedSince = new Date($.headers['if-modified-since']).getTime();
				const lastModified = new Date(stats.mtime).getTime();
				if (!$.headers['if-modified-since'] || lastModified > modifiedSince) {

					fs.readFile(source, (readerror, data) => {
						if (readerror) throw readerror;
						if (mimeType === 'text/css' || mimeType === 'application/javascript') {
							const buffer = new Buffer(data);
							zlib.gzip(buffer, (error, gzip) => {
								if (error) throw error;
								cache[source] = gzip;
								$.header('Content-Encoding', 'gzip');
								$.header('Vary', 'Accept-Encoding');
								$.passed = false;
								$.responded = true;
								$.response.end(gzip);
								$.return();
							});
						} else {
							$.passed = false;
							$.responded = true;
							$.response.end(data);
							$.return();
						}
					});
				} else {
					$.status(304);
					$.responded = true;
					$.response.end();
					$.return();
				}
			} else if (error.type !== 'ENOENT') {
				$.status(error.status || 500, 'File not found');
				$.return();
			} else {
				throw error;
			}
		});
	} else {
		$.return();
	}
};
