module.exports = {
	url: '/api/logout',
	rests: [
		{
			type: 'get',
			handler: function(req, res) {
				req.logout();
				res.json({ status: 'ok' });
			}
		}
	]
};
