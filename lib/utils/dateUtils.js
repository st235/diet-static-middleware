'use strict';

const fs = require('fs');

const optionsConfig = require('../config/options');

function convertDateOffset(offset) {
	const length = offset.length;
	let offsetValue = offset.slice(0, length - 1);
	const lastSymbol = offset[length - 1];

	switch (lastSymbol) {
		case 'd': offsetValue *= 24;
		case 'h': offsetValue *= 60;
		case 'm': offsetValue *= 60;
		case 's': offsetValue *= 1000;
	}

	return offsetValue;
}

module.exports = {

	defineUtcDate(date) {
		return new Date(date).toUTCString();
	},

	defineOffsetDate(date, userOffset) {
		const convertedOffset = convertDateOffset(userOffset);
		const dateOffset = convertedOffset ? convertedOffset : optionsConfig.expires;
		return new Date(date + dateOffset).toUTCString();
	},

	define(date) {
		return new Date(date).getTime();
	},

	current() {
		return new Date().getTime();
	},

	getFileMTime(source) {
		return new Promise((resolve, reject) => {
			fs.stat(source, (err, stats) => {
				if (err || !stats.mtime) return reject(err);
				return resolve(stats.mtime);
			});
		});
	}
};
