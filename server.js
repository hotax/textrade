require('dotenv').config();

const path = require('path'),
	cors = require('cors'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	uuid = require('uuid-v4'),
	SocketIo = require('socket.io'),
	PassportSocketIo = require('passport.socketio'),
	MongodbStore = require('connect-mongo'),
	restsDir = path.join(__dirname, './server/rests'),
	resourceDescriptors = require('@finelets/hyper-rest/rests/DirectoryResourceDescriptorsLoader').loadFrom(restsDir),
	resourceRegistry = require('@finelets/hyper-rest/rests/ResourceRegistry'),
	graph = require('./server/flow'),
	transitionsGraph = require('@finelets/hyper-rest/rests/BaseTransitionGraph')(graph, resourceRegistry),
	connectDb = require('@finelets/hyper-rest/db/mongoDb/ConnectMongoDb'),
	//sessionStore = require('@finelets/hyper-rest/session/MongoDbSessionStore')(1000 * 60 * 60 * 24), // set session for 1 day
	//sessionStore = require('@finelets/hyper-rest/session/NeDbSessionStore')(1000 * 60 * 60 * 24), // set session for 1 day
	appBuilder = require('@finelets/hyper-rest/express/AppBuilder').begin(__dirname),
	passport = require('./server/authGithub'),
	CLIENT_ORIGIN = process.env.CLIENT_ORIGIN,
	SECRET = process.env.SESSION_SECRET,
	corsOptions = {
		origin: CLIENT_ORIGIN,
		credentials: true
	},
	logger = require('@finelets/hyper-rest/app/Logger');

const MongodbSessionStore = MongodbStore(session);
const sessionStore = new MongodbSessionStore({
	url: process.env.MONGODB
});
const sessionOptions = {
	genid: function () {
		return uuid();
	},
	key: 'express.sid',
	secret: SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 3 * 60 * 60 * 1000,
		secure: process.env.NODE_ENV === 'production'
	},
	store: sessionStore
};

resourceRegistry.setTransitionGraph(transitionsGraph);

var app = appBuilder.getApp();
app.use(cors(corsOptions));
app.use(cookieParser(SECRET));
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

app.get('/api/auth/callback', passport.authenticate('github'), function (req, res) {
	logger.debug('auth success! next, we will post a success message to client orgin!');
	res.send(`<html>
    <body>
      <script>
        window.opener.postMessage('success', '${CLIENT_ORIGIN}')
        window.close()
      </script>
      Success!
    </body>
    </html>`);
});

appBuilder
	.setResources(resourceRegistry, resourceDescriptors)
	.setWebRoot('/root', './client')
	.setFavicon('client/images/favicon.jpg')
	//.setSessionStore(sessionStore)
	.end();

connectDb(function () {
	logger.info('connect mongodb success .......');
	var server = appBuilder.run(function () {
		const io = SocketIo(server);
		io.use(
			PassportSocketIo.authorize({
				cookieParser: cookieParser,
				key: 'express.sid',
				secret: SECRET,
				store: sessionStore,
				success: function (data, accept) {
					logger.info('socket.io auth success');
					accept();
				}
			})
		);
		const addr = server.address();
		logger.info('the server is running and listening at ' + addr.port);
	});
});