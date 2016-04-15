module.exports = {
	response($, status) {
		$.status(status);
		$.end();
	}
};
