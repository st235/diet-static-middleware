'use strict';

const fs = require('fs');
const zlib = require('zlib');

const headersConfig = require('../config/headers');

class PipeBuilder {
	constructor($) {
		this._$ = $;
		this._streamsQueue = [];
	}

	setReadStream(source) {
		this._streamsQueue.push(fs.createReadStream(source));
		return this;
	}

	setCompressionStream() {
		let encoding = this._$.header(headersConfig.ACCEPT_ENCODING.TITLE);
		if (!encoding) encoding = '';

		const deflateRegExp = /\bdeflate\b/;
		const gzipRegExp = /\bgzip\b/;

		if (encoding.match(deflateRegExp)) {
			this._$.header(headersConfig.CONTENT_ENCODING.TITLE, headersConfig.CONTENT_ENCODING.VALUE.DEFLATE);
			this._streamsQueue.push(zlib.createDeflate());
		} else if (encoding.match(gzipRegExp)) {
			this._$.header(headersConfig.CONTENT_ENCODING.TITLE, headersConfig.CONTENT_ENCODING.VALUE.GZIP);
			this._streamsQueue.push(zlib.createGzip());
		}

		return this;
	}

	setCacheStream(cacheStorage, source) {
		this._streamsQueue.push(cacheStorage.set(source));
		return this;
	}

	setResponseStream() {
		this._streamsQueue.push(this._$.response);
		return this;
	}

	pipeStreamsQueue() {
		return this._streamsQueue.reduce((lastStream, currentStream) => {
			return lastStream.pipe(currentStream);
		});
	}
}
module.exports = PipeBuilder;