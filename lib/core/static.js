'use strict';

const fs = require('fs');
const path = require('path');
const mime = require('mime');
const _ = require('underscore');

const StreamService = require('../services/streamService');
const dateUtils = require('../utils/dateUtils');
const responseUtils = require('../utils/responseUtils');
const validationUtils = require('../utils/validationUtils');

const errorConfig = require('../config/error');
const statesConfig = require('../config/states');
const optionsConfig = require('../config/options');
const headersConfig = require('../config/headers');

const ENOENT_CODE = 'ENOENT';
const IF_MODIFIED = 'if-modified-since';

/**
 * Diet static middleware create method.
 * @function
 * @param {object} userOptions - All parameters which can put user.
 * @public
 */
module.exports = userOptions => $ => {
	const pathname = $.url.pathname;
	const mimeType = mime.getType(pathname);
	const extension = path.extname(pathname);

	const options = _.extend(optionsConfig, userOptions);

	options.cache = validationUtils.validateCache(userOptions.cache);
	options.expires = validationUtils.validateExpiration(userOptions.expires);

	if (!extension) return responseUtils.response($, statesConfig.NOT_FOUND);

	$.header(headersConfig.CONTENT_TYPE.TITLE, mimeType);
	$.status(statesConfig.SUCCESS);
	const source = options.path + $.url.pathname;

	return fs.stat(source, (error, stats) => {
		if (error && error.code === ENOENT_CODE) return responseUtils.response($, statesConfig.NOT_FOUND);
		else if (error) throw new Error(errorConfig.FILE_STAT_ERROR);

		$.header(headersConfig.SERVER.TITLE, options.server);
		$.header(headersConfig.X_POWERED_BY.TITLE, options.powered);
		$.header(headersConfig.LAST_MODIFIED.TITLE, dateUtils.defineUtcDate(stats.mtime));
		$.header(headersConfig.EXPIRES.TITLE, dateUtils.defineOffsetDate(dateUtils.current(), options.expires));
		$.header(headersConfig.CACHE_CONTROL.TITLE, options.cache);

		const modifiedSince = dateUtils.define($.headers[IF_MODIFIED]);
		const lastModified = dateUtils.define(stats.mtime);

		if ($.headers[IF_MODIFIED] && lastModified <= modifiedSince) return responseUtils.response($, statesConfig.NOT_MODIFIED);

		return new StreamService($)
			.addReader(source)
			.defineCompression()
			.addResponse()
			.pipe();
	});
};
