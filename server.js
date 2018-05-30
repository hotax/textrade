require('dotenv').config();

const path = require('path'),
    restsDir = path.join(__dirname, './server/rests'),
    resourceDescriptors = require('@finelets/hyper-rest/rests/DirectoryResourceDescriptorsLoader').loadFrom(restsDir),
    resourceRegistry = require('@finelets/hyper-rest/rests/ResourceRegistry'),
    graph = require('./server/flow'),
    transitionsGraph = require('@finelets/hyper-rest/rests/BaseTransitionGraph')(graph, resourceRegistry),
    connectDb = require('@finelets/hyper-rest/db/mongoDb/ConnectMongoDb'),
    sessionStore = require('@finelets/hyper-rest/session/MongoDbSessionStore')(1000 * 60 * 60 * 24), // set session for 1 day
    appBuilder = require('@finelets/hyper-rest/express/AppBuilder'),
    logger = require('@finelets/hyper-rest/app/Logger');

resourceRegistry.setTransitionGraph(transitionsGraph);

appBuilder.begin(__dirname)
    .setResources(resourceRegistry, resourceDescriptors)
    .setWebRoot('/', './client')
    .setFavicon('client/images/favicon.jpg')
    .setSessionStore(sessionStore)
    .end();

connectDb(function() {
    logger.info('connect mongodb success .......');
    var server = appBuilder.run(function() {
        var addr = server.address();
        logger.info('the server is running and listening at ' + addr.port);
    });
});