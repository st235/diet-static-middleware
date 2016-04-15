'use strict';

const fs = require('fs');
const path = require('path');
const mime = require('mime');
const _ = require('underscore');

const StreamService = require('../services/streamService');
const dateUtils = require('../utils/dateUtils');
const validationUtils = require('../utils/validationUtils');

const errorConfig = require('../config/error');
const statesConfig = require('../config/states');
const optionsConfig = require('../config/options');
const headersConfig = require('../config/headers');

/**
 * Diet static middleware create method.
 * @function
 * @param {object} userOptions - All parameters which can put user.
 */
module.exports = userOptions => $ => {
	const pathname = $.url.pathname;
	const mimeType = mime.lookup(pathname);
	const extension = path.extname(pathname);

	const options = _.extend(optionsConfig, userOptions);

	options.cache = validationUtils.validateCache(userOptions.cache);
	options.expires = validationUtils.validateExpiration(userOptions.expires);

	if (!extension) {
		$.status(statesConfig.NOT_FOUND);
		return $.end();
	}

	$.header(headersConfig.CONTENT_TYPE.TITLE, mimeType);
	$.status(statesConfig.SUCCESS);
	const source = options.path + $.url.pathname;

	fs.stat(source, (error, stats) => {
		if (error && error.code === 'ENOENT') {
			console.log('this');
			$.status(statesConfig.NOT_FOUND);
			return $.end();
		}
		else if (error) throw new Error(errorConfig.FILE_STAT_ERROR);

		$.header(headersConfig.SERVER.TITLE, options.server);
		$.header(headersConfig.X_POWERED_BY.TITLE, options.powered);
		$.header(headersConfig.LAST_MODIFIED.TITLE, dateUtils.defineUtcDate(stats.mtime));
		$.header(headersConfig.EXPIRES.TITLE, dateUtils.defineOffsetDate(dateUtils.current(), options.expires));
		$.header(headersConfig.CACHE_CONTROL.TITLE, options.cache);

		const modifiedSince = dateUtils.define($.headers['if-modified-since']);
		const lastModified = dateUtils.define(stats.mtime);

		if ($.headers['if-modified-since'] && lastModified <= modifiedSince) {
			console.log('this');
			$.status(statesConfig.NOT_MODIFIED);
			return $.end();
		}

		return new StreamService($)
			.addReader(source)
			.defineCompression()
			.addResponse()
			.pipe();
	});
};
