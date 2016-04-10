'use strict';

const fs = require('fs');
const path = require('path');
const mime = require('mime');
const zlib = require('zlib');
const _ = require('underscore');

const dateUtils = require('../utils/dateUtils');
const headersConfig = require('../config/headers');

const cache = {};

module.exports = options => $ => {
	const pathname = $.url.pathname;
	const mimeType = mime.lookup(pathname);
	const extension = path.extname(pathname);

	if (!extension) return $.return();

	$.header(headersConfig.CONTENT_TYPE.TITLE, mimeType);
	$.status(200);
	const source = options.path + $.url.pathname;

	fs.stat(source, (error, stats) => {
		if (error) throw new Error();

		$.header(headersConfig.LAST_MODIFIED.TITLE, dateUtils.defineUtcDate(stats.mtime));
		$.header(headersConfig.EXPIRES.TITLE, dateUtils.defineOffsetDate(dateUtils.current()));
		$.header(headersConfig.CACHE_CONTROL.TITLE, 'public');

		const modifiedSince = dateUtils.defineUtcDate($.headers['if-modified-since']);
		const lastModified = dateUtils.defineUtcDate(stats.mtime);

		if ($.headers['if-modified-since'] && lastModified <= modifiedSince) {
			$.status(304);
			$.responded = true;
			$.end();
			return $.return();
		}

		fs.readFile(source, (readError, data) => {
			if (readError) throw new Error();
			if (mimeType !== 'text/css' && mimeType !== 'application/javascript') {
				$.passed = false;
				$.responded = true;
				$.end(data);
				return $.return();
			}

			const buffer = new Buffer(data);
			zlib.gzip(buffer, (gzipError, gzip) => {
				if (gzipError) throw new Error();

				cache[source] = gzip;
				$.header(headersConfig.CONTENT_ENCODING.TITLE, headersConfig.CONTENT_ENCODING.VALUE);
				$.header(headersConfig.VARY.TITLE, headersConfig.VARY.VALUE);
				$.passed = false;
				$.responded = true;
				$.end(gzip);
				$.return();
			});
		});
	});
};
