var proxyquire = require('proxyquire'),
	dbSchema = require('../server/db/models'),
	dbSave = require('@finelets/hyper-rest/db/mongoDb/SaveObjectToDb');

describe('All', function () {
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

	describe('平台', function () {
		describe('查询条件', function () {
			/* const Operstors = require('../finelets/db/QueryOperstorDef'); */
			//const condiBuild = require('../finelets/db/QueryCondiBuilder');
			//const field = 'fld';

			it('等于指定值', function () {
				/* var val = 'foo';
				expect(
					condiBuild({
						field: field,
						operator: Operstors.EQUALS,
						value: val
					})
				).eqls({ fld: val }); */
			});
		});
	});

	describe('数据库', function () {
		before(function (done) {
			if (mongoose.connection.db) return done();
			mongoose.connect(dbURI, done);
		});

		beforeEach(function (done) {
			clearDB(done);
		});

		describe('规格库', function () {
			const specDb = require('../server/db/Specifications');
			var spec;

			beforeEach(function () {
				spec = {
					code: 'foo'
				}
			});

			it('新增规格', function () {
				return specDb.add(spec)
					.then(function (data) {
						expect(data._doc).undefined;
						expect(data.id).not.null;
						expect(data.code).eqls('foo');
						expect(data.createDate).eqls(data.modifiedDate);
					})
			});

			it('读取指定标识的规格', function () {
				var doc;
				return dbSave(dbSchema.specs, spec)
					.then(function (data) {
						doc = data.toJSON();
						return specDb.findById(doc.id);
					})
					.then(function (data) {
						expect(data).eqls(doc);
					})
			});

		});

		describe('规格', function () {
			it('编码等于指定值', function () {
				var docInDb;
				const specsQuery = require('../server/db/SpecsQuery');

				return dbSave(dbSchema.specs, {
						code: 'Foo'
					})
					.then(function (doc) {
						docInDb = doc.toJSON();
						return specsQuery.find({
							code: 'Foo'
						});
					})
					.then(function (docs) {
						expect(docs.length).eqls(1);
						expect(docs[0]).eqls(docInDb);
					});
			});

			it('编码符合正则表达式', function () {
				var docInDb;
				const specsQuery = require('../server/db/SpecsQuery');

				return dbSave(dbSchema.specs, {
						code: 'sdAdFoosdcsdc'
					})
					.then(function (doc) {
						docInDb = doc.toJSON();
						var exp = new RegExp('fooS', 'i');
						return specsQuery.find({
							code: {
								$regex: exp
							}
						});
					})
					.then(function (docs) {
						expect(docs.length).eqls(1);
						expect(docs[0]).eqls(docInDb);
					});
			});
		});
	});
});