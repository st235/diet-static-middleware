'use strict';

const domainFactory = require('domain');
const fs            = require('fs');
const path          = require('path');

const mime          = require('mime');
const _             = require('underscore');
const CacheFactory  = require('streaming-cache');

const StreamService = require('../services/streamService');
const dateUtils     = require('../utils/dateUtils');
const headersConfig = require('../config/headers');

const cache         = new CacheFactory();


//TODO: Протестировать
//TODO: Разобраться с поведением кеша при различных заголовках
module.exports = options => $ => {
	const domain = domainFactory.create();

	domain.on('error', error => {
		//TODO: Обработка ошибок?
		console.error('Caught error!', error);
	});
	domain.run(() => {
		const pathName = $.url.pathname;
		const source = options.path + pathName;
		const mimeType = mime.lookup(pathName);
		const extension = path.extname(pathName);

		if (!extension) return $.return();

		$.header(headersConfig.CONTENT_TYPE.TITLE, mimeType);
		$.status(200);

		const cached = cache.get(pathName);
		if (cached) return cached.pipe($.response);

		dateUtils.getFileMTime(source).then(mtime => {
			$.header(headersConfig.LAST_MODIFIED.TITLE, dateUtils.defineUtcDate(mtime));
			$.header(headersConfig.EXPIRES.TITLE, dateUtils.defineOffsetDate(dateUtils.current()));
			$.header(headersConfig.CACHE_CONTROL.TITLE, 'public');

			const modifiedSince = dateUtils.defineUtcDate($.headers['if-modified-since']);
			const lastModified = dateUtils.defineUtcDate(mtime);

			if ($.headers['if-modified-since'] && lastModified <= modifiedSince) {
				$.status(304);
				return $.end();
			}

			//TODO: Узнать, зачем нужны эти строчки
			//if (mimeType !== 'text/css' && mimeType !== 'application/javascript') {
			//	return $.end(data);
			//}

			const streamService = new StreamService($);

			return streamService
				.setReadStream(source)
				.setCompressionStream()
				.setCacheStream(cache, source)
				.setResponseStream()
				.pipeStreamsQueue();
		}, () => {
			//TODO: Добавить обработку ошибки при невозможности получить mtyme
			throw new Error();
		});
	});
};
