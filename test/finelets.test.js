var proxyquire = require('proxyquire');

describe('Finelets', function () {
	const bodyParser = require('body-parser'),
		requestAgent = require('supertest');

	var app, stubs, err
	beforeEach(function () {
		stubs = {}
		err = new Error('any error message')
		app = require('express')();
		app.use(bodyParser.json());
		request = requestAgent(app);
	})

	describe('Db Entity', () => {
		let dbModel, entityConfig, entity
		const toCreate = {
			fld: 'foo'
		}
		const dbSave = require('../finelets/db/mongoDb/dbSave')

		const createEntity = require('../finelets/db/mongoDb/CreateEntity')

		before(() => {
			const mongoose = require('mongoose'),
				Schema = mongoose.Schema,
				transformOption = require('@finelets/hyper-rest/db/mongoDb/DocTransformOption')

			const fooSchema = new Schema({
				fld: String,
				fld1: String,
				type: Number
			}, {
				...transformOption,
				timestamps: {
					updatedAt: 'modifiedDate'
				}
			})

			fooSchema.index({fld: 1}, {unique: true});
			fooSchema.index({fld1: 1, type:1}, {unique: true});

			dbModel = mongoose.model('Foo', fooSchema);
		})

		beforeEach((done) => {
			entityConfig = {
				schema: dbModel,
				updatables: ['fld']
			}
			entity = createEntity(entityConfig)
			return clearDB(done);
		})

		describe('ifUnmodifiedSince', () => {
			it('版本不一致', () => {
				return dbSave(dbModel, toCreate)
					.then((doc) => {
						return entity.ifUnmodifiedSince(doc.id, new Date().toJSON())
					})
					.then((result) => {
						expect(result).false;
					});
			})

			it('一致', () => {
				return dbSave(dbModel, toCreate)
					.then((doc) => {
						return entity.ifUnmodifiedSince(doc.id, doc.modifiedDate)
					})
					.then((result) => {
						expect(result).true;
					});
			});
		})

		describe('update', () => {
			it('版本不一致', () => {
				return dbSave(dbModel, toCreate)
					.then((doc) => {
						return entity.update({
							id: doc.id,
							modifiedDate: new Date().toJSON()
						});
					})
					.then((doc) => {
						expect(doc).not.exist;
					});
			});

			it('成功', () => {
				let modifiedDate
				return dbSave(dbModel, toCreate)
					.then((doc) => {
						modifiedDate = doc.modifiedDate
						return entity.update({
							id: doc.id,
							modifiedDate: modifiedDate,
							fld: 'fld'
						});
					})
					.then((doc) => {
						expect(doc.fld).eqls('fld')
						expect(doc.modifiedDate > modifiedDate).true
					});
			});

			it('删除字段值', () => {
				let modifiedDate
				return dbSave(dbModel, toCreate)
					.then((doc) => {
						modifiedDate = doc.modifiedDate
						expect(doc.fld).eqls('foo')
						return entity.update({
							id: doc.id,
							modifiedDate: modifiedDate,
						});
					})
					.then((doc) => {
						expect(doc.fld).undefined
						expect(doc.modifiedDate > modifiedDate).true
					});
			});

			it('以空字串删除字段值', () => {
				let modifiedDate
				return dbSave(dbModel, toCreate)
					.then((doc) => {
						modifiedDate = doc.modifiedDate
						expect(doc.fld).eqls('foo')
						return entity.update({
							id: doc.id,
							modifiedDate: modifiedDate,
							fld: ''
						});
					})
					.then((doc) => {
						expect(doc.fld).undefined
						expect(doc.modifiedDate > modifiedDate).true
					});
			});

			it('可以定义一个字段更新逻辑', () => {
				let modifiedDate
				const setvalues = (doc, data) => {
					doc.fld = 'fee'
					expect(data.fld).eqls('fld')
				}
				entityConfig.setValues = setvalues
				return dbSave(dbModel, toCreate)
					.then((doc) => {
						modifiedDate = doc.modifiedDate
						expect(doc.fld).eqls('foo')
						return entity.update({
							id: doc.id,
							modifiedDate: modifiedDate,
							fld: 'fld'
						})
					})
					.then((doc) => {
						expect(doc.fld).eqls('fee')
						expect(doc.modifiedDate > modifiedDate).true
					});
			});
		})

		describe('search', () => {
			beforeEach(() => {
				entityConfig.searchables = ['fld', 'fld1']
			})

			it('文档中无任何搜索字段', () => {
				let saves = []
				saves.push(dbSave(dbModel, {
					type: 1
				}))
				return Promise.all(saves)
					.then(() => {
						return entity.search({}, '.')
					})
					.then(data => {
						expect(data.length).eqls(0)
					})
			})

			it('无条件搜索时文档中无任何搜索字段', () => {
				let saves = []
				saves.push(dbSave(dbModel, {
					type: 1
				}))
				return Promise.all(saves)
					.then(() => {
						return entity.search({}, '')
					})
					.then(data => {
						expect(data.length).eqls(1)
					})
			})

			it('搜索字段包括fld, fld1', () => {
				let saves = []
				saves.push(dbSave(dbModel, {
					type: 1,
					fld: '弹簧垫片螺母'
				}))
				saves.push(dbSave(dbModel, {
					type: 1,
					fld: 'fee',
					fld1: '弹簧垫片螺母'
				}))
				saves.push(dbSave(dbModel, {
					type: 1,
					fld: 'fee1',
					fld1: 'spec1'
				}))
				return Promise.all(saves)
					.then(() => {
						return entity.search({
							type: 1
						}, '垫片')
					})
					.then(data => {
						expect(data.length).eqls(2)
					})
			})

			it('不区分大小写', () => {
				let saves = []
				saves.push(dbSave(dbModel, {
					type: 1,
					fld1: 'foo',
					fld: '弹簧垫片螺母'
				}))
				saves.push(dbSave(dbModel, {
					type: 1,
					fld1: 'fuu',
					fld: 'fEe'
				}))
				return Promise.all(saves)
					.then(() => {
						return entity.search({
							type: 1
						}, 'Fee')
					})
					.then(data => {
						expect(data.length).eqls(1)
					})
			})

			it('可以使用通配符‘.’匹配一个字', () => {
				let saves = []
				saves.push(dbSave(dbModel, {
					type: 1,
					fld1: 'foo',
					fld: '弹簧垫片螺母'
				}))
				saves.push(dbSave(dbModel, {
					type: 1,
					fld1: 'fuu',
					fld: '弹螺母垫片螺'
				}))
				return Promise.all(saves)
					.then(() => {
						return entity.search({
							type: 1
						}, '弹.垫')
					})
					.then(data => {
						expect(data.length).eqls(1)
					})
			})

			it('可以使用通配符‘*’', () => {
				let saves = []
				saves.push(dbSave(dbModel, {
					type: 1,
					fld1: 'foo',
					fld: '弹簧垫片螺母'
				}))
				saves.push(dbSave(dbModel, {
					type: 1,
					fld1: 'fuu',
					fld: '弹螺母垫片螺'
				}))
				saves.push(dbSave(dbModel, {
					type: 1,
					fld1: 'fee',
					fld: 'fEe'
				}))
				return Promise.all(saves)
					.then(() => {
						return entity.search({
							type: 1
						}, '弹*垫')
					})
					.then(data => {
						expect(data.length).eqls(2)
					})
			})

			it('无条件', () => {
				let saves = []
				saves.push(dbSave(dbModel, {
					type: 1,
					fld1: 'foo',
					fld: '弹簧垫片螺母'
				}))
				saves.push(dbSave(dbModel, {
					type: 1,
					fld1: 'fuu',
					fld: '弹螺母垫片螺'
				}))
				saves.push(dbSave(dbModel, {
					type: 1,
					fld1: 'fee',
					fld: 'fEe'
				}))
				return Promise.all(saves)
					.then(() => {
						return entity.search({}, '')
					})
					.then(data => {
						expect(data.length).eqls(3)
					})
			})
		})

		describe('findById', () => {
			let id
		
			it('未找到', () => {
				const idNotExist = '5c349d1a6cf8de3cd4a5bc2c'
				return entity.findById(idNotExist)
					.then(data => {
						expect(data).not.exist
					})

			})

			it('找到', () => {
				let doc
				return dbSave(dbModel, toCreate)
					.then(data => {
						doc = data
						return entity.findById(doc.id)
					})
					.then(doc => {
						expect(doc).eqls(doc)
					})
			})

		})

		describe('create', () => {
			it('新增', () => {
				let docCreated
				return entity.create(toCreate)
					.then(data => {
						docCreated = data
						return dbModel.findById(docCreated.id)
					})
					.then(doc => {
						expect(doc.toJSON()).eqls(docCreated)
					})
			})

			it('记录重复', () => {
				return dbSave(dbModel, toCreate)
					.then(data => {
						return entity.create(toCreate)
					})
					.then(() => {
						should.fail('Failed when come here ')
					})
					.catch(err => {
						expect(err.code).eqls(11000)
					})
			})

		})

	})

	describe('JWT - User Authentication', () => {
		const defaultUriLogin = '/auth/login'
		const username = 'foo'
		const password = 'pwd'
		const userId = '12343445'
		const user = {
			id: userId
		}
		const secret = 'any secret'
		let defaultSignOptions
		const token = 'dummytoken'
		let jsonwebtoken
		let jwt, jwtConfig, authenticate

		beforeEach(() => {
			process.env.JWT_SECRET = secret
			defaultSignOptions = {
				issuer: 'finelets',
				expiresIn: "12h",
				algorithm: "HS256"
			}

			jsonwebtoken = sinon.stub({
				sign: () => {},
				verify: () => {}
			})
			stubs['jsonwebtoken'] = jsonwebtoken
			authenticate = sinon.stub()
			getUser = sinon.stub()
			jwtConfig = {
				authenticate,
				getUser
			}
			jwt = proxyquire('@finelets/hyper-rest/jwt/ExpressJwt', stubs)
		})

		it('未配置用户身份认证方法', () => {
			delete jwtConfig.authenticate
			expect(() => {
				jwt(app, jwtConfig)
			}).throws('authenticate should be required for JWT')
		})

		it('未配置getUser方法', () => {
			delete jwtConfig.getUser
			expect(() => {
				jwt(app, jwtConfig)
			}).throws('getUser should be required for JWT')
		})

		it('进行用户身份认证时出错', (done) => {
			authenticate.withArgs(username, password).rejects()
			jwt(app, jwtConfig)
			request.post(defaultUriLogin)
				.send({
					username,
					password
				})
				.expect(500, done)
		})

		it('未通过用户身份认证', (done) => {
			authenticate.withArgs(username, password).resolves(null)
			jwt(app, jwtConfig)
			request.post(defaultUriLogin)
				.send({
					username,
					password
				})
				.expect(403, done)
		})

		it('登录成功', (done) => {
			authenticate.withArgs(username, password).resolves(user)
			jsonwebtoken.sign.withArgs({
				user: userId
			}, secret, defaultSignOptions).returns(token)
			jwt(app, jwtConfig)
			request.post(defaultUriLogin)
				.send({
					username,
					password
				})
				.expect(200, {
					user,
					token
				}, done)
		})

		it('请求头部需要给出authorization信息', (done) => {
			jwt(app, jwtConfig)
			request.get('/api/foo')
				.expect(401, done)
		})

		it('请求头部需要给出authorization信息格式为"Bearer token"', (done) => {
			jwt(app, jwtConfig)
			request.get('/api/foo')
				.set('Authorization', 'aBearer ' + token)
				.expect(401, done)
		})

		it('token无效', (done) => {
			jsonwebtoken.verify.withArgs(token, secret, {
				issuer: 'finelets',
				algorithms: ["HS256"]
			}).throws(err)
			jwt(app, jwtConfig)
			request.get('/api/foo')
				.set('Authorization', 'Bearer ' + token)
				.expect(403, done)
		})

		it('token有效', (done) => {
			const decoded = {
				user: userId
			}
			jsonwebtoken.verify.withArgs(token, secret, {
				issuer: 'finelets',
				algorithms: ["HS256"]
			}).returns(decoded)
			getUser.withArgs(userId).resolves(user)
			jwt(app, jwtConfig)

			let called = false
			app.get('/api/foo', (req, res) => {
				expect(req.user).eqls(user)
				called = true
				return res.end()
			})
			request.get('/api/foo')
				.set('Authorization', 'Bearer ' + token)
				.expect(200, () => {
					expect(called).true
					done()
				})
		})

		it('设置token过期时间', (done) => {
			authenticate.withArgs(username, password).resolves(user)
			getUser.withArgs(userId).resolves(user)
			jwtConfig.expiresIn = 1
			jwtConfig.loginUrl = '/auth/auth'
			jwtConfig.baseUrl = '/foo'

			jwt = require('@finelets/hyper-rest/jwt/ExpressJwt')
			jwt(app, jwtConfig)

			let called = 0
			app.get('/foo/foo', (req, res) => {
				expect(req.user).eqls(user)
					++called
				return res.end()
			})

			request.post('/auth/auth') // LOGIN
				.send({
					username,
					password
				})
				.expect(200)
				.end((err, res) => {
					expect(res.body.user).eqls(user)
					request.get('/foo/foo') // First get
						.set('Authorization', 'Bearer ' + res.body.token)
						.expect(200, () => {
							expect(called).eqls(1)
							setTimeout(() => {
								request.get('/foo/foo') // Second get after 1.5s
									.set('Authorization', 'Bearer ' + res.body.token)
									.expect(403, () => {
										expect(called).eqls(1)
										done()
									})
							}, 1000)
						})

				})
		})
	})

	describe('CSVStream', function () {
		const csvStream = require('../finelets/streams/CSVStream'),
			row = {
				data: 'any data of row'
			};
		var parseRow, saveRow, stream;

		beforeEach(function () {
			parseRow = sinon.stub();
			saveRow = sinon.stub();
			stream = csvStream(saveRow, parseRow);
		})

		it('数据格式错', function (done) {
			parseRow.withArgs('foo').throws(err);
			stream.on('error', function (e) {
				e.message.should.eql('Row 0 data format error');
				done();
			});

			stream.write('foo\r\n');
			stream.end();
		});

		it('可忽略的数据行', function (done) {
			parseRow.withArgs('foo').returns(null);
			stream.on('finish', function () {
				saveRow.callCount.should.eql(0);
				done();
			});

			stream.write('foo\r\n');
			stream.end();
		});

		it('保存失败', function (done) {
			parseRow.withArgs('foo').returns(row);
			saveRow.withArgs(row).rejects(err);
			stream.on('error', function (e) {
				e.should.eql(err);
				saveRow.callCount.should.eql(1);
				done();
			});

			stream.write('foo\r\n');
			stream.end();
		});

		it('单一流块 - single chunk', function (done) {
			parseRow.withArgs('foo').returns(row);
			saveRow.withArgs(row).resolves();

			stream.on('finish', function () {
				saveRow.callCount.should.eql(1);
				done();
			});

			stream.write('foo\r\n');
			stream.end();
		});

		it('多流块 - multiple chunk', function (done) {
			parseRow.withArgs('foo').returns(row);
			saveRow.withArgs(row).resolves();

			stream.on('finish', function () {
				saveRow.callCount.should.eql(3);
				done();
			});

			stream.write('foo\r\nfoo\r\n');
			stream.write('foo\r\n');
			stream.end();
		});

		it('Row seperated by multiple chunk', function (done) {
			parseRow.withArgs('foo,fee,fuu').returns(row);
			saveRow.withArgs(row).resolves();

			stream.on('finish', function () {
				saveRow.callCount.should.eql(1);
				done();
			});

			stream.write('foo,');
			stream.write('fee,');
			stream.write('fuu\r\n');
			stream.end();
		});
	})

	describe('JsonValueType', () => {
		const types = require('../finelets/csv/JsonValueTypes')
		it('各种类型', () => {
			expect(types.Default('foo')).eqls('foo')
			expect(types.Default('"foo"')).eqls('foo')
			expect(types.Default('')).undefined
			expect(types.Number(' 123.45 ')).eqls(123.45)
			expect(types.Number('123px')).eqls(null)
			expect(types.Number('')).eqls(undefined)
			expect(types.Date('')).eqls(undefined)
			expect(types.Date('abc')).eqls(null)
			expect(types.Date('2018/9/22')).eqls(new Date(2018, 8, 22).toJSON())
			expect(types.Date('2018-9-22')).eqls(new Date(2018, 8, 22).toJSON())
			expect(types.Bool('')).eqls(undefined)
			expect(types.Bool('abc')).eqls(null)
			expect(types.Bool(' TrUe ')).true
			expect(types.Bool('false')).false
		})
	})

	describe('CSVToJson', () => {
		let csvToJson

		beforeEach(() => {
			csvToJson = require('../finelets/csv/CSVToJson')()
		})

		it('未定义任何字段', () => {
			expect(() => {
				csvToJson.parse('abc')
			}).throws('no column is defined')
		})

		it('数据格式和字段个数不一致', () => {
			csvToJson.addColumn('foo')
			expect(csvToJson.parse('abc,123')).null
		})

		it('字段无法解析', () => {
			let type = sinon.stub()
			type.withArgs('abc').returns(null)
			csvToJson.addColumn('foo', type)
			expect(csvToJson.parse('abc')).null
		})

		it('正确解析', () => {
			let type = sinon.stub()
			type.withArgs('abc').returns(123)
			type.withArgs('def').returns(456)
			csvToJson
				.addColumn('foo', type)
				.addColumn('fee', type)
			expect(csvToJson.parse('abc,def')).eqls({
				foo: 123,
				fee: 456
			})
		})

		it('缺省字段类型于./JsonValueTypes.Default定义', () => {
			let defaultType = sinon.stub()
			stubs['./JsonValueTypes'] = {
				Default: defaultType
			}
			defaultType.withArgs('abc').returns('234')
			csvToJson = proxyquire('../finelets/csv/CSVToJson.js', stubs)()

			csvToJson.addColumn('foo')
			expect(csvToJson.parse('abc')).eqls({
				foo: '234'
			})
		})

		it('空字段值', () => {
			let type = sinon.stub()
			type.withArgs('abc').returns(123)
			type.withArgs('def').returns(undefined)
			csvToJson.addColumn('foo', type)
			csvToJson.addColumn('fee', type)
			expect(csvToJson.parse('abc,def')).eqls({
				foo: 123
			})
		})
	})

	describe('ExtractBasedRule', () => {
		const fields = ['fee', 'fuu']
		const rules = {
			rule: 'define rules according npm rulebased-validator'
		}
		let validate
		const result = {
			fee: "fee",
			fuu: "fuu"
		}
		const obj = Object.assign({
			foo: 'foo'
		}, result)

		let extract;

		beforeEach(() => {
			validate = sinon.stub()
			stubs['rulebased-validator'] = {
				validate: validate
			}
			extract = proxyquire('../finelets/common/ExtractBasedRule', stubs)(fields, rules)
		})
		it('未通过数据校验', () => {
			validate.withArgs(result, rules).returns(err)

			try {
				extract(obj)
			} catch (e) {
				expect(e).eqls(err)
			}
			should.fail
		})

		it('正确抽取数据', () => {
			validate.withArgs(result, rules).returns(true)

			expect(extract(obj)).eql(result)

		})

		it('CreateDataExtractors', () => {
			const fooFields = ['fooField']
			const fooRules = {
				fooRule: 'fooRule'
			}
			const fooExtractor = {
				foo: 'foo'
			}
			const feeFields = ['feeField']
			const feeRules = {
				feeRule: 'feeRule'
			}
			const feeExtractor = {
				fee: 'fee'
			}
			const createExtractor = sinon.stub()
			stubs['./ExtractBasedRule'] = createExtractor

			const config = {
				foo: {
					fields: fooFields,
					rules: fooRules
				},
				fee: {
					fields: feeFields,
					rules: feeRules
				},
			}

			createExtractor.withArgs(fooFields, fooRules).returns(fooExtractor)
			createExtractor.withArgs(feeFields, feeRules).returns(feeExtractor)
			const createDataExtractors = proxyquire('../finelets/common/CreateDataExtractors', stubs)
			let extractors = createDataExtractors(config)

			expect(extractors.foo).eqls(fooExtractor)
			expect(extractors.fee).eqls(feeExtractor)
		})
	})

	describe('TaskExecutionStates', () => {
		const createFsm = require('../finelets/fsm/TaskExecutionStates')
		const id = 1234,
			eventPayload = {
				eventPayload: 'eventPayload'
			}
		let fsm, statesGraph, context;

		beforeEach(() => {
			context = sinon.stub({
				getState: () => {},
				updateState: () => {}
			})
			statesGraph = {
				context: context,
				transitions: [{
					when: 'foo',
					from: 0,
					to: 1
				}]
			}
			fsm = createFsm(statesGraph)
		})

		it('未指定状态迁移图', () => {
			expect(() => {
				createFsm()
			}).throws('States transition graph is not defined')

		})

		it('状态迁移图中未实现context上下文接口', () => {
			expect(() => {
				createFsm({})
			}).throws('context interface is not defined in states transition graph')
		})

		it('状态迁移图中未实现context.getState接口', () => {
			expect(() => {
				createFsm({
					context: {}
				})
			}).throws('context.getState interface is not defined in states transition graph')
		})

		it('未读到当前状态', () => {
			context.getState.withArgs(id).rejects(err)
			return fsm.trigger('invalid', eventPayload, id)
				.then(() => {
					should.fail('should not come here')
				})
				.catch((e) => {
					expect(e).eqls(err)
				})
		})

		it('当前状态下收到无效消息', () => {
			context.getState.withArgs(id).resolves(0)
			return fsm.trigger('invalid', eventPayload, id)
				.then((state) => {
					expect(state).eqls(0)
				})
		})

		it('当前状态下发生迁移时状态更新失败', () => {
			context.getState.withArgs(id).resolves(0)
			context.updateState.withArgs(1, eventPayload, id).rejects(err)
			return fsm.trigger('foo', eventPayload, id)
				.then(() => {
					should.fail('should not come here')
				})
				.catch((e) => {
					expect(e).eqls(err)
				})
		})

		it('当前状态下发生迁移', () => {
			context.getState.withArgs(id).resolves(0)
			context.updateState.withArgs(1, eventPayload, id).resolves()
			return fsm.trigger('foo', eventPayload, id)
				.then((state) => {
					expect(state).eqls(1)
				})
		})

		it('当前状态下发生迁移时执行新状态的入口动作失败，则迁移失败', () => {
			let action = sinon.stub()
			statesGraph = {
				context: context,
				transitions: [{
					when: 'foo',
					from: 0,
					to: {
						state: 1,
						entry: action
					}
				}]
			}
			fsm = createFsm(statesGraph)
			context.getState.withArgs(id).resolves(0)
			action.withArgs(eventPayload, id).rejects(err)
			return fsm.trigger('foo', eventPayload, id)
				.then(() => {
					should.fail('should not come here')
				})
				.catch((e) => {
					expect(e).eqls(err)
				})
		})

		it('当前状态下发生迁移时执行当前状态的出口动作失败，则迁移失败', () => {
			let action = sinon.stub()
			statesGraph = {
				context: context,
				transitions: [{
					when: 'foo',
					from: {
						state: 0,
						exit: action
					},
					to: 1
				}]
			}
			fsm = createFsm(statesGraph)
			context.getState.withArgs(id).resolves(0)
			action.withArgs(eventPayload, id).rejects(err)
			return fsm.trigger('foo', eventPayload, id)
				.then(() => {
					should.fail('should not come here')
				})
				.catch((e) => {
					expect(e).eqls(err)
				})
		})

		it('当前状态下发生迁移时可执行出口和入口动作', () => {
			let action = sinon.stub()
			statesGraph = {
				context: context,
				transitions: [{
					when: 'foo',
					from: {
						state: 0,
						exit: action
					},
					to: {
						state: 1,
						entry: action
					}
				}]
			}
			fsm = createFsm(statesGraph)
			context.getState.withArgs(id).resolves(0)
			action.withArgs(eventPayload, id).resolves()
			return fsm.trigger('foo', eventPayload, id)
				.then((state) => {
					expect(state).eqls(1)
				})
		})

		it('可以以字符串定义出口/入口/守护动作', () => {
			let action = sinon.stub()
			context.fooEntry = action
			context.fooExit = action
			context.fooGuard = action
			statesGraph = {
				context: context,
				transitions: [{
					when: 'foo',
					from: {
						state: 0,
						exit: 'fooExit'
					},
					guard: 'fooGuard',
					to: {
						state: 1,
						entry: 'fooEntry'
					}
				}]
			}
			fsm = createFsm(statesGraph)
			context.getState.withArgs(id).resolves(0)
			action.withArgs(eventPayload, id).resolves(true)
			return fsm.trigger('foo', eventPayload, id)
				.then((state) => {
					expect(state).eqls(1)
					expect(action.callCount).eqls(3)
				})
		})

		it('守护异常', () => {
			let action = sinon.stub()
			statesGraph = {
				context: context,
				transitions: [{
					when: 'foo',
					from: 0,
					guard: action,
					to: 1
				}]
			}
			fsm = createFsm(statesGraph)
			context.getState.withArgs(id).resolves(0)
			action.withArgs(eventPayload, id).rejects(err)
			return fsm.trigger('foo', eventPayload, id)
				.then(() => {
					should.fail('should not come here')
				})
				.catch((e) => {
					expect(e).eqls(err)
				})
		})

		it('未通过守护', () => {
			let action = sinon.stub()
			statesGraph = {
				context: context,
				transitions: [{
					when: 'foo',
					from: 0,
					guard: action,
					to: 1
				}]
			}
			fsm = createFsm(statesGraph)
			context.getState.withArgs(id).resolves(0)
			action.withArgs(eventPayload, id).resolves(false)
			return fsm.trigger('foo', eventPayload, id)
				.then((state) => {
					expect(state).eqls(0)
				})
		})

		it('通过守护', () => {
			let action = sinon.stub()
			statesGraph = {
				context: context,
				transitions: [{
					when: 'foo',
					from: 0,
					guard: action,
					to: 1
				}]
			}
			fsm = createFsm(statesGraph)
			context.getState.withArgs(id).resolves(0)
			action.withArgs(eventPayload, id).resolves(true)
			return fsm.trigger('foo', eventPayload, id)
				.then((state) => {
					expect(state).eqls(1)
				})
		})
	})
})