'use strict';

const fs = require('fs');

const DATE_OFFSET = 604800000;

module.exports = {

	defineUtcDate(date) {
		return new Date(date).toUTCString();
	},

	defineOffsetDate(date) {
		return new Date(date + DATE_OFFSET).toUTCString();
	},

	current() {
		return new Date().getTime();
	},

	getFileMTime(source) {
		return new Promise((resolve, reject) => {
			fs.stat(source, (err, stats) => {
				if (err) return reject(err);
				if (stats.mtime) return resolve(stats.mtime);
			});
		});
	}
};
