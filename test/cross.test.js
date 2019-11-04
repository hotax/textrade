var proxyquire = require('proxyquire'),
	logger = require('@finelets/hyper-rest/app/Logger'),
	dbSave = require('../finelets/db/mongoDb/dbSave');

describe('Cross', function () {
	var stubs, err;
	beforeEach(function () {
		stubs = {};
		err = new Error('any error message');
	});

	describe('Server', () => {
		describe('CrossMessageCenter', () => {
			it('publish', () => {
				const config = require('../server/CrossMessageCenterConfig');
				const msg = {
					msg: 'msg data'
				};
				let mqStart = sinon.stub();
				let mqPublish = sinon.spy();
				stubs['../finelets/mq/RabbitMessageCenter.js'] = {
					start: mqStart,
					publish: mqPublish
				};
				mqStart.withArgs(config).resolves();
				let crossMC = proxyquire('../server/CrossMessageCenter.js', stubs);

				return crossMC.start(config).then(() => {
					mqStart.callCount.should.eql(1);
					crossMC.importPurTransTaskCreated(msg);
					mqPublish.calledWith('cross', 'importPurTransTaskCreated', msg).calledOnce;
				});
			});
		});

		describe('biz - 业务模块', () => {
			const ID_NOT_EXIST = '5ce79b99da3537277c3f3b66'
			let schema, testTarget, toCreate;
			let id, __v;

			beforeEach(function (done) {
				__v = 0
				return clearDB(done);
			});

			describe('SaveNotExist', () => {
				const schema = require('../db/schema/bas/Part')
				const save = require('../finelets/db/mongoDb/saveNotExist')
				let data
				const uniqueFields = ['name', 'spec']
				let id, __v

				beforeEach(() => {
					data = {
						name: '料品'
					}
				})

				it('use findOneAndUpdate', () => {
					return save(schema, uniqueFields, data)
						.then(doc => {
							expect(doc.name).eqls(data.name)
							return schema.count()
						})
						.then(count => {
							expect(count).eqls(1)
						})
				})

				it('已存在一类似记录', () => {
					return dbSave(schema, {
							spec: 'spec',
							...data
						})
						.then(() => {
							return save(schema, uniqueFields, data)
						})
						.then(doc => {
							expect(doc.name).eqls(data.name)
							expect(doc.spec).undefined
							return schema.find()
						})
						.then(docs => {
							expect(docs.length).eqls(2)
						})
				})

				it('已存在', () => {
					return dbSave(schema, {
							spec: 'spec',
							...data
						})
						.then(() => {
							data = {
								spec: 'spec',
								...data
							}
							return save(schema, uniqueFields, data)
						})
						.then(doc => {
							expect({
								name: doc.name,
								spec: doc.spec
							}).eqls(data)
							return schema.find().lean()
						})
						.then(docs => {
							expect(docs.length).eqls(1)
						})
				})

				it('如果并行执行，则会出现Diplicated错', () => {
					let saves = []
					const wrap = () => {
						return save(schema, uniqueFields, data)
							.then((doc) => {
								return doc
							})
							.catch(e => {
								++times
							})
					}
					for (let i = 0; i < 2; i++) {
						saves.push(wrap())
					}
					return dbSave(schema, data)
						.then(() => {
							return Promise.all(saves)
						})
						.then(() => {
							should.fail('Failed if we come here!')
						})
						.catch(e => {
							expect(e.code).eqls(11000)
						})
				})
			})

			describe('BizDataExtractors', () => {
				const bizDataExtractors = require('../server/biz/BizDataExtractors');

				describe('ImportPurTransTask', () => {
					const extractor = bizDataExtractors.importPurTransTask;
					it('required fields', () => {
						const fields = ['transNo', 'partName', 'qty', 'amount', 'supplier'];
						try {
							extractor({});
						} catch (e) {
							for (let i = 0; i < fields.length; i++) {
								expect(e[i].fieldName).eqls(fields[i]);
							}
						}
						should.fail;
					});
				});
			});

			describe('bas - 基础资料', () => {
				let dbSaveStub;
				beforeEach(() => {
					dbSaveStub = sinon.stub();
					stubs['../../../finelets/db/mongoDb/saveNotExist'] = dbSaveStub;
				});

				describe('Parts - 料品', () => {
					const name = 'foo';
					const spec = 'foo spec';

					beforeEach(() => {
						toCreate = {
							name: name,
							spec: spec
						};
						schema = require('../db/schema/bas/Part');
						testTarget = proxyquire('../server/biz/bas/Parts', stubs);
					});

					it('name is required', () => {
						return testTarget.createNotExist({})
							.should.be.rejectedWith('part name is required')
					})

					it('createNotExist', () => {
						toCreate = {name}
						let created = {obj: 'any data of part'}
						dbSaveStub.withArgs(schema, ['name', 'brand', 'spec'], toCreate).resolves(created)
						return testTarget.createNotExist(toCreate)
							.then((data) => {
								expect(data).eql(created)
							})
					})

					describe("更新料品库存量", () => {
						const invQty = -100

						it('指定料品不存在', () => {
							return testTarget.updateInvQty(ID_NOT_EXIST, invQty)
								.should.be.rejectedWith()
						})

						it('库存量开账', () => {
							return dbSave(schema, toCreate)
								.then(data => {
									id = data.id
									return testTarget.updateInvQty(id, invQty)
								})
								.then(() => {
									return schema.findById(id)
								})
								.then((data) => {
									expect(data.qty).eql(invQty)
									expect(data.__v).eql(1)
								})
						})

						it('持续更新库存量', () => {
							const qty = 50
							return dbSave(schema, {...toCreate, qty})
								.then(data => {
									id = data.id
									expect(data.qty).eql(qty)
									return testTarget.updateInvQty(id, invQty)
								})
								.then(() => {
									return schema.findById(id)
								})
								.then((data) => {
									expect(data.qty).eql(invQty + qty)
									expect(data.__v).eql(1)
								})									
						})
					})

					it('findById', () => {
						return dbSave(schema, {
								name: 'foo'
							})
							.then((doc) => {
								return testTarget.findById(doc.id);
							})
							.then((doc) => {
								expect(doc.name).eqls('foo');
							});
					});

					it('findById - 未找到', () => {
						return testTarget.findById('5c349d1a6cf8de3cd4a5bc2c').then((doc) => {
							expect(doc).not.exist;
						});
					});

					describe('搜索料品', () => {
						it('搜索字段包括name, code, spec', () => {
							let saveParts = []
							saveParts.push(dbSave(schema, {
								type: 1,
								code: '01',
								name: '弹簧垫片螺母'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								code: '02',
								name: 'fee',
								spec: '弹簧垫片螺母'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								code: '弹簧垫片螺母',
								name: 'fee1',
								spec: 'spec1'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								code: '03',
								name: 'fee2',
								spec: 'spec2'
							}))
							return Promise.all(saveParts)
								.then(() => {
									return testTarget.search({
										type: 1
									}, '垫片')
								})
								.then(data => {
									expect(data.length).eqls(3)
								})
						})

						it('不区分大小写', () => {
							let saveParts = []
							saveParts.push(dbSave(schema, {
								type: 1,
								name: '弹簧垫片螺母'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								code: '01',
								name: 'fEe',
								spec: '齿轮油'
							}))
							return Promise.all(saveParts)
								.then(() => {
									return testTarget.search({
										type: 1
									}, 'Fee')
								})
								.then(data => {
									expect(data.length).eqls(1)
								})
						})

						it('可以使用通配符‘.’匹配一个字', () => {
							let saveParts = []
							saveParts.push(dbSave(schema, {
								type: 1,
								code: '01',
								name: '弹簧垫片螺母'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								code: '02',
								name: '弹螺母垫片螺'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								code: '03',
								name: 'fEe',
								spec: '齿轮油'
							}))
							return Promise.all(saveParts)
								.then(() => {
									return testTarget.search({
										type: 1
									}, '弹.垫')
								})
								.then(data => {
									expect(data.length).eqls(1)
								})
						})

						it('可以使用通配符‘*’', () => {
							let saveParts = []
							saveParts.push(dbSave(schema, {
								type: 1,
								name: '弹簧垫片螺母'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								name: '弹螺母垫片螺'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								name: 'fEe',
								spec: '齿轮油'
							}))
							return Promise.all(saveParts)
								.then(() => {
									return testTarget.search({
										type: 1
									}, '弹*垫')
								})
								.then(data => {
									expect(data.length).eqls(2)
								})
						})

						it('无条件', () => {
							let saveParts = []
							saveParts.push(dbSave(schema, {
								type: 1,
								name: '弹簧垫片螺母'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								name: '弹螺母垫片螺'
							}))
							saveParts.push(dbSave(schema, {
								type: 1,
								name: 'fEe',
								spec: '齿轮油'
							}))
							return Promise.all(saveParts)
								.then(() => {
									return testTarget.search({}, '.')
								})
								.then(data => {
									expect(data.length).eqls(3)
								})
						})
					})

					describe('update', () => {
						beforeEach(() => {
							testTarget = require('../server/biz/bas/Parts');
						})

						it('成功', () => {
							let version
							return dbSave(schema, toCreate)
								.then((doc) => {
									version = doc.__v
									return testTarget.update({
										id: doc.id,
										__v: version,
										type: 1,
										code: '23456',
										name: 'foo1',
										spec: 'spec',
										unit: 'm',
										img: 'img'
									});
								})
								.then((doc) => {
									expect(doc.__v > version).true
								});
						});
					})

				});

				describe('Suppliers - 供应商', () => {
					const name = 'foo';

					beforeEach(() => {
						toCreate = {name}
						schema = require('../db/schema/bas/Supplier');
						testTarget = proxyquire('../server/biz/bas/Suppliers', stubs);
					});

					it('name is required', () => {
						return testTarget
							.createNotExist({})
							.should.be.rejectedWith()
					});

					it('name should be unique', () => {
						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								return testTarget.create(toCreate);
							})
							.should.be.rejectedWith()
					});

					it('搜索字段包括name, code', () => {
						let saves = []
						saves.push(dbSave(schema, {
							type: 1,
							name: '弹簧垫片螺母'
						}))
						saves.push(dbSave(schema, {
							type: 1,
							name: 'fee'
						}))
						saves.push(dbSave(schema, {
							type: 1,
							code: '弹簧垫片螺母',
							name: 'fee1'
						}))
						saves.push(dbSave(schema, {
							type: 1,
							name: 'fee2'
						}))
						return Promise.all(saves)
							.then(() => {
								return testTarget.search({
									type: 1
								}, '垫片')
							})
							.then(data => {
								expect(data.length).eqls(2)
							})
					})

				});

				describe('Employee - 员工', () => {
					const userId = 'foo',
						name = 'foo name',
						password = '999',
						email = 'email',
						pic = 'pic',
						isAdmin = true,
						roles = 'roles'

					beforeEach(() => {
						schema = require('../db/schema/bas/Employee');
						testTarget = require('../server/biz/bas/Employee');
					});

					describe('create', () => {
						beforeEach(() => {
							toCreate = {
								name
							};
						});

						it('name is required', () => {
							return testTarget
								.create({})
								.then(() => {
									should.fail();
								})
								.catch((e) => {
									expect(e.name).eqls('ValidationError');
								});
						});

						it('name should be unique', () => {
							return dbSave(schema, toCreate)
								.then(() => {
									return testTarget.create(toCreate);
								})
								.then(() => {
									should.fail();
								})
								.catch((e) => {
									expect(e.name).eqls('MongoError');
								});
						});

						it('userId should be unique', () => {
							return dbSave(schema, toCreate)
								.then(() => {
									return testTarget.create({
										name: 'anotherName'
									});
								})
								.then(() => {
									should.fail();
								})
								.catch((e) => {
									expect(e.name).eqls('MongoError');
								});
						});

						it('成功创建', () => {
							return testTarget
								.create(toCreate)
								.then((doc) => {
									expect(doc.name).eql(name)
								})
						});
					})


					describe('Auth', () => {
						const userId = 'foo',
							name = 'foo name',
							password = '999',
							email = 'email',
							pic = 'pic',
							isAdmin = true,
							roles = 'roles'
						let id, employee

						beforeEach(() => {
							employee = {
								inUse: true,
								userId,
								password,
								name,
								isAdmin,
								roles,
								email,
								pic,
							}
						})

						it('非授权用户', () => {
							employee.inUse = false
							return dbSave(schema, employee)
								.then((doc) => {
									id = doc.id
									return testTarget.authenticate(userId, password)
								})
								.then(doc => {
									expect(doc).undefined
								})
						})

						it('用户账号不符', () => {
							return dbSave(schema, employee)
								.then((doc) => {
									id = doc.id
									return testTarget.authenticate('fee', password)
								})
								.then(doc => {
									expect(doc).undefined
								})
						})

						it('密码不符', () => {
							return dbSave(schema, employee)
								.then((doc) => {
									id = doc.id
									return testTarget.authenticate(userId, 'aa')
								})
								.then(doc => {
									expect(doc).undefined
								})
						})

						it('使用userId和password认证', () => {
							return dbSave(schema, employee)
								.then((doc) => {
									id = doc.id
									return testTarget.authenticate(userId, password)
								})
								.then(doc => {
									expect(doc).eql({
										id,
										userId,
										name,
										email,
										pic,
										isAdmin,
										roles
									})
								})
						})
					})

					describe('update', () => {
						it('成功', () => {
							return dbSave(schema, {
									name
								})
								.then((doc) => {
									id = doc.id
									__v = doc.__v
									return testTarget.update({
										id,
										__v,
										userId,
										name: 'foo1',
										email,
										pic
									});
								})
								.then((doc) => {
									expect(doc.userId).eqls(userId);
									expect(doc.name).eqls('foo1');
									expect(doc.email).eqls(email);
									expect(doc.pic).eqls(pic);
									expect(doc.__v > __v).true
								});
						});

						it('不可直接更新的字段', () => {
							return dbSave(schema, {
									name
								})
								.then((doc) => {
									id = doc.id
									__v = doc.__v
									return testTarget.update({
										id,
										__v,
										name,
										password,
										inUse: true,
										isAdmin,
										roles
									});
								})
								.then((doc) => {
									expect(doc.password).undefined;
									expect(doc.inUse).undefined;
									expect(doc.isAdmin).undefined;
									expect(doc.roles).undefined;
									expect(doc.__v > __v).true
								})

						})
					})

					describe('授权', () => {
						it('id type error', () => {
							return testTarget.authorize('notexist', {
									__v
								})
								.then((data) => {
									expect(data).false
								})
						});

						it('not exist', () => {
							return testTarget.authorize(ID_NOT_EXIST, {
									__v
								})
								.then((data) => {
									expect(!data).true
								})
						});

						it('版本不一致', () => {
							return dbSave(schema, {
									name
								})
								.then((doc) => {
									id = doc.id
									__v = doc.__v + 1
									return testTarget.authorize(id, {
										__v
									});
								})
								.then((data) => {
									expect(!data).true
								})
						});

						it('授权为系统管理员', () => {
							return dbSave(schema, {
									name
								})
								.then((doc) => {
									id = doc.id
									__v = doc.__v
									return testTarget.authorize(id, {
										__v,
										isAdmin: true
									});
								})
								.then((doc) => {
									expect(doc.inUse).true
									expect(doc.isAdmin).true
									expect(doc.roles).undefined
									expect(doc.__v).eql(__v + 1)
								})
						});

						it('授权为角色用户', () => {
							return dbSave(schema, {
									name
								})
								.then((doc) => {
									id = doc.id
									__v = doc.__v
									return testTarget.authorize(id, {
										__v,
										roles
									});
								})
								.then((doc) => {
									expect(doc.inUse).true
									expect(doc.isAdmin).undefined
									expect(doc.roles).eql(roles)
									expect(doc.__v).eql(__v + 1)
								})
						});

						it('收回授权', () => {
							return dbSave(schema, {
									name,
									inUse: true,
									isAdmin: true,
									roles
								})
								.then((doc) => {
									id = doc.id
									__v = doc.__v
									return testTarget.authorize(id, {
										__v
									});
								})
								.then((doc) => {
									expect(doc.inUse).undefined
									expect(doc.isAdmin).undefined
									expect(doc.roles).undefined
									expect(doc.__v).eql(__v + 1)
								})
						});

					})

					describe('修改密码', () => {
						it('not exist', () => {
							return testTarget.updatePassword(ID_NOT_EXIST, {
									oldPassword: '123',
									password: 'new 1234'
								})
								.then((data) => {
									expect(data).false
								})
						})

						it('旧密码不匹配', () => {
							return dbSave(schema, {
									name,
									password
								})
								.then((doc) => {
									id = doc.id
									__v = doc.__v
									return testTarget.updatePassword(id, {
										oldPassword: '123',
										password: 'new 1234'
									})
								})
								.then((data) => {
									expect(data).false
									return schema.findById(id)
								})
								.then((doc) => {
									expect(doc.password).eql(password);
									expect(doc.__v).eql(__v);
								})

						})

						it('成功', () => {
							return dbSave(schema, {
									name,
									password
								})
								.then((doc) => {
									id = doc.id
									__v = doc.__v
									return testTarget.updatePassword(id, {
										oldPassword: password,
										password: 'new 1234'
									})
								})
								.then((data) => {
									expect(data).true
									return schema.findById(id)
								})
								.then((doc) => {
									expect(doc.password).eql('new 1234');
									expect(doc.__v).eql(__v);
								})

						})

					})
				});
			});

			describe('Purchase', () => {
				const code = 'test-po-001',
					part = '5c349d1a6cf8de3cd4a5bc2c',
					supplier = '5c349d1a6cf8de3cd4a5bc3c',
					qty = 100,
					amount = 2345.56,
					price = 23,
					refNo = 'ref-po-001',
					state = 'Draft',
					remark = 'remark',
					applier = '6c349d1a6cf8de3cd4a5bccc'
				
				let transaction

				beforeEach(() => {
					toCreate = {part, qty, amount}
					schema = require('../db/schema/pur/Purchase');
					testTarget = require('../server/biz/pur/Purchases');
				});

				describe('create', () => {
					beforeEach(() => {
						toCreate = {code, part, supplier, qty, price, amount, refNo, applier, remark}
					});

					it('part is required', () => {
						return testTarget.create({qty, amount})
							.then(() => {
								should.fail();
							})
							.catch((e) => {
								expect(e.name).eqls('ValidationError');
							}); 
					});

					it('qty is required', () => {
						return testTarget.create({part, amount})
							.then(() => {
								should.fail();
							})
							.catch((e) => {
								expect(e.name).eqls('ValidationError');
							}); 
					});		

					it('amount is required', () => {
						return testTarget.create({part, qty})
							.then(() => {
								should.fail();
							})
							.catch((e) => {
								expect(e.name).eqls('ValidationError');
							}); 
					});	
					

					it('创建时状态只能是Draft', () => {
						toCreate = {part, qty, amount, state: 'Open' }
						return testTarget
							.create(toCreate)
							.then(() => {
								should.fail();
							})
							.catch((e) => {
								expect(e.message).eql('the state of a new purchase must be Draft')
							}); 
					});

					it('成功创建', () => {
						return testTarget
							.create(toCreate)
							.then((doc) => {
								expect(doc.code).eql(code)
								expect(doc.part).eql(part)
								expect(doc.supplier).eql(supplier)
								expect(doc.qty).eql(qty)
								expect(doc.price).eql(price)
								expect(doc.amount).eql(amount)
								expect(doc.state).eql('Draft')
								expect(doc.refNo).eql(refNo)
								expect(doc.remark).eql(remark)
								expect(doc.createdAt).exist
								expect(doc.modifiedDate).exist
								expect(doc.__v).eql(0)
							})
					});
				})

				describe('update', () => {
					it('不可直接更新的字段', () => {
						const left = amount,
						appDate = new Date(),
						reviewer = applier,
						reviewDate = appDate, 
						creator = applier,
						createDate = appDate

						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								__v = doc.__v
								return testTarget.update({
									id,
									__v,
									part, qty, amount,
									left, state: 'Review', 
									applier, appDate, reviewer, reviewDate, creator, createDate
								});
							})
							.then((doc) => {
								expect(doc.part).eql(part)
								expect(doc.qty).eql(qty)
								expect(doc.amount).eql(amount)
								expect(doc.state).eql('Draft')
								expect(doc.__v).eql(1)
							})

					})

					it('成功', () => {
						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								__v = doc.__v
								return testTarget.update({
									id,
									__v,
									code,
									part: applier,
									supplier, 
									qty: qty + 1,
									price,
									amount: amount + 1,
									refNo, remark
								});
							})
							.then((doc) => {
								expect(doc.code).eql(code)
								expect(doc.part).eql(applier)
								expect(doc.supplier).eql(supplier)
								expect(doc.qty).eql(qty + 1)
								expect(doc.price).eql(price)
								expect(doc.amount).eql(amount + 1) 
								expect(doc.state).eql('Draft')
								expect(doc.refNo).eql(refNo)
								expect(doc.remark).eql(remark)
								expect(doc.__v).eql(1)
							})
					});
				})

				describe('commit', () => {
					const type = 'commit'

					it('not exist', () => {
						return testTarget.doTransaction(ID_NOT_EXIST, type, {
								__v, actor: applier
							})
							.then((data) => {
								expect(!data).true
							})
					});

					it('版本不一致', () => {
						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								__v = doc.__v + 1
								return testTarget.doTransaction(id, type, {
									__v, actor: applier
								});
							})
							.then((data) => {
								expect(!data).true
							})
					});

					it('状态必须处于Draft或Unapproved', () => {
						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								return schema.findById(id)
							})
							.then((doc) => {
								doc.state = 'Open'
								return doc.save()
							})
							.then((doc) => {
								id = doc.id
								__v = doc.__v
								return testTarget.doTransaction(id, type, {
									__v, actor: applier
								});
							})
							.then((data) => {
								expect(!data).true
							})
					});

					it('无申请人', () => {
						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								__v = doc.__v
								return testTarget.doTransaction(id, type, {
									__v
								});
							})
							.then((data) => {
								expect(!data).true
							})
					});

					it('可缺省申请日期', () => {
						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								__v = doc.__v
								return testTarget.doTransaction(id, type, {
									__v, actor: applier
								});
							})
							.then(doc => {
								transaction = doc
								expect(transaction.parent).eql(id)
								expect(transaction.type).eql(type)
								expect(transaction.actor).eql(applier)
								expect(transaction.date).exist
								return schema.findById(id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.__v).eql(__v + 1)
								expect(doc.state).eql('Review')
								expect(doc.applier).eql(applier)
								expect(doc.appDate).eql(transaction.date)
							})
					});

					it('指定申请日期', () => {
						appDate = new Date()
						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								__v = doc.__v
								return testTarget.doTransaction(id, type, {
									__v, actor: applier, date: appDate
								});
							})
							.then(doc => {
								transaction = doc
								expect(transaction.parent).eql(id)
								expect(transaction.type).eql(type)
								expect(transaction.actor).eql(applier)
								expect(transaction.date).eql(appDate.toJSON())
								return schema.findById(id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.__v).eql(__v + 1)
								expect(doc.state).eql('Review')
								expect(doc.applier).eql(applier)
								expect(doc.appDate).eql(transaction.date)
							})
					});
				})
				
				describe('review', () => {
					const type = 'review'
					const reviewer = applier;

					beforeEach(() => {
						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								return schema.findById(id)
							})
							.then((doc) => {
								doc.state = 'Review'
								return doc.save()
							})
							.then((doc) => {
								expect(doc.state).eql('Review')
								id = doc.id
								__v = doc.__v
							})
					})

					it('not exist', () => {
						return testTarget.doTransaction(ID_NOT_EXIST, type, {
								__v, actor: reviewer
							})
							.then((data) => {
								expect(!data).true
							})
					});

					it('版本不一致', () => {
						__v = __v + 1
						return testTarget.doTransaction(id, type, {
							__v, actor: reviewer
						})
							.then((data) => {
								expect(!data).true
							})
					});

					it('必须处于Review状态', () => {
						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								__v = doc.__v
								return testTarget.doTransaction(id, type, {
									__v, actor: reviewer
								});
							})
							.then((data) => {
								expect(!data).true
							})
					});

					it('必须指定审批人', () => {
						return testTarget.doTransaction(id, type, {__v})
							.then((data) => {
								expect(!data).true
							})
					});

					it('可缺省审批日期', () => {
						return testTarget.doTransaction(id, type, {__v, actor: reviewer})
							.then(doc => {
								transaction = doc
								expect(transaction.parent).eql(id)
								expect(transaction.type).eql(type)
								expect(transaction.data).eql({pass: false})
								expect(transaction.actor).eql(reviewer)
								expect(transaction.date).exist
								return schema.findById(id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.__v).eql(__v + 1)
								expect(doc.state).eql('Unapproved')
								expect(doc.reviewer).eql(reviewer)
								expect(doc.reviewDate).eql(transaction.date)
							})
					});

					it('指定审批日期', () => {
						const reviewDate = new Date() 
						return testTarget.doTransaction(id, type, {__v, actor: reviewer, date: reviewDate})
							.then(doc => {
								transaction = doc
								expect(transaction.parent).eql(id)
								expect(transaction.type).eql(type)
								expect(transaction.data).eql({pass: false})
								expect(transaction.actor).eql(reviewer)
								expect(transaction.date).eql(reviewDate.toJSON())
								return schema.findById(id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.__v).eql(__v + 1)
								expect(doc.state).eql('Unapproved')
								expect(doc.reviewer).eql(reviewer)
								expect(doc.reviewDate).eql(transaction.date)
							})
					});

					it('审批通过', () => {
						const reviewDate = new Date() 
						return testTarget.doTransaction(id, type, {
							__v, actor: reviewer, date: reviewDate, pass: true, remark
						})
							.then(doc => {
								transaction = doc
								expect(transaction.parent).eql(id)
								expect(transaction.type).eql(type)
								expect(transaction.data).eql({pass: true})
								expect(transaction.actor).eql(reviewer)
								expect(transaction.date).eql(reviewDate.toJSON())
								expect(transaction.remark).eql(remark)
								return schema.findById(id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.__v).eql(__v + 1)
								expect(doc.state).eql('Open')
								expect(doc.reviewer).eql(reviewer)
								expect(doc.reviewDate).eql(transaction.date)
							})
					});
				})

				describe('inv - 到货入库', () => {
					const type = 'inv',
					invDate = new Date(),
					invQty = 34,
					refNo = 'ref001',
					loc = 'the loc';
					let inv, publisherSpy

					beforeEach(() => {
						publisherSpy = sinon.spy()
						stubs['../../PublishMsg'] = publisherSpy
						inv = {qty: invQty, refNo, loc}
						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								return schema.findById(id)
							})
							.then((doc) => {
								doc.state = 'Open'
								return doc.save()
							})
							.then((doc) => {
								expect(doc.state).eql('Open')
								__v = doc.__v
							})
					})

					it('由id指定的采购单必须存在', () => {
						return testTarget.doTransaction(ID_NOT_EXIST, type, {
								__v, actor: applier, date: invDate, data: inv
							}) 
							.should.be.rejectedWith()
					});

					it('版本不一致', () => {
						__v = __v + 1
						return testTarget.doTransaction(id, type, {
							__v, actor: applier, date: invDate, data: inv
						})
						.should.be.rejectedWith()
					});

					it('必须处于Open状态', () => {
						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								__v = doc.__v
								return testTarget.doTransaction(id, type, {
									__v, actor: applier, date: invDate, data: inv
								});
							})
							.should.be.rejectedWith()
					});

					it('未指定入库交易者', () => {
						return testTarget.doTransaction(id, type, {
							__v, date: invDate, data: inv
						})
						.should.be.rejectedWith()
					});

					it('必须给出入库数量, 且不能为0', () => {
						inv.qty = 0
						return testTarget.doTransaction(id, type, {
							__v, actor: applier, date: invDate, data: inv
						})
						.should.be.rejectedWith()
					});

					it('必须给出入库数量, 且不能为字符串0', () => {
						inv.qty = '0'
						return testTarget.doTransaction(id, type, {
							__v, actor: applier, date: invDate, data: inv
						})
						.should.be.rejectedWith()
					});

					it('指定入库交易日期', () => {
						testTarget = proxyquire('../server/biz/pur/Purchases', stubs)
						return testTarget.doTransaction(id, type, {
							__v, actor: applier, date: invDate, data: inv, remark
						})
						.then(doc => {
							expect(publisherSpy).calledWith('poInInv', doc).calledOnce
							expect(doc.parent).eql(id)
							expect(doc.type).eql(type)
							expect(doc.data).eql(inv)
							expect(doc.actor).eql(applier)
							expect(doc.remark).eql(remark)
							expect(doc.date).eql(invDate.toJSON())
							return schema.findById(id)
						})
						.then(doc => {
							doc = doc.toJSON()
							expect(doc.__v).eql(__v + 1)
							expect(doc.state).eql('Open')
							expect(doc.left).undefined
						})
					});

					it('可缺省入库交易日期', () => {
						testTarget = proxyquire('../server/biz/pur/Purchases', stubs)
						return testTarget.doTransaction(id, type, {
							__v, actor: applier, data: inv, remark
						})
						.then(doc => {
							expect(publisherSpy).calledWith('poInInv', doc).calledOnce
							expect(doc.parent).eql(id)
							expect(doc.type).eql(type)
							expect(doc.data).eql(inv)
							expect(doc.actor).eql(applier)
							expect(doc.remark).eql(remark)
							expect(doc.date).exist
							return schema.findById(id)
						})
						.then(doc => {
							doc = doc.toJSON()
							expect(doc.__v).eql(__v + 1)
							expect(doc.state).eql('Open')
							expect(doc.left).undefined
						})
					});
				})

				describe('消费采购入库消息', () => {
					const invQty = 34

					it('由id指定的采购单不存在', () => {
						return testTarget.poInInv(ID_NOT_EXIST, invQty) 
							.should.be.rejectedWith()
					});

					it('更新料品库存量失败', () => {
						const partInvStub = sinon.stub()
						stubs['../bas/Parts'] = {updateInvQty: partInvStub}
						testTarget = proxyquire('../server/biz/pur/Purchases', stubs)

						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								return schema.findById(id)
							})
							.then(doc => {
								partInvStub.withArgs(doc.part, invQty).rejects()
								return testTarget.poInInv(id, invQty)
							})
							.should.be.rejectedWith()
					});

					it('更新料品库存量成功，更新采购单在单量', () => {
						const partInvStub = sinon.stub()
						stubs['../bas/Parts'] = {updateInvQty: partInvStub}
						testTarget = proxyquire('../server/biz/pur/Purchases', stubs)

						return dbSave(schema, toCreate)
							.then((doc) => {
								id = doc.id
								return schema.findById(id)
							})
							.then(doc => {
								partInvStub.withArgs(doc.part, invQty).resolves()
								return testTarget.poInInv(id, invQty)
							})
							.then(() => {
								return schema.findById(id)
							})
							.then((doc) => {
								expect(doc.left).eql(qty - invQty)
							})
					});							
				})
			})

			describe('Withdraw - 领料', () => {
				const code = '12345',
				part = '5c349d1a6cf8de3cd4a5bc2c',
				qty = '200',
				actor = '6c349d1addd8de3cd4a5bc2c',
				date = new Date(),
				remark = 'sth remark'
				let msgSender;
				beforeEach(() => {
					msgSender = sinon.spy();
					stubs['../../PublishMsg'] = msgSender
					toCreate = {code, part, qty, actor, date, remark}
					schema = require('../db/schema/inv/Withdraw');
					testTarget = proxyquire('../server/biz/inv/Withdraws', stubs);
				});

				it('必须给出单号', () => {
					delete toCreate.code
					return testTarget.create(toCreate)
						.should.be.rejectedWith()
				})

				it('单号不可重复', () => {
					return dbSave(schema, toCreate)
					.then(() => {
						return testTarget.create(toCreate)
					})
					.should.be.rejectedWith()
				})

				it('必须指定料品', () => {
					delete toCreate.part
					return testTarget.create(toCreate)
						.should.be.rejectedWith()
				})

				it('必须给领用数量', () => {
					delete toCreate.qty
					return testTarget.create(toCreate)
						.should.be.rejectedWith()
				})

				it('领用数量必须为数字，且不为0', () => {
					toCreate.qty = '0'
					return testTarget.create(toCreate)
						.should.be.rejectedWith()
				})

				it('必须指定领用人', () => {
					delete toCreate.actor
					return testTarget.create(toCreate)
						.should.be.rejectedWith()
				})

				it('必须指定领用日期', () => {
					delete toCreate.date
					return testTarget.create(toCreate)
						.should.be.rejectedWith()
				})

				it('成功', () => {
					return testTarget.create(toCreate)
						.then((doc) => {
							expect(msgSender).calledWith('outInv', doc).calledOnce
							expect(doc.qty).eql(qty * 1)
						})
				})
			})

			describe('Inv - 库存', () => {
				let schema, dbSaveStub, testTarget;
				let transData;
				const transNo = 'no.000234';
				const aDate = new Date();

				beforeEach(() => {});

				describe('InInvs - 采购入库单', () => {
					const purId = '5c349d1a6cf8de3cd4a5bc2c';
					let msgSender;
					beforeEach(() => {
						msgSender = sinon.spy();
						stubs['../../CrossMessageCenter'] = {
							poInInv: msgSender
						};
						dbSaveStub = sinon.stub();
						stubs['../../../finelets/db/mongoDb/dbSave'] = dbSaveStub;
						transData = {
							po: purId,
							qty: 100,
							date: aDate,
							loc: 'loc',
							source: transNo
						};
						schema = require('../db/schema/inv/InInv');

						testTarget = proxyquire('../server/biz/inv/InInvs', stubs);
					});

					it('source duplicated', () => {
						return dbSave(schema, transData)
							.then(() => {
								return testTarget.create(transData);
							})
							.then(() => {
								should.fail('Failed');
							})
							.catch((e) => {
								expect(e).eqls('InInv: Source ' + transNo + ' is duplicated');
							});
					});

					it('create', () => {
						const created = {
							data: 'created data'
						};

						dbSaveStub.withArgs(schema, transData).resolves(created);
						return testTarget.create(transData).then((data) => {
							expect(data).eqls(created);
							expect(msgSender.withArgs(data)).calledOnce;
						});
					});
				})

				describe('OutInvs - 出库单', () => {
					const code = '12345',
							part = '5c349d1a6cf8de3cd4a5bc2c',
							qty = '200',
							actor = '6c349d1addd8de3cd4a5bc2c',
							date = new Date(),
							source = 'abcd'

					beforeEach(() => {
						toCreate = {code, part, qty, actor, date, remark, source}
						schema = require('../db/schema/inv/OutInv');
						testTarget = require('../server/biz/inv/OutInvs')
					});

					it('create', () => {
						return dbSave(schema, toCreate)
						// return testTarget.create(toCreate)
							.then((data) => {
								expect(data).eqls(created)
							})
					})
				});

				describe('Invs - 库存', () => {
					let poInInvStub;

					beforeEach(() => {
						poInInvStub = sinon.stub();
						stubs['../pur/Purchases'] = {poInInv: poInInvStub};
						invs = proxyquire('../server/biz/inv/Invs', stubs);
					})

					describe('处理采购入库单', () => {
						const parent = '123455';
						const qty = 210;
						const doc = {parent, data: {qty}}

						beforeEach(() => {
							poInInvStub.withArgs(parent, qty).resolves(true);
						})

						it('处理成功', () => {
							return invs.inInv(doc)
								.then((result) => {
									expect(result).true;
								})
						})
					})
				})

				describe('Loc - 库位', () => {
					describe('Loc - 入库单更新库位', () => {
						const partId = '5c349d1a6cf8de3cd4a5bc2c';
						const purId = '12345';
						const qty = 230;
						const loc = 'foo';
						const date = new Date();
						let inInvDoc;
						const locSchema = require('../db/schema/inv/Loc');
						let LOC, po;

						beforeEach(() => {
							inInvDoc = {
								po: purId,
								qty: qty,
								loc: loc,
								date: date
							};
							po = sinon.stub({
								getPart: () => {}
							});
							stubs['../pur/Purchases'] = po;
							po.getPart.withArgs(purId).resolves({
								id: partId
							});
							LOC = proxyquire('../server/biz/inv/Locs', stubs);
						});

						it('首次入库', () => {
							return LOC.inInv(inInvDoc)
								.then((result) => {
									expect(result).true;
									return locSchema.find({
										loc: loc,
										part: partId,
										date: date
									});
								})
								.then((docs) => {
									expect(docs.length).eqls(1);
									let doc = docs[0].toJSON();
									expect(doc.qty).eqls(qty);
								});
						});

						it('使用缺省库位和缺省日期', () => {
							delete inInvDoc.loc;
							delete inInvDoc.date;
							return LOC.inInv(inInvDoc)
								.then((result) => {
									expect(result).true;
									return locSchema.find({
										loc: '@@@CROSS@@@',
										part: partId
									});
								})
								.then((docs) => {
									expect(docs.length).eqls(1);
									let doc = docs[0].toJSON();
									expect(doc.qty).eqls(qty);
									expect(doc.date).exist;
								});
						});
					});

					describe('Loc - 查询库位状态', () => {
						const locSchema = require('../db/schema/inv/Loc'),
							partSchema = require('../db/schema/bas/Part'),
							LOC = require('../server/biz/inv/Locs');

						it('无任何记录', () => {
							return LOC.listLocState()
								.then((result) => {
									expect(result).eqls({
										items: []
									});
								})
						});

						it('库位料品存量表', () => {
							const part1 = '5c349d1a6cf8de3cd4a5bc2c',
								part2 = '5c349d1a6cf8de3cd4a5bc3c',
								part3 = '5c349d1a6cf8de3cd4a5bc4c';
							const parts = [{
									_id: part1,
									name: 'foo',
									spec: 'foo spec'
								},
								{
									_id: part2,
									name: 'fee'
								},
								{
									_id: part3,
									name: 'fuu'
								}
							];
							let dbParts;
							let addParts = []
							parts.forEach(p => {
								addParts.push(dbSave(partSchema, p))
							})

							return Promise.all(addParts)
								.then(data => {
									dbParts = data
									expect(dbParts.length).eqls(3)
									return dbSave(locSchema, {
										loc: '002',
										part: part1,
										qty: 100
									})
								})
								.then(() => {
									return dbSave(locSchema, {
										loc: '002',
										part: part2,
										qty: 200
									})
								})
								.then(() => {
									return dbSave(locSchema, {
										loc: '001',
										part: part1,
										qty: 100
									})
								})
								.then(() => {
									return dbSave(locSchema, {
										loc: '001',
										part: part1,
										qty: 100
									})
								})
								.then(() => {
									return LOC.listLocState()
								})
								.then((result) => {
									let items = result.items
									expect(items.length).eqls(3);
									expect(items).eqls([{
											loc: '001',
											part: {
												id: part1,
												name: 'foo',
												spec: 'foo spec'
											},
											qty: 200
										},
										{
											loc: '002',
											part: {
												id: part1,
												name: 'foo',
												spec: 'foo spec'
											},
											qty: 100
										},
										{
											loc: '002',
											part: {
												id: part2,
												name: 'fee'
											},
											qty: 200
										}
									])
								})
						});
					});
				})


			});
		});
	});
});