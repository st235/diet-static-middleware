'use strict';

const dateUtils = require('../utils/dateUtils');
const errorsConfig = require('../config/error');

module.exports = {
	validateCache(cache) {
		if (typeof cache !== 'string') throw new Error(errorsConfig.CACHE_MUST_BE_A_STRING);

		const isPublic = ~cache.indexOf('public');
		const isPrivate = ~cache.indexOf('private');

		if (!isPublic && !isPrivate) throw new Error(errorsConfig.INCORRECT_CACHE_TYPE);

		return cache;
	},

	validateExpiration(offset) {
		const correctRegExp = /^\d+[smhd]$/;

		if (typeof offset === 'number') {
			if (offset >= 0) return offset;
			throw new Error(errorsConfig.NEGATIVE_EXPIRATION_DATE);
		}

		if (typeof offset !== 'string') throw new Error(errorsConfig.INCORRECT_EXPIRATION_TYPE);
		if (!correctRegExp.test(offset)) throw new Error(errorsConfig.NO_EXPIRATION_DATE_PATTERN_MATCH);

		return dateUtils.convertDateOffset(offset);
	}
};
