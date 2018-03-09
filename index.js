/**
 * Created by clx on 2017/10/9.
 */
/*const path = require('path'),
    //restDir = path.join(__dirname, './server/rests'),
    resourceDescriptors = require('@finelets/hyper-rest)./netup/rests/DirectoryResourceDescriptorsLoader').loadFrom(restDir),
    resourceRegistry = require('./netup/rests/ResourceRegistry'),
    //transitionsGraph = require('./netup/rests/StateTransitionsGraph'),
    //transitionsGraph = require('./server/ANSteel/StateTransitionsGraph'),
    graph = require('./server/ANSteel/StateTransitionsGraph'),
    transitionsGraph = require('./netup/rests/BaseTransitionGraph')(graph, resourceRegistry),
    connectDb = require('./netup/db/mongoDb/ConnectMongoDb'),
    appBuilder = require('./netup/express/AppBuilder');*/

const path = require('path'),
    restsDir = path.join(__dirname, './server/rests'),
    finelets = require('@finelets/hyper-rest'),
    resourceDescriptors = finelets.rests.directoryResourceDescriptorsLoader.loadFrom(restsDir),
    resourceRegistry = finelets.rests.resourceRegistry,
    connectDb = finelets.db.mongoDb.connectMongoDb,
    appBuilder = finelets.express.appBuilder;

var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'debug';

require('dotenv').config();
//resourceRegistry.setTransitionGraph(transitionsGraph);
var app = function () {
    const defaultPort = 33579;

    //配置view engine
    const moment = require('moment');
    var viewEngineFactory = finelets.express.handlebarsFactory(
        //按缺省规约：
        // partials目录为path.join(__dirname, './client/views') + '/partials'
        // views文件扩展名为'.hbs'
        'hbs', path.join(__dirname, './client/views'),
        {
            helpers: {
                dateMMDD: function (timestamp) {
                    return moment(timestamp).format('MM-DD');
                },
                dateYYYYMMDD: function (timestamp) {
                    return moment(timestamp).format('YYYY-MM-DD');
                }
            }
        });

    appBuilder
        .begin(__dirname)
        .setViewEngine(viewEngineFactory)
        .setResources(resourceRegistry, resourceDescriptors)
        .setWebRoot('/website', './client/public')
        .end();

    connectDb(function () {
        logger.info('connect mongodb success .......');
        var server = appBuilder.run(defaultPort, function () {
            var addr = server.address();
            logger.info('the server is running and listening at ' + addr.port);
        });
    });
};

finelets.boot(app);

