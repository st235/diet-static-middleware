'use strict';

const fs = require('fs');

const DATE_OFFSET = 604800000;

module.exports = {

	defineUtcDate(date) {
		return new Date(date).toUTCString();
	},

	defineOffsetDate(date, userOffset) {
		const dateOffset = (userOffset && userOffset >= 0) ? userOffset : DATE_OFFSET;
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
