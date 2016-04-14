'use strict';

const fs = require('fs');
const path = require('path');
const mime = require('mime');
const _ = require('underscore');

const dateUtils = require('../utils/dateUtils');
const headersConfig = require('../config/headers');
const StreamService = require('../services/streamService');

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

		const modifiedSince = dateUtils.define($.headers['if-modified-since']);
		const lastModified = dateUtils.define(stats.mtime);

		if ($.headers['if-modified-since'] && lastModified <= modifiedSince) {
			$.status(304);
			$.responded = true;
			$.end();
			return $.return();
		}

		const streamService = new StreamService($);

		return streamService
			.setReadStream(source)
			.setCompressionStream()
			.setResponseStream()
			.pipeStreamsQueue();
	});
};
