var proxyquire = require('proxyquire'),
    mongoose = require('mongoose'),
    dbSave = require('@finelets/hyper-rest/db/mongoDb/SaveObjectToDb');

describe('Application', function() {
    var func, stubs, err, reason, createReasonStub;
    before(function() {
        mongoose.Promise = global.Promise;
    });

    beforeEach(function(done) {
        stubs = {};
        err = new Error('any error message');
        reason = {
            reason: 'any reason representing any error'
        };
        createReasonStub = sinon.stub();
        stubs['@finelets/hyper-rest/app'] = {
            createErrorReason: createReasonStub
        };
        clearDB(done);
    });

    describe('数据库', function() {
        it('aass', function() {
            expect(1).eqls(1);
        })
    });
});