const connectDb = require('@finelets/hyper-rest/db/mongoDb/ConnectMongoDb'),
	appBuilder = require('@finelets/hyper-rest/express/AppBuilder').begin(__dirname),
	logger = require('@finelets/hyper-rest/app/Logger'),
	messageCenter = require('@finelets/hyper-rest/mq'),
	mcConfig = require('./server/MessageCenterConfig'),
	jwt = require('@finelets/hyper-rest/jwt/ExpressJwt'),
	jwtConfig = require('./server/JwtConfig')(),
	cors = require('cors'),
	path = require('path'),
	restDir = path.join(__dirname, './server/rests'),
	graph = require('./server/Flow'),
	rests = require('@finelets/hyper-rest/rests')(restDir, graph);

var app = appBuilder.getApp();

let mode = process.env.RUNNING_MODE
logger.info('Server is running at ' + mode + ' mode')
if (mode === 'rest') {
	appBuilder
		.setWebRoot('/textrade/root', './client')
		.setFavicon('client/imgs/favicon.jpg')
		.setResources(...rests)
		.end();
} else {
	app.use(cors())
	appBuilder
		.setWebRoot('/textrade/root', './client')
		.setFavicon('client/imgs/favicon.jpg')
		.setJwt(jwt, jwtConfig)
		.setResources(...rests)
		.end();
}

connectDb(function () {
	logger.info('db: ' + process.env.MONGODB);
	logger.info('connect mongodb success .......');
	return messageCenter.start(mcConfig)
		.then(() => {
			var server = appBuilder.run(function () {
				const addr = server.address();
				logger.info('the server is running and listening at ' + addr.port);
			});
		})
});