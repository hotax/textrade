require('dotenv').config();

const path = require('path'),
    //cookieParser = require('cookie-parser'),
    //cors = require('cors'),
    restsDir = path.join(__dirname, './server/rests'),
    resourceDescriptors = require('@finelets/hyper-rest/rests/DirectoryResourceDescriptorsLoader').loadFrom(restsDir),
    resourceRegistry = require('@finelets/hyper-rest/rests/ResourceRegistry'),
    graph = require('./server/flow'),
    transitionsGraph = require('@finelets/hyper-rest/rests/BaseTransitionGraph')(graph, resourceRegistry),
    connectDb = require('@finelets/hyper-rest/db/mongoDb/ConnectMongoDb'),
    sessionStore = require('@finelets/hyper-rest/session/MongoDbSessionStore')(1000 * 60 * 60 * 24), // set session for 1 day
    appBuilder = require('@finelets/hyper-rest/express/AppBuilder').begin(__dirname),
    // passport = require('passport'),
    // passport = require('./server/authGithub'),
    passport = require('./server/auth'),
    logger = require('@finelets/hyper-rest/app/Logger');
/* CLIENT_ORIGIN = process.env.CLIENT_ORIGIN,
SECRET = process.env.SECRET,
corsOptions = {
    origin: CLIENT_ORIGIN,
    credentials: true,
}; */

resourceRegistry.setTransitionGraph(transitionsGraph);

var app = appBuilder.getApp();
//app.use(cors(corsOptions))
//app.use(cookieParser(SECRET))
app.use(passport.initialize())
app.use(passport.session())
// app.get('/api/auth/github', passport.authenticate('github'));

/* app.get('/api/auth/callback', passport.authenticate('google', {
        failureRedirect: '/error'
    }),
    function (req, res) {
        res.send(`<html>
    <body>
      <script>
        window.opener.postMessage('success', '${CLIENT_ORIGIN}')
        window.close()
      </script>
      Success!
    </body>
    </html>`)
    }); */

appBuilder.setResources(resourceRegistry, resourceDescriptors)
    .setWebRoot('/', './client')
    .setFavicon('client/images/favicon.jpg')
    .setSessionStore(sessionStore)
    .end();


connectDb(function () {
    logger.info('connect mongodb success .......');
    var server = appBuilder.run(function () {
        var addr = server.address();
        logger.info('the server is running and listening at ' + addr.port);
    });
});