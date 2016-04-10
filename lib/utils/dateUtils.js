'use strict';

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
	}
};
