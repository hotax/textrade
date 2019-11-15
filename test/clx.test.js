var proxyquire = require('proxyquire'),
	dbSave = require('../finelets/db/mongoDb/dbSave')

describe('TexTrade', function () {
	let stubs, err;
	beforeEach(function () {
		stubs = {};
		err = new Error('any error message');
	})

	describe('Server', () => {
		describe('biz - 业务', () => {
			const code = 'foo'
			const ID_NOT_EXIST = '5ce79b99da3537277c3f3b66'
			let schema, testTarget, toCreate;
			let id, __v;

			beforeEach(function (done) {
				__v = 0
				return clearDB(done);
			});
			
			describe('Products - 产品', () => {
				const desc = 'desc',
				 content = 'content',
				 constructure = 'constructure', 
				 yarn = 'yarn',
				 spec = {width: '50cm', dnsty: '100x200', GSM: 65},
				 grey = {width: '60cm', dnsty: '110x200', GSM: 75},
				 creator = '5ce79b99da5837277c3f3b66',
				 remark = 'remark',
				 tags = 'tags',
				 state = 'draft'
				beforeEach(() => {
					toCreate = {code}
					schema = require('../db/schema/Product');
					testTarget = proxyquire('../server/biz/Product', stubs);
				})

				it('code is required', () => {
					return testTarget.create({})
						.should.be.rejectedWith()
				})

				it('code must be unique', () => {
					return dbSave(schema, toCreate)
						.then(() => {
							return testTarget.create(toCreate)
						})
						.should.be.rejectedWith()
				})

				it('搜索字段包括code, desc, content, constructure, yarn, tags, remark', () => {
					let products = []
					products.push(dbSave(schema, {code: 'foo'}))
					products.push(dbSave(schema, {code: '01', constructure: 'foo'}))
					products.push(dbSave(schema, {code: '02', desc: 'foo'}))
					products.push(dbSave(schema, {code: '03', tags: 'foo'}))
					products.push(dbSave(schema, {code: '04', content: 'foo'}))
					products.push(dbSave(schema, {code: '05', yarn: 'foo'}))
					products.push(dbSave(schema, {code: '06', remark: 'foo'}))
					return Promise.all(products)
						.then(() => {
							return testTarget.search({}, 'oo')
						})
						.then(data => {
							expect(data.length).eqls(7)
						})
				})

				it('create', () => {
					return testTarget.create({code, desc, content, constructure, 
						yarn, spec, grey, tags, creator, remark, state})
						.then(doc => {
							expect(doc.code).eql(code)
							expect(doc.desc).eql(desc)
							expect(doc.content).eql(content)
							expect(doc.constructure).eql(constructure)
							expect(doc.yarn).eql(yarn)
							delete doc.spec.id
							expect(doc.spec).eql(spec)
							delete doc.grey.id
							expect(doc.grey).eql(grey)
							expect(doc.tags).eql(tags)
							expect(doc.creator).eql(creator)
							expect(doc.remark).eql(remark)
							expect(doc.state).eql(state)
						})
				})

				it('all fields except "state" field are updateable', () => {				
					return dbSave(schema, {code: 'the code'})
						.then(doc => {
							id = doc.id
							__v = doc.__v
							return testTarget.update({id, __v, code, desc, content, constructure, 
								yarn, spec, grey, tags, creator, remark, state})
						})
						.then(doc => {
							expect(doc.code).eql(code)
							expect(doc.desc).eql(desc)
							expect(doc.content).eql(content)
							expect(doc.constructure).eql(constructure)
							expect(doc.yarn).eql(yarn)
							delete doc.spec.id
							expect(doc.spec).eql(spec)
							delete doc.grey.id
							expect(doc.grey).eql(grey)
							expect(doc.tags).eql(tags)
							expect(doc.creator).eql(creator)
							expect(doc.remark).eql(remark)
							expect(doc.state).undefined
						})
				})
			})

			describe('Suppliers - 供应商', () => {
				const name = 'name',
					address = 'address',
					account = 'account',
					link = 'link',
					tags = 'tags',
					contacts = [
						{name: 'foo', phone: 'p1', email: 'email1'},
						{name: 'fee', phone: 'p2', email: 'email2'}
					]

				beforeEach(() => {
					toCreate = {code}
					schema = require('../db/schema/Supplier')
					testTarget = require('../server/biz/Supplier')
				})

				it('code is required', () => {
					return testTarget.create({})
						.should.be.rejectedWith()
				})

				it('code must be unique', () => {
					return dbSave(schema, toCreate)
						.then(() => {
							return testTarget.create(toCreate)
						})
						.should.be.rejectedWith()
				})

				it('搜索字段包括name, code, address, tags', () => {
					let data = []
					data.push(dbSave(schema, {code: 'foo'}))
					data.push(dbSave(schema, {code: '01', name: 'foo'}))
					data.push(dbSave(schema, {code: '02', address: 'foo'}))
					data.push(dbSave(schema, {code: '03', tags: 'foo'}))
					data.push(dbSave(schema, {code: '04', link: 'foo'}))
					return Promise.all(data)
						.then(() => {
							return testTarget.search({}, 'oo')
						})
						.then(data => {
							expect(data.length).eqls(4)
						})
				})

				it('create', () => {
					return testTarget.create({code, name, address, account, link, tags, contacts})
						.then(doc => {
							expect(doc.code).eql(code)
							expect(doc.name).eql(name)
							expect(doc.address).eql(address)
							expect(doc.account).eql(account)
							expect(doc.link).eql(link)
							expect(doc.tags).eql(tags)
							delete doc.contacts[0].id
							delete doc.contacts[1].id
							expect(doc.contacts).eql(contacts)
						})
				})

				it('all fields are updateable', () => {				
					return dbSave(schema, {code: 'the code'})
						.then(doc => {
							id = doc.id
							__v = doc.__v
							return testTarget.update({id, __v, code, name, address, account, link, contacts, tags})
						})
						.then(doc => {
							expect(doc.code).eql(code)
							expect(doc.name).eql(name)
							expect(doc.address).eql(address)
							expect(doc.account).eql(account)
							expect(doc.link).eql(link)
							expect(doc.tags).eql(tags)
							delete doc.contacts[0].id
							delete doc.contacts[1].id
							expect(doc.contacts).eql(contacts)
							expect(doc.__v).eql(1)
						})
				})

			})

			describe('Customers - 客户', () => {
				const name = 'name',
					address = 'address',
					link = 'link',
					tags = 'tags',
					contacts = [
						{name: 'foo', phone: 'p1', email: 'email1'},
						{name: 'fee', phone: 'p2', email: 'email2'}
					]

				beforeEach(() => {
					toCreate = {code}
					schema = require('../db/schema/Customer');
					testTarget = proxyquire('../server/biz/Customer', stubs);
				})

				it('code is required', () => {
					return testTarget.create({})
						.should.be.rejectedWith()
				})

				it('code must be unique', () => {
					return dbSave(schema, toCreate)
						.then(() => {
							return testTarget.create(toCreate)
						})
						.should.be.rejectedWith()
				})

				it('搜索字段包括name, code, address, tags', () => {
					let data = []
					data.push(dbSave(schema, {code: 'foo'}))
					data.push(dbSave(schema, {code: '01', name: 'foo'}))
					data.push(dbSave(schema, {code: '02', address: 'foo'}))
					data.push(dbSave(schema, {code: '03', tags: 'foo'}))
					data.push(dbSave(schema, {code: '04', link: 'foo'}))
					return Promise.all(data)
						.then(() => {
							return testTarget.search({}, 'oo')
						})
						.then(data => {
							expect(data.length).eqls(4)
						})
						.catch(e => {
							throw e
						})
				})

				it('create', () => {
					return testTarget.create({code, name, address, link, tags, contacts})
						.then(doc => {
							expect(doc.code).eql(code)
							expect(doc.name).eql(name)
							expect(doc.address).eql(address)
							expect(doc.link).eql(link)
							expect(doc.tags).eql(tags)
							delete doc.contacts[0].id
							delete doc.contacts[1].id
							expect(doc.contacts).eql(contacts)
						})
				})

				it('all fields are updateable', () => {				
					return dbSave(schema, {code: 'the code'})
						.then(doc => {
							id = doc.id
							__v = doc.__v
							return testTarget.update({id, __v, code, name, address, link, contacts, tags})
						})
						.then(doc => {
							expect(doc.code).eql(code)
							expect(doc.name).eql(name)
							expect(doc.address).eql(address)
							expect(doc.link).eql(link)
							expect(doc.tags).eql(tags)
							delete doc.contacts[0].id
							delete doc.contacts[1].id
							expect(doc.contacts).eql(contacts)
						})
				})

			})

			describe('Employee - 员工', () => {
				const userId = 'foo',
					name = 'foo name',
					password = '999',
					email = 'email',
					pic = 'pic',
					isAdmin = true,
					roles = 'roles'

				beforeEach(() => {
					schema = require('../db/schema/Employee');
					testTarget = require('../server/biz/Employee');
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
			})
		})
	})
})