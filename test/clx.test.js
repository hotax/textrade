var proxyquire = require('proxyquire'),
    dbSave = require('@finelets/hyper-rest/db/mongoDb/SaveObjectToDb');

describe('Application', function () {
    var func, stubs, err, reason, createReasonStub;
    before(function () {
        mongoose.Promise = global.Promise;
    });

    beforeEach(function () {
        stubs = {};
        err = new Error('any error message');
        reason = {
            reason: 'any reason representing any error'
        };
        createReasonStub = sinon.stub();
        stubs['@finelets/hyper-rest/app'] = {
            createErrorReason: createReasonStub
        };
    });

    describe('数据库', function () {
        beforeEach(function (done) {
            if (mongoose.connection.db) return done();
            mongoose.connect(dbURI, done);
        });

        it('aass', function () {
            var x = 1;
            expect(x).eqls(1);
        });
    });
});
