var proxyquire = require('proxyquire'),
	dbSave = require('../finelets/db/mongoDb/dbSave'),
	__ = require('underscore')

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
				let product

				beforeEach(() => {
					toCreate = {code}
					schema = require('../db/schema/Product')
					testTarget = require('../server/biz/Product')
				})

				describe('搜索', () => {
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

					it('搜索结果不包含产品链', () => {
						const productData = {code, desc, content, constructure,
							yarn, spec, grey, tags, creator, remark, state}
						return dbSave(schema, {...productData, chains:[{}]})
							.then(() => {
								return testTarget.search({})
							})
							.then((docs) => {
								expect(docs.length).eql(1)
								expect(docs[0]).eql({
									id: docs[0].id,
									...{...productData, 
										spec: {id: docs[0].spec.id, ...docs[0].spec},
										grey: {id: docs[0].grey.id, ...docs[0].grey}}
								})
							})
					})
				})

				describe('创建', () => {
					it('必须给出产品编号', () => {
						return testTarget.create({})
							.should.be.rejectedWith()
					})
	
					it('产品编号必须唯一', () => {
						return dbSave(schema, toCreate)
							.then(() => {
								return testTarget.create(toCreate)
							})
							.should.be.rejectedWith()
					})
	
					it('创建最简单的产品', () => {
						return testTarget.create({code})
							.then(doc => {
								expect(doc).eql({id: doc.id})
								return schema.findById(doc.id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.code).eql(code)
							})
					})

					it('正确创建', () => {
						return testTarget.create({code, desc, content, constructure, 
							yarn, spec, grey, tags, creator, remark, state})
							.then(doc => {
								expect(doc).eql({id: doc.id})
								return schema.findById(doc.id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.code).eql(code)
								expect(doc.desc).eql(desc)
								expect(doc.content).eql(content)
								expect(doc.constructure).eql(constructure)
								expect(doc.yarn).eql(yarn)
								expect(doc.spec).eql({id: doc.spec.id, ...spec})
								expect(doc.grey).eql({id: doc.grey.id, ...grey})
								expect(doc.tags).eql(tags)
								expect(doc.creator).eql(creator)
								expect(doc.remark).eql(remark)
								expect(doc.state).eql(state)
							})
					})

					it('创建产品时防止数据注入产品链', () => {
						return testTarget.create({code, chains:[{}, {}]})
							.then(doc => {
								expect(doc).eql({id: doc.id})
								return schema.findById(doc.id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.code).eql(code)
								expect(doc.chains.length).eql(0)
							})
					})
				})

				describe('读取', () => {
					beforeEach(() => {
						return dbSave(schema, {code, desc, content, constructure, 
							yarn, spec, grey, tags, creator, remark, state, chains: [{}, {}]})
							.then(doc => {
								product = doc
							})
					})

					it('正确读取', () => {
						return testTarget.findById(product.id)
							.then(doc => {
								expect(doc).eql({
									id: product.id,
									code, desc, content, constructure, 
									yarn, tags, creator, remark, state,
									spec: {id: doc.spec.id, ...spec}, 
									grey: {id: doc.grey.id, ...grey},
									__v: product.__v,
									createdAt: product.createdAt,
									updatedAt: product.updatedAt
								})
							})
					})
				})

				describe('更新', () => {
					it('除state、chains字段，其余所有字段均可更新', () => {				
						return dbSave(schema, {code: 'the code'})
							.then(doc => {
								product = doc
								const {id, __v} = doc
								return testTarget.update({id, __v, code, desc, content, constructure, 
									yarn, spec, grey, tags, creator, remark, state})
							})
							.then(() => {
								return schema.findById(product.id, ['-chains'])
							})
							.then((doc) => {
								doc = doc.toJSON()
								expect(doc.updatedAt).not.eql(product.updatedAt)
								expect(doc).eql({
									id: product.id, 
									code, desc, content, constructure, 
									yarn, tags, creator, remark,
									spec: {id: doc.spec.id, ...spec},
									grey: {id: doc.grey.id, ...grey}, 
									__v: product.__v + 1,
									createdAt: product.createdAt,
									updatedAt: doc.updatedAt
								})
							})
					})
				})

				describe('ProductionChain - 产品链', () => {
					const desc = 'chain desc',
							date = new Date(),
							qty = 10000,
							fooPart = '5ce79b99da5837277c3f3b66',
							price = '23.56',
							feePart = '5ce79b99da5837277c3f3b77',
							quot = '6ae79b99da5837277c3f3b01',
							remark = 'chain node remark',
							parts = [
								{part: fooPart, price: price, remark},
								{part: feePart, quots: [{quot}]}
							],
							customerRequirement = '67e79b99da5837277c3f3b01',
							creator = '8be79b99da5837277c3f3b22',
							tags = 'any tags'

					let chain

					beforeEach(() => {
						return dbSave(schema, {code})
							.then(doc => {
								product = doc
							})
					})
					
					describe('基于产品查询相关产品链', () => {
						beforeEach(() => {
							let row
							return schema.findById(product.id)
								.then(doc => {
									doc.chains = doc.chains || []
									row = doc.chains.push({date, desc, parts, customerRequirement, qty, creator, tags})
									return doc.save()
								})
								.then(doc => {
									product = doc
									chain = doc.chains[row - 1]
								})
								.catch(e => {
									throw e
								})
						})

						it('指定产品不存在', () => {
							return testTarget.listChains(ID_NOT_EXIST)
								.then((chains) => {
									expect(chains.length).eql(0)
								})
						})

						it('列出产品链', () => {
							return testTarget.listChains(product.id)
								.then((chains) => {
									expect(chains.length).eql(1)
									expect(chains[0]).eql({
										id: chains[0].id,
										date: date.toJSON(),
										desc, qty, creator, tags
									})
								})
						})
					})

					describe('创建产品链', () => {
						it('创建最简单的产品链', () => {
							return testTarget.createChain(product.id, {})
								.then(doc => {
									chain = {product: product.id, id: doc.id}
									expect(doc).eql(chain)
									return schema.findById(product.id)
								})
								.then(doc => {
									chain = doc.chains.id(chain.id).toJSON()
									doc = doc.toJSON()
									expect(chain.date).exist
									expect(doc.__v).eql(product.__v + 1)
									expect(doc.updatedAt).not.eql(product.updatedAt)
								})
						})

						it('创建产品链', () => {
							return testTarget.createChain(product.id, 
									{date, desc, customerRequirement, qty, creator, tags})
								.then(doc => {
									chain = {product: product.id, id: doc.id}
									expect(doc).eql(chain)
									return schema.findById(product.id)
								})
								.then(doc => {
									chain = doc.chains.id(chain.id).toJSON()
									doc = doc.toJSON()
									expect(chain).eql({
										id: chain.id,
										date: date.toJSON(),
										desc,
										parts: [],
										customerRequirement, qty, creator, tags
									})
									expect(doc.__v).eql(product.__v + 1)
									expect(doc.updatedAt).not.eql(product.updatedAt)
								})
						})
					})

					describe('读取产品链', () => {
						let expectedProductChain

						beforeEach(() => {
							return schema.findById(product.id)
								.then(doc => {
									doc.chains.push({date, desc, parts, customerRequirement, qty, creator, tags})
									return doc.save()
								})
								.then(doc => {
									product = doc.toJSON()
									chain = doc.chains[0].toJSON()
									expectedProductChain = {
										id: chain.id,
										date: date.toJSON(),
										desc,
										customerRequirement, qty, creator, tags,
										__v: product.__v
									}
								})
						})

						it('仅提供产品链标识', () => {
							return testTarget.findChainById(chain.id)
								.then(doc => {
									expect(doc).eql(expectedProductChain)
								})
						})

						it('仅提供产品链标识, 但指定产品链不存在', () => {
							return testTarget.findChainById(ID_NOT_EXIST)
								.then(doc => {
									expect(doc).not.exist
								})
						})

						it('指定产品不存在', () => {
							return testTarget.findChainById(chain.id, ID_NOT_EXIST)
								.then(doc => {
									expect(doc).not.exist
								})
						})

						it('指定产品链不存在', () => {
							return testTarget.findChainById(ID_NOT_EXIST, product.id)
								.then(doc => {
									expect(doc).not.exist
								})
						})

						it('正确读取', () => {
							return testTarget.findChainById(chain.id, product.id)
								.then(doc => {
									expect(doc).eql(expectedProductChain)
								})
						})
					})

					describe('产品链原料/加工', () => {
						beforeEach(() => {
							return schema.findById(product.id)
								.then(doc => {
									doc.chains.push({date, desc, parts: [parts[0]], customerRequirement, qty, creator, tags})
									return doc.save()
								})
								.then(doc => {
									product = doc
									chain = doc.chains[0]
								})
						})

						describe('基于产品链查询其原料/加工列表', () => {
							it('指定产品不存在', () => {
								return testTarget.listChainParts(chain.id, ID_NOT_EXIST)
									.then((parts) => {
										expect(parts.length).eql(0)
									})
							})

							it('指定产品链不存在', () => {
								return testTarget.listChainParts(ID_NOT_EXIST, product.id)
									.then((parts) => {
										expect(parts.length).eql(0)
									})
							})
	
							it('列出产品链原料/加工', () => {
								return testTarget.listChainParts(chain.id, product.id)
									.then((parts) => {
										expect(parts.length).eql(1)
										expect(parts[0]).eql({
											id: parts[0].id,
											part: fooPart,
											price: price,
											remark
										})
									})
							})

							it('列出产品链原料/加工 - 仅指定产品链', () => {
								return testTarget.listChainParts(chain.id)
									.then((parts) => {
										expect(parts.length).eql(1)
										expect(parts[0]).eql({
											id: parts[0].id,
											part: fooPart,
											price: price,
											remark
										})
									})
							})
						})

						describe('为产品链添加原料/加工', () => {
							let part

							it('未给出产品链的原料/加工', () => {
								return testTarget.addChainPart(chain.id, {}, product.id)
									.should.be.rejectedWith()
							})

							it('添加产品链原料/加工 - 仅指定产品链', () => {
								return testTarget.addChainPart(chain.id, {part: feePart})
									.then(doc => {
										part = {
											product: product.id,
											chain: chain.id,
											id: doc.id
										}
										expect(doc).eql(part)
										return schema.findById(product.id)
									})
									.then(doc => {
										part = doc.chains.id(chain.id).parts.id(part.id).toJSON()
										expect(part.part).eql(feePart)
										expect(doc.__v).eql(product.__v + 1)
										expect(doc.updatedAt).not.eql(product.updatedAt)
									})
							})

							it('添加最简单的产品链原料/加工', () => {
								return testTarget.addChainPart(chain.id, {part: feePart}, product.id)
									.then(doc => {
										part = {
											product: product.id,
											chain: chain.id,
											id: doc.id
										}
										expect(doc).eql(part)
										return schema.findById(product.id)
									})
									.then(doc => {
										part = doc.chains.id(chain.id).parts.id(part.id).toJSON()
										expect(part.part).eql(feePart)
										expect(doc.__v).eql(product.__v + 1)
										expect(doc.updatedAt).not.eql(product.updatedAt)
									})
							})
	
							it('添加产品链原料/加工', () => {
								const partData = {
									part: feePart,
									price, remark
								}
								return testTarget.addChainPart(chain.id, partData, product.id)
									.then(doc => {
										part = {
											product: product.id,
											chain: chain.id,
											id: doc.id
										}
										expect(doc).eql(part)
										return schema.findById(product.id)
									})
									.then(doc => {
										part = doc.chains.id(chain.id).parts.id(part.id).toJSON()
										delete part.quots
										expect(part).eql({id: part.id, ...partData})
										expect(doc.__v).eql(product.__v + 1)
										expect(doc.updatedAt).not.eql(product.updatedAt)
									})
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
					tags = 'tags'
				let supplier

				beforeEach(() => {
					toCreate = {code}
					schema = require('../db/schema/Supplier')
					testTarget = require('../server/biz/Supplier')
				})

				describe('创建', () => {
					it('必须给出供应商编号', () => {
						return testTarget.create({})
							.should.be.rejectedWith()
					})
	
					it('供应商编号必须唯一', () => {
						return dbSave(schema, toCreate)
							.then(() => {
								return testTarget.create(toCreate)
							})
							.should.be.rejectedWith()
					})

					it('创建一最简单的供应商', () => {
						return testTarget.create(toCreate)
							.then(doc => {
								supplier = doc
								expect(doc.code).eql(code)
								return schema.findById(doc.id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.code).eql(supplier.code)
							})
					})

					it('创建供应商', () => {
						return testTarget.create({code, name, address, account, link, creator, tags})
							.then(doc => {
								supplier = doc
								expect(doc.code).eql(code)
								expect(doc.name).eql(name)
								expect(doc.address).eql(address)
								expect(doc.account).eql(account)
								expect(doc.link).eql(link)
								expect(doc.creator).eql(creator)
								expect(doc.tags).eql(tags)
								return schema.findById(doc.id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.code).eql(supplier.code)
								expect(doc.name).eql(supplier.name)
								expect(doc.address).eql(supplier.address)
								expect(doc.account).eql(supplier.account)
								expect(doc.link).eql(supplier.link)
								expect(doc.creator).eql(supplier.creator)
								expect(doc.tags).eql(supplier.tags)
							})
					})
				})

				describe('搜索', () => {
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
				})

				describe('更新', () => {
					it('所有字段均可更新', () => {				
						return dbSave(schema, {code: 'the code'})
							.then(doc => {
								supplier = doc
								id = doc.id
								__v = doc.__v
								return testTarget.update({id, __v, code, name, address, account, link, creator, tags})
							})
							.then(() => {
								return schema.findById(supplier.id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.updatedAt).not.eql(supplier.updatedAt)
								expect(doc).eql({
									id: supplier.id, 
									code, name, address, account, link, creator, tags, 
									__v: supplier.__v + 1,
									createdAt: supplier.createdAt,
									updatedAt: doc.updatedAt
								})
							})
					})
				})	

			})

			describe('Customers - 客户', () => {
				const name = 'name',
					address = 'address',
					link = 'link',
					creator = '5ce79b99da5837277c3f3b66',
					tags = 'tags'
				let customer

				beforeEach(() => {
					toCreate = {code}
					schema = require('../db/schema/Customer');
					testTarget = require('../server/biz/Customer');
				})

				describe('创建', () => {
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
						return testTarget.create({code})
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
				
				describe('客户需求', () => {
					const requirement = 'customer requirment',
					date = new Date()

					let customerRequirement
	
					beforeEach(() => {
						testTarget = require('../server/biz/CustomerRequirement')
						return dbSave(schema, toCreate)
							.then(doc => {
								customer = doc.id
							})
					})
	
					describe('创建', () => {
						it('Customer is invalid ObjectId', () => {
							return testTarget.create('abc')
								.should.be.rejectedWith()
						})
		
						it('Customer is not found', () => {
							return testTarget.create(ID_NOT_EXIST)
								.then(doc => {
									expect(doc).not.exist
								})
						})
		
						it('创建一最简单的客户需求', () => {
							return testTarget.create(customer, {})
								.then(doc => {
									customerRequirement = doc
									expect(customerRequirement.Customer).eql(customer)
									expect(customerRequirement.date).exist
									return schema.findById(customer)
								})
								.then(doc => {
									doc = doc.toJSON()
									expect(doc.requirements[0].id).eql(customerRequirement.id)
									expect(doc.requirements[0].date).eql(customerRequirement.date)
								})
						})
		
						it('创建客户需求', () => {
							return testTarget.create(customer, {date, requirement, creator})
								.then(doc => {
									customerRequirement = doc
									expect(customerRequirement.Customer).eql(customer)
									expect(customerRequirement.requirement).eql(requirement)
									expect(customerRequirement.date).eql(date.toJSON())
									expect(customerRequirement.creator).eql(creator)
									return schema.findById(customer)
								})
								.then(doc => {
									doc = doc.toJSON()
									expect(doc.requirements[0].id).eql(customerRequirement.id)
									expect(doc.requirements[0].date).eql(customerRequirement.date)
									expect(doc.requirements[0].requirement).eql(customerRequirement.requirement)
									expect(doc.requirements[0].creator).eql(customerRequirement.creator)
								})
						})
					})
				})
			})

			describe('Parts - 原料/加工', () => {
				const name = 'name',
					type = 'process',
					creator = '5ce79b99da5837277c3f3b66',
					tags = 'tags'
				let part

				beforeEach(() => {
					toCreate = {name}
					schema = require('../db/schema/Part');
					testTarget = require('../server/biz/Part');
				})

				describe('创建', () => {
					it('必须给出名称', () => {
						return testTarget.create({})
							.should.be.rejectedWith()
					})

					it('创建一最简单的原料/加工', () => {
						return testTarget.create(toCreate)
							.then(doc => {
								return schema.findById(doc.id)
							})
							.then(doc => {
								expect(doc.type).eql('material')
								expect(doc.name).eql(name)
							})
					})

					it('创建原料/加工', () => {
						return testTarget.create({code, type, name, creator, tags})
							.then(doc => {
								return schema.findById(doc.id)
							})
							.then(doc => {
								expect(doc.code).eql(code)
								expect(doc.name).eql(name)
								expect(doc.type).eql(type)
								expect(doc.creator.toString()).eql(creator)
								expect(doc.tags).eql(tags)
							})
					})
				})
				
				describe('搜索', () => {
					it('搜索字段包括name, code, tags', () => {
						let data = []
						data.push(dbSave(schema, {code: 'foo', name}))
						data.push(dbSave(schema, {code: '01', name: 'foo'}))
						data.push(dbSave(schema, {code: '03', name, tags: 'foo'}))
						return Promise.all(data)
							.then(() => {
								return testTarget.search({}, 'oo')
							})
							.then(data => {
								expect(data.length).eqls(3)
							})
					})
				})

				describe('更新', () => {
					it('可直接修改编号、名字、类型、创建者、标签信息', () => {				
						return dbSave(schema, {name: 'the name'})
							.then(doc => {
								id = doc.id
								__v = doc.__v
								return testTarget.update({id, __v, code, type, name, creator, tags})
							})
							.then(() => {
								return schema.findById(id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.code).eql(code)
								expect(doc.name).eql(name)
								expect(doc.type).eql(type)
								expect(doc.creator).eql(creator)
								expect(doc.tags).eql(tags)
							})
					})
				})	
			})

			describe('供应商原料/加工报价', () => {
				const supplier = '5ce79b88da5837277c3f3b49',
						part = '5ce79b88da5837277c3f3b65',
						type = 'offer',
						date = new Date(),
						price = 12.56,
						ref = '5ce79b88da5837277c3f4fd2',
						remark = 'any reamrk',
						tags = 'any tags'

				let partQuot
				beforeEach(() => {
					schema = require('../db/schema/PartQuot')
					testTarget = require('../server/biz/PartQuot')
				})

				describe('创建供应商原料/加工', () => {
					
					it('供应商原料/加工', () => {
						return testTarget.createSupplierPart({supplier, part})
							.then(doc => {
								expect(doc).eql({
									supplier, part,
									id: doc.id
								})
								return schema.findById(doc.id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.supplier).eql(supplier)
								expect(doc.part).eql(part)
							})
					})

					it('未给出供应商', () => {
						return testTarget.createSupplierPart({part})
							.should.be.rejectedWith()
					})

					it('未给出原料/加工', () => {
						return testTarget.createSupplierPart({supplier})
							.should.be.rejectedWith()
					})

					it('供应商原料/加工重复', () => {
						return dbSave(schema, {supplier, part})
							.then(() => {
								return testTarget.createSupplierPart({supplier, part})
							})
							.should.be.rejectedWith()
					})
				})

				describe('供应商原料/加工报价', () => {
					it('指定供应商原料/加工首次最简单报价', () => {
						return testTarget.create({supplier, part})
							.then(doc => {
								partQuot = doc
								expect(doc).eql({
									partQuots: doc.partQuots,
									supplier, part,
									id: doc.id,
									date: doc.date,
									type: 'inquery',
									__v: doc.__v,
									createdAt: doc.createdAt,
									updatedAt: doc.updatedAt
								})
								return schema.findOne({quots: {$elemMatch: {_id: doc.id}}})
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.supplier).eql(supplier)
								expect(doc.part).eql(part)
								expect(doc.id).eql(partQuot.partQuots)
								expect(doc.quots.length).eql(1)
								expect(doc.quots[0]).eql({
									id: partQuot.id, 
									date: partQuot.date,
									type: partQuot.type
								})
							})
					})

					it('创建供应商原料/加工报价', () => {
						return dbSave(schema, {supplier, part, quots: [{price: 2}]})
							.then(doc => {
								partQuot = doc
								return testTarget.create({supplier, part, date, type, price, ref, remark, tags})
							})
							.then(doc => {
								partQuot = doc
								expect(doc).eql({
									partQuots: doc.partQuots,
									supplier, part,
									id: doc.id,
									date: date.toJSON(),
									type, price, ref, remark, tags,
									__v: doc.__v,
									createdAt: doc.createdAt,
									updatedAt: doc.updatedAt
								})
								return schema.findOne({quots: {$elemMatch: {_id: doc.id}}})
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.supplier).eql(supplier)
								expect(doc.part).eql(part)
								expect(doc.id).eql(partQuot.partQuots)
								expect(doc.quots.length).eql(2)
								expect(doc.quots[1]).eql({
									id: partQuot.id, 
									date: date.toJSON(),
									type, price, ref, remark, tags
								})
							})
					})
				})

				describe('读取供应商原料/加工报价', () => {
					beforeEach(() => {
						return dbSave(schema, {supplier, part, quots: [{date, type, price, ref, remark, tags}]})
							.then(doc => {
								partQuot = doc
							})
					})

					it('指定报价不存在', () => {
						return testTarget.findQuotById(ID_NOT_EXIST)
							.then(doc => {
								expect(doc).not.exist
							})
					})

					it('正确读取报价', () => {
						return testTarget.findQuotById(partQuot.quots[0].id)
							.then(doc => {
								const {id, __v, createdAt, updatedAt} = partQuot
								expect(doc).eql({
									id: partQuot.quots[0].id,
									partQuots: id,
									supplier, part, 
									date:date.toJSON(),
									type, price, ref, remark, tags,
									__v, createdAt, updatedAt
								})
							})
					})

					it('指定供应商原料/加工不存在', () => {
						return testTarget.findSupplierPart(supplier, ID_NOT_EXIST)
							.then(doc => {
								expect(doc).not.exist
							})
					})

					it('正确读取供应商原料/加工', () => {
						return testTarget.findSupplierPart(supplier, part)
							.then(doc => {
								const {id, __v, createdAt, updatedAt} = partQuot
								expect(doc).eql({
									id, supplier, part, 
									__v, createdAt, updatedAt
								})
							})
					})
				})				

				describe('查询与搜索', () => {
					const fooSupplier = '6ce79b88da5837277c3f3b80',
						fooPart = '6ce79b88da5837277c3f3b81'
					let inDb
					beforeEach(() => {
						
					})

					it('指定供应商查询其原料/加工', () => {
						return dbSave(schema, {supplier, part})
							.then(doc => {
								id = doc.id
								return testTarget.searchBySupplier(supplier)
							})
							.then(docs => {
								expect(docs.length).eql(1)
								expect(docs[0]).eql({id, supplier, part})
							})
					})

					it('指定原料/加工查询其供应商', () => {
						return dbSave(schema, {supplier, part})
							.then(doc => {
								id = doc.id
								return testTarget.searchByPart(part)
							})
							.then(docs => {
								expect(docs.length).eql(1)
								expect(docs[0]).eql({id, supplier, part})
							})
					})

					it('查询报价', () => {
						let execs = []
						execs.push(dbSave(schema, {supplier, part, quots: [{}, {date, type, price}]}))
						execs.push(dbSave(schema, {supplier, part: fooPart}))
						execs.push(dbSave(schema, {supplier: fooSupplier, part}))
						execs.push(dbSave(schema, {supplier: fooSupplier, part: fooPart}))
						return Promise.all(execs)
							.then(docs => {
								execs = []
								execs.push(schema.findOne({supplier, part}))
								execs.push(testTarget.listQuots(supplier, part))
								return Promise.all(execs)
							})
							.then(results => {
								partQuot = results[0].toJSON()
								expect(results[1][0]).eql({supplier, part, ...partQuot.quots[0]})
								expect(results[1][1]).eql({supplier, part, ...partQuot.quots[1]})
							})
					})

					it('查无此供应商原料/加工报价', () => {
						return testTarget.listQuots(supplier, ID_NOT_EXIST)
							.then(docs => {
								expect(docs.length).eql(0)
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