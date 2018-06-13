require('dotenv').config();

const path = require('path'),
    cors = require('cors'),
    restsDir = path.join(__dirname, './server/rests'),
    resourceDescriptors = require('@finelets/hyper-rest/rests/DirectoryResourceDescriptorsLoader').loadFrom(restsDir),
    resourceRegistry = require('@finelets/hyper-rest/rests/ResourceRegistry'),
    graph = require('./server/flow'),
    transitionsGraph = require('@finelets/hyper-rest/rests/BaseTransitionGraph')(graph, resourceRegistry),
    connectDb = require('@finelets/hyper-rest/db/mongoDb/ConnectMongoDb'),
    sessionStore = require('@finelets/hyper-rest/session/MongoDbSessionStore')(1000 * 60 * 60 * 24), // set session for 1 day
    appBuilder = require('@finelets/hyper-rest/express/AppBuilder').begin(__dirname),
    passport = require('./server/authGithub'),
    CLIENT_ORIGIN = process.env.CLIENT_ORIGIN,
    corsOptions = {
        origin: CLIENT_ORIGIN,
        credentials: true
    },
    logger = require('@finelets/hyper-rest/app/Logger');

resourceRegistry.setTransitionGraph(transitionsGraph);

var app = appBuilder.getApp();
app.use(cors(corsOptions));
app.use(passport.initialize());
app.use(passport.session());

app.get(
    '/api/auth/callback',
    passport.authenticate('github', {
        failureRedirect: '/error'
    }),
    function (req, res) {
        res.cookie('user', req.user.gitProfile.id)
        res.send(`<html>
    <body>
      <script>
        window.opener.postMessage('success', '${CLIENT_ORIGIN}')
        window.close()
      </script>
      Success!
    </body>
    </html>`);
    }
);

appBuilder
    .setResources(resourceRegistry, resourceDescriptors)
    .setWebRoot('/root', './client')
    .setFavicon('client/images/favicon.jpg')
    .setSessionStore(sessionStore)
    .end();

connectDb(function () {
    logger.info('connect mongodb success .......');
    var server = appBuilder.run(function () {
        // sessionStore.authByServer(server);
        var addr = server.address();
        logger.info('the server is running and listening at ' + addr.port);
    });
});