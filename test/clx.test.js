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
			})
			
			describe('Products', () => {
				let product

				beforeEach(() => {
					toCreate = {code}
					schema = require('../db/schema/Product');
				})

				describe('产品', () => {
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
						testTarget = require('../server/biz/Product')
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

				describe('产品供应商', () => {
					const supplier = '5de79b77da3537277c3f3b88',
					name = 'supplier product name'
	
					beforeEach(() => {
						testTarget = require('../server/biz/ProductSupplier')
						return dbSave(schema, toCreate)
							.then(doc => {
								product = doc.id
							})
					})
	
					describe('findById', () => {
						let subId, productDoc

						beforeEach(() => {
							return schema.findById(product)
								.then(doc => {
									productDoc = doc
									doc.suppliers.push({supplier, code, name})
									return doc.save()
								})
								.then(doc => {
									subId = doc.suppliers[0].id
								})
						})
	
						it('任何出错均抛出例外', () => {
							return testTarget.findById('abc')
								.should.be.rejectedWith()
						})
		
						it('指定产品不存在', () => {
							return testTarget.findById(ID_NOT_EXIST)
								.then(doc => {
									expect(doc).not.exist
								})
						})
		
						it('指定产品供应商不存在', () => {
							return testTarget.findById(product, ID_NOT_EXIST)
								.then(doc => {
									expect(doc).not.exist
								})
						})
	
						it('正确', () => {
							return testTarget.findById(product, subId)
								.then(doc => {
									expect(doc.product).eql(product)
									expect(doc.id).eql(subId)
									expect(doc.supplier).eql(supplier)
									expect(doc.code).eql(code)
									expect(doc.name).eql(name)
									expect(doc.quots).not.exist
									expect(doc.__v).eql(productDoc.__v)
									expect(doc.updatedAt).eql(productDoc.updatedAt)
								})
						})
					})
	
					describe('create', () => {
						it('任何出错均抛出例外', () => {
							return testTarget.create('abc')
								.should.be.rejectedWith()
						})
		
						it('指定产品不存在', () => {
							return testTarget.create(ID_NOT_EXIST)
								.should.be.rejectedWith()
						})
		
						it('未指定供应商', () => {
							return testTarget.create(product)
								.should.be.rejectedWith()
						})
		
						it('创建产品供应商', () => {
							let productSupplier
							return testTarget.create(product, {supplier, code, name})
								.then(doc => {
									productSupplier = doc
									return schema.findById(productSupplier.product)
								})
								.then(doc => {
									expect(doc.suppliers.length).eql(1)
									const ps = doc.suppliers.id(productSupplier.id).toJSON()
									expect(ps.supplier).eql(supplier)
									expect(ps.name).eql(name)
									expect(ps.code).eql(code)
								})
						})
	
						it('重复创建产品供应商', () => {
							return schema.findById(product)
								.then(doc => {
									doc.suppliers.push({supplier: ID_NOT_EXIST, name, code})
									doc.suppliers.push({supplier, name, code})
									return doc.save()
								})
								.then(() => {
									return testTarget.create(product, {supplier})
								})
								.should.be.rejectedWith()
						})
					})
	
					describe('list', () => {
						it('指定产品不存在', () => {
							return testTarget.list(ID_NOT_EXIST)
								.then(suppliers => {
									expect(suppliers.length).eql(0)
								})
						})
	
						it('产品无该任何供应商', () => {
							return testTarget.list(product)
								.then(suppliers => {
									expect(suppliers.length).eql(0)
								})
						})
	
						it('正确查询', () => {
							return schema.findById(product)
								.then(doc => {
									doc.suppliers.push({supplier, name, code})
									return doc.save()
								})
								.then(() => {
									return testTarget.list(product)
								})
								.then(suppliers => {
									expect(suppliers.length).eql(1)
									expect(suppliers[0].supplier).eql(supplier)
									expect(suppliers[0].name).eql(name)
									expect(suppliers[0].code).eql(code)
									expect(suppliers[0].quots).not.exist
								})
						})
					})
				})

				describe('产品供应商报价', () => {
					const supplier = '5de79b77da3537277c3f3b88'
					let subId

					beforeEach(() => {
						testTarget = require('../server/biz/ProductSupplierQuot')
						return dbSave(schema, {code, suppliers: [{supplier}]})
							.then(doc => {
								product = doc.id
								subId = doc.suppliers[0].id
								expect(doc.code).eql(code)
								expect(doc.suppliers[0].supplier).eql(supplier)
							})
					})
	
					describe('findById', () => {
						let subId, productDoc
						beforeEach(() => {
							return schema.findById(product)
								.then(doc => {
									productDoc = doc
									doc.suppliers.push({supplier, code, name})
									return doc.save()
								})
								.then(doc => {
									subId = doc.suppliers[0].id
								})
						})
	
						it('任何出错均抛出例外', () => {
							return testTarget.findById('abc')
								.should.be.rejectedWith()
						})
		
						it('指定产品不存在', () => {
							return testTarget.findById(ID_NOT_EXIST)
								.then(doc => {
									expect(doc).not.exist
								})
						})
		
						it('指定产品供应商不存在', () => {
							return testTarget.findById(product, ID_NOT_EXIST)
								.then(doc => {
									expect(doc).not.exist
								})
						})
	
						it('正确', () => {
							return testTarget.findById(product, subId)
								.then(doc => {
									expect(doc.product).eql(product)
									expect(doc.id).eql(subId)
									expect(doc.supplier).eql(supplier)
									expect(doc.code).eql(code)
									expect(doc.name).eql(name)
									expect(doc.__v).eql(productDoc.__v)
									expect(doc.updatedAt).eql(productDoc.updatedAt)
								})
						})
					})
	
					describe('create', () => {
						const price = 23.48

						it('任何出错均抛出例外', () => {
							return testTarget.create('abc')
								.should.be.rejectedWith()
						})
		
						it('指定产品不存在', () => {
							return testTarget.create(ID_NOT_EXIST)
								.should.be.rejectedWith()
						})
		
						it('未指定产品供应商标识', () => {
							return testTarget.create(product)
								.should.be.rejectedWith()
						})

						it('指定产品供应商标识不存在', () => {
							return testTarget.create(product, ID_NOT_EXIST)
								.should.be.rejectedWith()
						})
		
						it('未提供报价', () => {
							return testTarget.create(product, subId, {})
								.should.be.rejectedWith()
						})

						it('创建最简单产品供应商报价', () => {
							let quot
							return testTarget.create(product, subId, {price})
								.then(doc => {
									quot = doc
									expect(quot.date).exist
									expect(quot.type).eql('enquery')
									expect(quot.price).eql(price)
									expect(quot.ref).not.exist
									expect(quot.remake).not.exist
									return schema.findById(quot.product)
								})
								.then(doc => {
									doc = doc.toJSON()
									expect(doc.suppliers[0].id).eql(quot.productSupplierId)
									expect(doc.suppliers[0].quots[0].id).eql(quot.id)
									expect(doc.suppliers[0].quots[0].date).eql(quot.date)
									expect(doc.suppliers[0].quots[0].type).eql(quot.type)
									expect(doc.suppliers[0].quots[0].price).eql(quot.price)
									expect(doc.suppliers[0].quots[0].ref).not.exist
									expect(doc.suppliers[0].quots[0].remake).not.exist
								})
						})

						it('创建产品供应商报价', () => {
							const type = 'offer',
								date = new Date(),
								ref = '5de79b77da3537277c3f3999',
								remark = 'foo remark'
							let quot
							return testTarget.create(product, subId, {date, type, price, ref, remark})
								.then(doc => {
									quot = doc
									expect(quot.date).eql(date.toJSON())
									expect(quot.type).eql(type)
									expect(quot.price).eql(price)
									expect(quot.ref).eql(ref)
									expect(quot.remark).eql(remark)
									return schema.findById(quot.product)
								})
								.then(doc => {
									doc = doc.toJSON()
									expect(doc.suppliers[0].id).eql(quot.productSupplierId)
									expect(doc.suppliers[0].quots[0].id).eql(quot.id)
									expect(doc.suppliers[0].quots[0].date).eql(quot.date)
									expect(doc.suppliers[0].quots[0].type).eql(quot.type)
									expect(doc.suppliers[0].quots[0].price).eql(quot.price)
									expect(doc.suppliers[0].quots[0].ref).eql(quot.ref)
									expect(doc.suppliers[0].quots[0].remark).eql(quot.remark)
								})
						})
					})
	
					describe('list', () => {
						it('指定产品不存在', () => {
							return testTarget.list(ID_NOT_EXIST)
								.then(suppliers => {
									expect(suppliers.length).eql(0)
								})
						})
	
						it('产品无该任何供应商', () => {
							return testTarget.list(product)
								.then(suppliers => {
									expect(suppliers.length).eql(0)
								})
						})
	
						it('正确查询', () => {
							return schema.findById(product)
								.then(doc => {
									doc.suppliers.push({supplier, name, code})
									return doc.save()
								})
								.then(() => {
									return testTarget.list(product)
								})
								.then(suppliers => {
									expect(suppliers.length).eql(1)
									expect(suppliers[0].supplier).eql(supplier)
									expect(suppliers[0].name).eql(name)
									expect(suppliers[0].code).eql(code)
								})
						})
					})
				})
			})

			describe('Suppliers - 供应商', () => {
				const name = 'name',
					address = 'address',
					account = 'account',
					link = 'link',
					creator = '5ce79b99da5837277c3f3b66',
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
					return testTarget.create({code, name, address, account, link, creator, tags, contacts})
						.then(doc => {
							expect(doc.code).eql(code)
							expect(doc.name).eql(name)
							expect(doc.address).eql(address)
							expect(doc.account).eql(account)
							expect(doc.link).eql(link)
							expect(doc.creator).eql(creator)
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
							return testTarget.update({id, __v, code, name, address, account, link, creator, contacts, tags})
						})
						.then(doc => {
							expect(doc.code).eql(code)
							expect(doc.name).eql(name)
							expect(doc.address).eql(address)
							expect(doc.account).eql(account)
							expect(doc.link).eql(link)
							expect(doc.creator).eql(creator)
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
					creator = '5ce79b99da5837277c3f3b66',
					tags = 'tags',
					contacts = [
						{name: 'foo', phone: 'p1', email: 'email1'},
						{name: 'fee', phone: 'p2', email: 'email2'}
					]

				beforeEach(() => {
					toCreate = {code}
					schema = require('../db/schema/Customer');
					testTarget = require('../server/biz/Customer');
				})

				describe('创建', () => {
					let customer

					it('必须给出客户编号', () => {
						return testTarget.create({})
							.should.be.rejectedWith()
					})

					it('客户编号必须唯一', () => {
						return dbSave(schema, toCreate)
							.then(() => {
								return testTarget.create(toCreate)
							})
							.should.be.rejectedWith()
					})

					it('创建一最简单的客户', () => {
						return testTarget.create(toCreate)
							.then(doc => {
								customer = doc
								expect(doc.code).eql(code)
								return schema.findById(doc.id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.code).eql(customer.code)
							})
					})

					it('创建客户', () => {
						return testTarget.create({code, name, address, link, creator, tags})
							.then(doc => {
								customer = doc
								expect(doc.code).eql(code)
								expect(doc.name).eql(name)
								expect(doc.address).eql(address)
								expect(doc.link).eql(link)
								expect(doc.creator).eql(creator)
								expect(doc.tags).eql(tags)
								return schema.findById(doc.id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.code).eql(customer.code)
								expect(doc.name).eql(customer.name)
								expect(doc.address).eql(customer.address)
								expect(doc.link).eql(customer.link)
								expect(doc.creator).eql(customer.creator)
								expect(doc.tags).eql(customer.tags)
							})
					})
				})
				
				describe('搜索', () => {
					// 由于采用了finelets框架实现，故此例也可无需测试
					it('未搜索到任何客户资料', () => {
						return testTarget.search({}, 'oo')
							.then(docs => {
								expect(docs.length).eqls(0)
							})
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

					// 由于采用了finelets框架实现，故此例也可无需测试
					it('附带查询条件', () => {
						let data = []
						data.push(dbSave(schema, {code: 'foo'}))
						data.push(dbSave(schema, {code: '01', name: 'goo', tags: 'abc'}))
						data.push(dbSave(schema, {code: '05', name: 'hoo', tags: 'abc'}))
						data.push(dbSave(schema, {code: '02', address: 'foo'}))
						data.push(dbSave(schema, {code: '03', tags: 'foo'}))
						data.push(dbSave(schema, {code: '04', link: 'foo'}))
						return Promise.all(data)
							.then(() => {
								return testTarget.search({tags: 'abc'}, 'oo')
							})
							.then(data => {
								expect(data.length).eqls(2)
							})
					})
				})

				describe('更新', () => {
					it('可直接修改客户编号、名字、地址、链接、创建者、标签信息', () => {				
						return dbSave(schema, {code: 'the code'})
							.then(doc => {
								id = doc.id
								__v = doc.__v
								return testTarget.update({id, __v, code, name, address, link, creator, tags})
							})
							.then(doc => {
								return schema.findById(id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.code).eql(code)
								expect(doc.name).eql(name)
								expect(doc.address).eql(address)
								expect(doc.link).eql(link)
								expect(doc.creator).eql(creator)
								expect(doc.tags).eql(tags)
							})
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

			describe('CustomerRequirement - 客户需求', () => {
				const requirement = 'customer requirment',
				date = new Date(),
				creator = '5de79b77da3537277c3f3b88'

				let customer, req

				beforeEach(() => {
					toCreate = {code}
					schema = require('../db/schema/Customer')
					testTarget = require('../server/biz/CustomerRequirement')
					return dbSave(schema, toCreate)
						.then(doc => {
							customer = doc.id
						})
				})

				it('Customer is invalid ObjectId', () => {
					return testTarget.create({customer: 'abc'})
						.should.be.rejectedWith()
				})

				it('Customer is not found', () => {
					return testTarget.create({customer: ID_NOT_EXIST})
						.then(doc => {
							expect(doc).not.exist
						})
				})

				it('create a simplest requirement', () => {
					return testTarget.create({customer, requirement})
						.then(doc => {
							req = doc
							expect(req.Customer).eql(customer)
							expect(req.requirement).eql(requirement)
							expect(req.date).exist
							expect(req.creator).not.exist
							return schema.findById(customer)
						})
						.then(doc => {
							doc = doc.toJSON()
							expect(req.id).eql(doc.requirements[0].id)
							expect(req.requirement).eql(doc.requirements[0].requirement)
							expect(req.date).eql(doc.requirements[0].date)
							expect(doc.requirements[0].creator).not.exist
						})
				})

				it('create a full requirement', () => {
					return testTarget.create({customer, date, requirement, creator})
						.then(doc => {
							req = doc
							expect(req.Customer).eql(customer)
							expect(req.requirement).eql(requirement)
							expect(req.date).eql(date.toJSON())
							expect(req.creator).eql(creator)
							return schema.findById(customer)
						})
						.then(doc => {
							doc = doc.toJSON()
							expect(req.id).eql(doc.requirements[0].id)
							expect(requirement).eql(doc.requirements[0].requirement)
							expect(date.toJSON()).eql(doc.requirements[0].date)
							expect(creator).eql(doc.requirements[0].creator)
						})
				})
			})

			describe('Quots - 报价', () => {
				const requirement = 'customer requirment'
				let customer

				beforeEach(() => {
					toCreate = {code}
					schema = require('../db/schema/Customer')
					testTarget = require('../server/biz/Customer')
					return dbSave(schema, toCreate)
						.then(doc => {
							customer = doc.id
						})
				})

				describe('报价', () => {
					let quot

					it('Customer is invalid ObjectId', () => {
						return testTarget.quot({customer: 'abc'})
							.should.be.rejectedWith()
					})
	
					it('Customer is not found', () => {
						return testTarget.quot({customer: ID_NOT_EXIST})
							.then(doc => {
								expect(doc).not.exist
							})
					})
	
					it('create a simplest quot', () => {
						return testTarget.quot({customer, requirement})
							.then(doc => {
								quot = doc
								expect(quot.Customer).eql(customer)
								expect(quot.requirement).eql(requirement)
								expect(quot.date).exist
								return schema.findById(customer)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(quot.id).eql(doc.quots[0].id)
								expect(quot.requirement).eql(doc.quots[0].requirement)
								expect(quot.date).eql(doc.quots[0].date)
							})
					})
	
					it('create a full data quot', () => {
						const date = new Date(),
						creator = '5de79b77da3537277c3f3b88',
						product = '67879b77da3537277c3f3b88',
						supplier = '77879b77da3537277c3f3b99',
						price = 23.45,
						remark = 'any remark'
						return testTarget.quot(
												{
													customer,
													date,
													requirement,
													items: [
														{product, supplier, date, price, remark},
														{product, supplier, date, price, remark}
													],
													creator
												}
											)
							.then(doc => {
								quot = doc
								expect(quot.requirement).eql(requirement)
								expect(quot.date).eql(date.toJSON())
								expect(quot.creator).eql(creator)
								expect(quot.items[0]).eql({id: quot.items[0].id, product, supplier, date: date.toJSON(), price, remark})
								expect(quot.items[1]).eql({id: quot.items[1].id, product, supplier, date: date.toJSON(), price, remark})
								return schema.findById(customer)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(quot.id).eql(doc.quots[0].id)
								expect(customer).eql(doc.id)
								expect(requirement).eql(doc.quots[0].requirement)
								expect(date.toJSON()).eql(doc.quots[0].date)
								expect(creator).eql(doc.quots[0].creator)
								expect(doc.quots[0].items[0]).eql({id: doc.quots[0].items[0].id, product, supplier, date: date.toJSON(), price, remark})
								expect(doc.quots[0].items[1]).eql({id: doc.quots[0].items[1].id, product, supplier, date: date.toJSON(), price, remark})
							})
					})
				})

				describe('查询报价', () => {
					const date = new Date(),
					creator = '5de79b77da3537277c3f3b88',
					product = '67879b77da3537277c3f3b88',
					supplier = '77879b77da3537277c3f3b99',
					price = 23.45,
					remark = 'any remark'

					let custDoc
					beforeEach(() => {
						return schema.findById(customer)
							.then(doc => {
								doc.quots.push({
									date,
									requirement,
									creator
								})
								doc.quots.push({
									date,
									requirement,
									items: [
										{product, supplier, date, price, remark},
										{product, supplier, date, price, remark}
									],
									creator
								})
								return doc.save()
							})
							.then(doc => {
								custDoc = doc.toJSON()
							})
					})

					it('非法查询类型', () => {
						return testTarget.searchQuots({customer, type: 'unknown'})
							.then(docs => {
								expect(docs.length).eql(0)
							})
					})

					it('查询时发生任何错误时返回空数据集', () => {
						return testTarget.searchQuots({customer: 'abc'})
							.then(docs => {
								expect(docs.length).eql(0)
							})
					})

					it('查询客户需求及相关产品供应商报价', () => {
						return testTarget.searchQuots({customer})
							.then(docs => {
								expect(docs.length).eql(2)
								expect(docs[0]).eql({
									id: custDoc.quots[0].id,
									date: date.toJSON(),
									requirement,
									creator,
									items: []
								})
								expect(docs[1]).eql({
									id: custDoc.quots[1].id,
									date: date.toJSON(),
									requirement,
									creator,
									items: [
										{
											id: custDoc.quots[1].items[0].id,
											date: date.toJSON(),
											product, supplier, price, remark
										},
										{
											id: custDoc.quots[1].items[1].id,
											date: date.toJSON(),
											product, supplier, price, remark
										}
									]
								})
							})
					})

					/* it('查询供应商产品报价-CustomerQuot形式返回', () => {
						return testTarget.searchQuots({supplier, type: testTarget.constDef.QUERY_TYPE_SUPPLIER_QUOTS})
							.then(docs => {
								expect(docs).eql([
									{
										customer: custDoc.id,
										id: custDoc.quots[1].id,
										requirement,
										date: data.toJSON(),
										creator,
										items: [{
											id: custDoc.quots[1].items[0].id,
											date: date.toJSON(),
											product, price, remark
										},
										{
											id: custDoc.quots[1].items[1].id,
											date: date.toJSON(),
											product, price, remark
										}]
									}
								])
							})
					}) */

					it('查询供应商产品报价', () => {
						return testTarget.searchQuots({supplier, type: testTarget.constDef.QUERY_TYPE_SUPPLIER_QUOTS})
							.then(docs => {
								expect( docs.length).eql(1)
								expect(docs[0]).eql({
									product,
									customers: [{
										customer: custDoc.id,
										quots: [
											{
												id: custDoc.quots[1].items[0].id,
												date: date.toJSON(),
												price, remark,
												quot: custDoc.quots[1].id
											},
											{
												id: custDoc.quots[1].items[1].id,
												date: date.toJSON(),
												price, remark,
												quot: custDoc.quots[1].id
											}
										]
									}]})
							})
					})

					it('查询产品客户供应商报价', () => {
						return testTarget.searchQuots({product, type: testTarget.constDef.QUERY_TYPE_PRODUCT_QUOTS})
							.then(docs => {
								expect( docs.length).eql(1)
								expect(docs[0]).eql({
									supplier, customer,
									quots: [
										{
											id: custDoc.quots[1].id,
											requirement,
											date: date.toJSON(),
											creator,
											quot: {
													id: custDoc.quots[1].items[0].id,
													date: date.toJSON(),
													price, remark
												}
										}
									]
								})
							})
					})
				})

			})
		})
	})
})