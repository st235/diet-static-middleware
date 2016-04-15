'use strict';

const moment = require('moment');

module.exports = {

	defineUtcDate(date) {
		return new Date(date).toUTCString();
	},

	defineOffsetDate(date, userOffset) {
		return new Date(new Date().getTime(date) + userOffset).toUTCString();
	},

	define(date) {
		return moment().unix(date);
	},

	current() {
		return moment().unix();
	},

	convertDateOffset(offset) {
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
};
