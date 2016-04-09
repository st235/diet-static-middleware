'use strict';

const fs = require('fs');
const path = require('path');
const mime = require('mime');
const zlib = require('zlib');

const headersConfig = require('../config/headers');

const cache = {};
const DATE_OFFSET = 604800000;

module.exports = options => $ => {
	const pathname = $.url.pathname;
	const mimeType = mime.lookup(pathname);
	const extension = path.extname(pathname);

	if (!extension) return $.return();

	$.header(headersConfig.CONTENT_TYPE, mimeType);
	$.status(200);
	const source = options.path + $.url.pathname;

	fs.stat(source, (error, stats) => {
		if (error) throw new Error();

		$.header(headersConfig.LAST_MODIFIED, new Date(stats.mtime).toUTCString());
		$.header(headersConfig.EXPIRES, new Date(new Date().getTime() + DATE_OFFSET).toUTCString());
		$.header(headersConfig.CACHE_CONTROL, 'public');

		const modifiedSince = new Date($.headers['if-modified-since']).getTime();
		const lastModified = new Date(stats.mtime).getTime();

		if ($.headers['if-modified-since'] && lastModified <= modifiedSince) {
			$.status(304);
			$.responded = true;
			$.response.end();
			$.return();
			return;
		}

		fs.readFile(source, (readError, data) => {
			if (readError) throw new Error();
			if (mimeType !== 'text/css' && mimeType !== 'application/javascript') {
				$.passed = false;
				$.responded = true;
				$.response.end(data);
				$.return();
				return;
			}

			const buffer = new Buffer(data);
			zlib.gzip(buffer, (error, gzip) => {
				if (error) throw new Error();

				cache[source] = gzip;
				$.header(headersConfig.CONTENT_ENCODING, 'gzip');
				$.header(headersConfig.VARY, 'Accept-Encoding');
				$.passed = false;
				$.responded = true;
				$.response.end(gzip);
				$.return();
			});
		});
	});
};
