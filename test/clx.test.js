const dbSave = require('./dbSave'),
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
					checkQuotPart = sinon.stub()
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
						return testTarget.createProduct({})
							.should.be.rejectedWith()
					})
	
					it('产品编号必须唯一', () => {
						return dbSave(schema, toCreate)
							.then(() => {
								return testTarget.createProduct(toCreate)
							})
							.should.be.rejectedWith()
					})
	
					it('创建最简单的产品', () => {
						return testTarget.createProduct({code})
							.then(doc => {
								expect(doc).eql({
									id: doc.id,
									code
								})
								return schema.findById(doc.id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.code).eql(code)
							})
							.catch(e => {
								throw e
							})
					})

					it('正确创建', () => {
						return testTarget.createProduct({code, desc, content, constructure, 
							yarn, spec, grey, tags, creator, remark, state})
							.then(doc => {
								expect(doc).eql({
									id: doc.id,
									code, desc, content, constructure, yarn, tags, creator, remark, state,
									spec: {id: doc.spec.id, ...spec}, 
									grey: {id: doc.grey.id, ...grey} 
								})
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
						return testTarget.createProduct({code, chains:[{}, {}]})
							.then(doc => {
								expect(doc).eql({
									id: doc.id,
									code
								})
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

					it('正确读取, 不含chains字段', () => {
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
							qty = '10000W',
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
									row = doc.chains.push({date, desc, parts, customerRequirement, qty, creator})
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
										desc, qty, creator
									})
								})
						})
					})

					describe('基于客户需求查询相关产品链', () => {
						beforeEach(() => {
							return schema.findById(product.id)
								.then(doc => {
									doc.chains.push({date, customerRequirement})
									doc.chains.push({date, customerRequirement})
									return doc.save()
								})
								.then(doc => {
									product = doc
									chain = doc.chains[0]
								})
								.catch(e => {
									throw e
								})
						})

						it('列出产品链', () => {
							return testTarget.listChainsByRequirement(customerRequirement)
								.then((chains) => {
									expect(chains.length).eql(2)
									expect(chains[0]).eql({
										id: chain.id,
										date: date.toJSON(),
										customerRequirement
									})
								})
						})
					})

					describe('创建产品链', () => {
						it('防止产品链原料/加工非法数据注入', () => {
							return testTarget.createChain(product.id, {parts:[{}]})
								.then(doc => {
									chain = doc
									expect(doc).eql({
										product: product.id,
										id: doc.id,
										date: doc.date
									})
									return schema.findById(product.id)
								})
								.then(doc => {
									doc = doc.toJSON()
									expect(doc.chains[0].id).eql(chain.id)
									expect(doc.chains[0].date).eql(chain.date)
									expect(doc.chains[0].parts).eql([])
								})
						})

						it('创建最简单的产品链', () => {
							return testTarget.createChain(product.id, {})
								.then(doc => {
									chain = doc
									expect(doc).eql({
										product: product.id,
										id: doc.id,
										date: doc.date
									})
									return schema.findById(product.id)
								})
								.then(doc => {
									doc = doc.toJSON()
									expect(doc.chains[0].id).eql(chain.id)
									expect(doc.chains[0].date).eql(chain.date)
									expect(doc.chains[0].parts).eql([])
								})
						})

						it('创建产品链', () => {
							return testTarget.createChain(product.id, 
									{date, desc, customerRequirement, qty, creator, tags})
								.then(doc => {
									chain = doc
									expect(doc).eql({
										product: product.id,
										id: doc.id,
										date: date.toJSON(),
										desc, customerRequirement, qty, creator, tags
									})
									return schema.findById(product.id)
								})
								.then(doc => {
									doc = doc.toJSON()
									expect(doc.chains[0]).eql({
										id: chain.id,
										date: date.toJSON(),
										parts: [],
										desc, customerRequirement, qty, creator, tags
									})
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
										product: product.id,
										date: date.toJSON(),
										desc, customerRequirement, qty, creator, tags,
										__v: product.__v
									}
								})
						})

						it('IF-Match', () => {
							return testTarget.ifMatchChain(chain.id, product.__v.toString())
								.then(match => {
									expect(match).true
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

					describe('更新产品链', () => {
						it('删除字段值', () => {
							return schema.findById(product.id)
								.then(doc => {
									doc.chains.push({creator})
									return doc.save()
								})
								.then(doc => {
									product = doc.toJSON()
									return testTarget.updateChain(doc.chains[0].id, 
										{__v: product.__v, date})
								})
								.then(() => {
									return schema.findById(product.id)
								})
								.then(doc => {
									doc = doc.toJSON()
									expect(doc.__v).eql(product.__v + 1)
									expect(doc.chains[0]).eql({
										id: doc.chains[0].id,
										parts: doc.chains[0].parts,
										date: date.toJSON()
									})
								})
						})

						it('可直接更新除parts外的所有字段', () => {
							return schema.findById(product.id)
								.then(doc => {
									doc.chains.push({})
									return doc.save()
								})
								.then(doc => {
									product = doc.toJSON()
									return testTarget.updateChain(doc.chains[0].id, 
										{__v: product.__v, date, desc, customerRequirement, qty, creator, tags})
								})
								.then(() => {
									return schema.findById(product.id)
								})
								.then(doc => {
									doc = doc.toJSON()
									expect(doc.__v).eql(product.__v + 1)
									expect(doc.chains[0]).eql({
										id: doc.chains[0].id,
										parts: doc.chains[0].parts,
										date: date.toJSON(),
										desc, customerRequirement, qty, creator, tags
									})
								})
						})
					})

					describe('删除产品链', () => {
						it('指定产品链不存在', () => {
							return testTarget.removeChain(ID_NOT_EXIST)
								.then((doc) => {
									expect(doc).not.exist
								})
						})

						it('删除', () => {
							return schema.findById(product.id)
								.then(doc => {
									doc.chains.push({})
									return doc.save()
								})
								.then(doc => {
									product = doc.toJSON()
									return testTarget.removeChain(doc.chains[0].id)
								})
								.then(() => {
									return schema.findById(product.id)
								})
								.then(doc => {
									expect(doc.chains.length).eql(0)
								})
						})
					})

					describe('产品链原料/加工', () => {
						beforeEach(() => {
							return schema.findById(product.id)
								.then(doc => {
									doc.chains.push({})
									return doc.save()
								})
								.then(doc => {
									product = doc.toJSON()
									chain = product.chains[0]
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
								return schema.findById(product.id)
									.then(doc => {
										doc.chains.id(chain.id).parts.push({part: fooPart}, {part: feePart})
										return doc.save()
									})
									.then(doc => {
										product = doc.toJSON()
										chain = product.chains[0]
										return testTarget.listChainParts(chain.id, product.id)
									})
									.then((parts) => {
										expect(parts.length).eql(2)
										expect(parts).eql([{
											id: parts[0].id,
											part: fooPart
										}, {
											id: parts[1].id,
											part: feePart
										}])
									})
							})

							it('列出产品链原料/加工 - 仅指定产品链', () => {
								return schema.findById(product.id)
									.then(doc => {
										doc.chains.id(chain.id).parts.push({part: fooPart}, {part: feePart})
										return doc.save()
									})
									.then(doc => {
										product = doc.toJSON()
										chain = product.chains[0]
										return testTarget.listChainParts(chain.id)
									})
									.then((parts) => {
										expect(parts.length).eql(2)
										expect(parts).eql([{
											id: parts[0].id,
											part: fooPart
										}, {
											id: parts[1].id,
											part: feePart
										}])
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
								return testTarget.addChainPart(chain.id, {part: fooPart})
									.then(doc => {
										part = doc
										expect(doc).eql({
											product: product.id,
											chain: chain.id,
											id: doc.id,
											part: fooPart
										})
										return schema.findById(product.id)
									})
									.then(doc => {
										partDoc = doc.chains.id(chain.id).parts.id(part.id).toJSON()
										expect(partDoc.part).eql(fooPart)
									})
							})

							it('产品链原料/加工重复', () => {
								return schema.findById(product.id)
									.then(doc => {
										doc.chains[0].parts.push({part: fooPart})
										return doc.save()
									})
									.then(doc => {
										return testTarget.addChainPart(doc.chains[0].id, {part: fooPart})
									})
									.should.be.rejectedWith()
							})

							it('添加最简单的产品链原料/加工', () => {
								return testTarget.addChainPart(chain.id, {part: fooPart}, product.id)
									.then(doc => {
										part = doc
										expect(doc).eql({
											product: product.id,
											chain: chain.id,
											id: doc.id,
											part: fooPart
										})
										return schema.findById(product.id)
									})
									.then(doc => {
										partDoc = doc.chains.id(chain.id).parts.id(part.id).toJSON()
										expect(partDoc.part).eql(fooPart)
									})
							})
	
							it('添加产品链原料/加工', () => {
								return testTarget.addChainPart(chain.id, {part: fooPart, price, remark}, product.id)
									.then(doc => {
										part = doc
										expect(doc).eql({
											product: product.id,
											chain: chain.id,
											id: doc.id,
											part: fooPart,
											price, remark
										})
										return schema.findById(product.id)
									})
									.then(doc => {
										partDoc = doc.chains.id(chain.id).parts.id(part.id).toJSON()
										delete partDoc.quots
										expect(partDoc).eql({
											id: part.id,
											part: fooPart,
											price, remark
										})
									})
							})
						})

						describe('读取产品链原料/加工', () => {							
							it('IF-Match', () => {
								return schema.findById(product.id)
									.then(doc => {
										doc.chains[0].parts.push({part: fooPart})
										return doc.save()
									})
									.then(doc => {
										return testTarget.ifMatchChainPart(doc.chains[0].parts[0].id, doc.__v.toString())
									})
									.then(match => {
										expect(match).true
									})
							})

							it('给出产品链原料/加工不存在', () => {
								return testTarget.findProductChainPartById(ID_NOT_EXIST)
									.then(doc => {
										expect(doc).not.exist
									})
							})

							it('仅给出产品链原料/加工标识', () => {
								return schema.findById(product.id)
									.then(doc => {
										doc.chains[0].parts.push({part: fooPart})
										return doc.save()
									})
									.then(doc => {
										product = doc.toJSON()
										return testTarget.findProductChainPartById(doc.chains[0].parts[0].id)
									})
									.then(doc => {
										expect(doc).eql({
											product: product.id,
											chain: product.chains[0].id,
											id: product.chains[0].parts[0].id,
											part: fooPart,
											__v: product.__v
										})
									})
							})
						})

						describe('更新产品链原料/加工', () => {	
							it('删除字段值', () => {
								return schema.findById(product.id)
									.then(doc => {
										doc.chains[0].parts.push({part: fooPart, remark})
										return doc.save()
									})
									.then(doc => {
										product = doc.toJSON()
										return testTarget.updateChainPart(doc.chains[0].parts[0].id, 
											{__v: product.__v, part: feePart})
									})
									.then(() => {
										return schema.findById(product.id)
									})
									.then(doc => {
										doc = doc.toJSON()
										expect(doc.__v).eql(product.__v + 1)
										expect(doc.chains[0].parts[0]).eql({
											id: doc.chains[0].parts[0].id,
											part: feePart,
											quots: []
										})
									})
							})
	
							it('可直接更新除quots外的所有字段', () => {
								return schema.findById(product.id)
									.then(doc => {
										doc.chains[0].parts.push({part: fooPart})
										return doc.save()
									})
									.then(doc => {
										product = doc.toJSON()
										return testTarget.updateChainPart(doc.chains[0].parts[0].id, 
											{__v: product.__v, part: feePart, remark, price})
									})
									.then(() => {
										return schema.findById(product.id)
									})
									.then(doc => {
										doc = doc.toJSON()
										expect(doc.__v).eql(product.__v + 1)
										expect(doc.chains[0].parts[0]).eql({
											id: doc.chains[0].parts[0].id,
											part: feePart,
											remark, price,
											quots: []
										})
									})
							})
						})
	
						describe('删除产品链原料/加工', () => {
							it('指定产品链原料/加工不存在', () => {
								return testTarget.removeChainPart(ID_NOT_EXIST)
									.then((doc) => {
										expect(doc).not.exist
									})
							})
	
							it('删除', () => {
								return schema.findById(product.id)
									.then(doc => {
										doc.chains[0].parts.push({part: fooPart})
										return doc.save()
									})
									.then(doc => {
										product = doc.toJSON()
										return testTarget.removeChainPart(doc.chains[0].parts[0].id)
									})
									.then(() => {
										return schema.findById(product.id)
									})
									.then(doc => {
										expect(doc.chains[0].parts.length).eql(0)
									})
							})
						})

						describe('产品链原料/加工报价', () => {
							let checkPartQuot, part

							beforeEach(() => {
								checkPartQuot = sinon.stub()
								testTarget = require('../server/biz/ProductChainQuot')(checkPartQuot)
								return schema.findById(product.id)
									.then(doc => {
										doc.chains[0].parts.push({part: fooPart})
										return doc.save()
									})
									.then(doc => {
										product = doc
										chain = doc.chains[0]
										part = doc.chains[0].parts[0]
									})
							})

							describe('基于产品链原料/加工查询其报价列表', () => {
								it('给出产品链原料/加工不存在', () => {
									return testTarget.listQuots(ID_NOT_EXIST)
										.then(docs => {
											expect(docs.length).eql(0)
										})
								})

								it('正确列出', () => {
									part.quots.push({quot})
									return product.save()
										.then(() => {
											return testTarget.listQuots(part.id)
										})
										.then(docs => {
											expect(docs.length).eql(1)
											expect(docs[0]).eql({
												id: docs[0].id,
												quot
											})
										})
								})
							})

							describe('为产品链原料/加工添加报价', () => {
								it('重复报价', () => {
									checkPartQuot.withArgs(feePart, quot).resolves(true)
									chain.parts.push({part: feePart, quots: [{quot}]})
									return product.save()
										.then(doc => {
											product = doc
											chain = doc.chains[0]
											return testTarget.addQuot(chain.parts[1].id, {quot})
										})
										.should.be.rejectedWith()
								})

								it('正确报价', () => {
									checkPartQuot.withArgs(fooPart, quot).resolves(true)
									return testTarget.addQuot(chain.parts[0].id, {quot})
										.then(doc => {
											expect(doc).eql({
												id: doc.id, 
												quot
											})
										})
								})

								it('报价原料/加工与产品链原料/加工不一致', () => {
									checkPartQuot.withArgs(fooPart, quot).resolves(false)
									return testTarget.addQuot(chain.parts[0].id, {quot})
										.should.be.rejectedWith()
								})
							})

							describe('读取产品链原料/加工报价', () => {		
								beforeEach(() => {
									part.quots.push({quot})
									return product.save()
										.then(doc => {
											product = doc
											chain = doc.chains[0]
											part = doc.chains[0].parts[0]
										})
								})

								it('IF-Match', () => {
									return testTarget.ifMatchQuot(part.quots[0].id, product.__v.toString())
										.then(match => {
											expect(match).true
										})
								})
	
								it('给出产品链原料/加工不存在', () => {
									return testTarget.findQuotById(ID_NOT_EXIST)
										.then(doc => {
											expect(doc).not.exist
										})
								})
	
								it('正确读取产品链原料/加工报价', () => {
									return testTarget.findQuotById(part.quots[0].id)
										.then(doc => {
											expect(doc).eql({
												product: product.id,
												chain: chain.id,
												part: part.id,
												id: part.quots[0].id,
												quot,
												__v: product.__v
											})
										})
								})
							})

							describe('删除产品链原料/加工报价', () => {
								beforeEach(() => {
									part.quots.push({quot})
									return product.save()
										.then(doc => {
											product = doc
											chain = doc.chains[0]
											part = doc.chains[0].parts[0]
										})
								})

								it('指定产品链原料/加工报价不存在', () => {
									return testTarget.removeQuot(ID_NOT_EXIST)
										.then((doc) => {
											expect(doc).not.exist
										})
								})
		
								it('删除', () => {
									return testTarget.removeQuot(part.quots[0].id)
										.then(() => {
											return schema.findById(product.id)
										})
										.then(doc => {
											expect(doc.chains[0].parts[0].quots.length).eql(0)
										})
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
								expect(doc).eql({
									id: doc.id,
									code
								})
								return schema.findById(doc.id)
							})
							.then(doc => {
								expect(doc.code).eql(code)
							})
					})

					it('创建供应商', () => {
						return testTarget.create({code, name, address, account, link, creator, tags})
							.then(doc => {
								expect(doc).eql({
									id: doc.id,
									code, name, address, account, link, creator, tags
								})
								return schema.findById(doc.id)
							})
							.then(doc => {
								expect(doc.code).eql(code)
								expect(doc.name).eql(name)
								expect(doc.address).eql(address)
								expect(doc.account).eql(account)
								expect(doc.link).eql(link)
								expect(doc.creator.toString()).eql(creator)
								expect(doc.tags).eql(tags)
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
								return testTarget.search(undefined, 'oo')
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
								id = doc.id
								return testTarget.update({
									id,
									__v: doc.__v,
									code, name, address, account, link, creator, tags
								})
							})
							.then(() => {
								return schema.findById(id)
							})
							.then(doc => {
								expect(doc.code).eql(code)
								expect(doc.name).eql(name)
								expect(doc.address).eql(address)
								expect(doc.account).eql(account)
								expect(doc.link).eql(link)
								expect(doc.creator.toString()).eql(creator)
								expect(doc.tags).eql(tags)
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
								expect(doc).eql({
									id: doc.id,
									code
								})
								return schema.findById(doc.id)
							})
							.then(doc => {
								doc = doc.toJSON()
								expect(doc.code).eql(code)
							})
					})

					it('创建客户', () => {
						return testTarget.create({code, name, address, link, creator, tags})
							.then(doc => {
								expect(doc).eql({
									id: doc.id,
									code, name, address, link, creator, tags
								})
								return schema.findById(doc.id)
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
				
				describe('搜索', () => {
					it('搜索字段包括name, code, address, tags', () => {
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

					it('查询结果不包含联系人、需求列表和__v字段', () => {
						return dbSave(schema, {code, name, address, link, creator, tags})
							.then((doc) => {
								customer = doc
								return testTarget.search({}, 'oo')
							})
							.then(docs => {
								expect(docs.length).eqls(1)
								expect(docs[0]).eqls({
									id: customer.id,
									code, name, address, link, creator, tags
								})
							})
					})
				})

				describe('读取', () => {
					it('读取客户时不包括联系人、需求列表字段', () => {
						return dbSave(schema, {code, name, address, link, creator, tags})
							.then(doc => {
								customer = doc
								return testTarget.findById(doc.id)
							})
							.then(doc => {
								expect(doc).eql({
									code, name, address, link, creator, tags,
									...__.pick(customer, 'id', '__v', 'createdAt', 'updatedAt')
								})
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
							.then(() => {
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
						return dbSave(schema, toCreate)
							.then(doc => {
								id = doc.id
							})
					})
	
					describe('创建', () => {
						it('指定客户不存在', () => {
							return testTarget.createRequirement(ID_NOT_EXIST)
								.then(doc => {
									expect(doc).not.exist
								})
						})

						it('必须给出需求说明', () => {
							return testTarget.createRequirement(id, {})
								.should.be.rejectedWith()
						})
		
						it('创建一最简单的客户需求', () => {
							return testTarget.createRequirement(id, {requirement})
								.then(doc => {
									customerRequirement = doc
									expect(doc).eql({
										id: doc.id,
										customer: id,
										date: doc.date,
										requirement
									})
									return schema.findById(id)
								})
								.then(doc => {
									doc = doc.toJSON()
									expect(doc.requirements[0]).eql(
										__.pick(customerRequirement, 'id', 'requirement', 'date')
									)
								})
						})
		
						it('创建客户需求', () => {
							return testTarget.createRequirement(id, {date, requirement, creator})
								.then(doc => {
									customerRequirement = doc
									expect(doc).eql({
										id: doc.id,
										customer: id,
										date: date.toJSON(),
										requirement, creator
									})
									return schema.findById(id)
								})
								.then(doc => {
									doc = doc.toJSON()
									expect(doc.requirements[0]).eql(
										__.pick(customerRequirement, 'id', 'requirement', 'date', 'creator')
									)
								})
						})
					})

					describe('列出客户需求', () => {
						beforeEach(() => {
							return schema.findById(id)
								.then(doc => {
									doc.requirements.push({requirement, date, creator})
									return doc.save()
								})
						})

						it('指定客户不存在', () => {
							return testTarget.listRequirements(ID_NOT_EXIST)
								.then((docs) => {
									expect(docs.length).eql(0)
								})
						})

						it('正确列出', () => {
							return testTarget.listRequirements(id)
								.then(docs => {
									expect(docs.length).eql(1)
									expect(docs[0]).eql({
										id: docs[0].id,
										date: date.toJSON(),
										requirement, creator
									})
								})
						})
					})

					it('IF-Match', () => {
						return schema.findById(id)
								.then(doc => {
									doc.requirements.push({requirement})
									return doc.save()
								})
								.then(doc => {
									customer = doc
									return testTarget.ifMatchRequirement(doc.requirements[0].id, doc.__v.toString())
								})
								.then(match => {
									expect(match).true
								})
					})
					describe('读取', () => {
						it('正确读取客户需求', () => {
							return schema.findById(id)
								.then(doc => {
									doc.requirements.push({date, requirement, creator})
									return doc.save()
								})
								.then(doc => {
									customer = doc
									return testTarget.findRequirementById(doc.requirements[0].id)
								})
								.then(doc => {
									expect(doc).eql({
										id: customer.requirements[0].id,
										customer: customer.id,
										date: date.toJSON(),
										requirement, creator,
										...__.pick(customer.toJSON(), '__v', 'updatedAt')
									})
								})
						})
					})

					describe('更新', () => {
						it('删除creator字段值', () => {
							return schema.findById(id)
								.then(doc => {
									doc.requirements.push({requirement: 'any', creator})
									return doc.save()
								})
								.then(doc => {
									customer = doc
									return testTarget.updateRequirement(doc.requirements[0].id, 
										{__v: customer.__v, date, requirement})
								})
								.then(doc => {
									expect(doc).exist
									return schema.findById(id)
								})
								.then(doc => {
									doc = doc.toJSON()
									expect(doc.__v).eql(customer.__v + 1)
									expect(__.pick(doc.requirements[0], 'date', 'requirement')).eql({
										date: date.toJSON(),
										requirement
									})
									expect(doc.requirements[0].creator).not.exist
								})
						})

						it('更新客户需求', () => {
							return schema.findById(id)
								.then(doc => {
									doc.requirements.push({requirement: 'any'})
									return doc.save()
								})
								.then(doc => {
									customer = doc
									return testTarget.updateRequirement(doc.requirements[0].id, 
										{__v: customer.__v, date, requirement, creator})
								})
								.then(doc => {
									expect(doc).exist
									return schema.findById(id)
								})
								.then(doc => {
									doc = doc.toJSON()
									expect(doc.__v).eql(customer.__v + 1)
									expect(__.pick(doc.requirements[0], 'date', 'requirement', 'creator')).eql({
										date: date.toJSON(),
										requirement, creator
									})
								})
						})
					})

					describe('删除', () => {
						it('指定客户需求不存在', () => {
							return testTarget.removeRequirement(ID_NOT_EXIST)
								.then((doc) => {
									expect(doc).not.exist
								})
						})

						it('删除客户需求', () => {
							return schema.findById(id)
								.then(doc => {
									doc.requirements.push({requirement: 'any'})
									return doc.save()
								})
								.then(doc => {
									customer = doc
									return testTarget.removeRequirement(doc.requirements[0].id)
								})
								.then((doc) => {
									expect(doc).exist
									return schema.findById(id)
								})
								.then(doc => {
									expect(doc.requirements.length).eql(0)
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
				
				beforeEach(() => {
					schema = require('../db/schema/Part');
					testTarget = require('../server/biz/Part');
				})

				describe('创建', () => {
					it('必须给出名称', () => {
						return testTarget.create({})
							.should.be.rejectedWith()
					})

					it('创建一最简单的原料/加工', () => {
						return testTarget.create({name})
							.then(doc => {
								expect(doc).eql({
									id: doc.id,
									type: 'material',
									name
								})
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
								expect(doc).eql({
									id: doc.id,
									code, type, name, creator, tags
								})
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

					it('查询结果', () => {
						let part
						return dbSave(schema, {code, type, name, creator, tags})
							.then((doc) => {
								part = doc
								return testTarget.search()
							})
							.then(docs => {
								expect(docs.length).eqls(1)
								expect(docs[0]).eql({
									id: part.id,
									code, type, name, creator, tags
								})
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

				describe('新增供应商原料/加工报价', () => {
					it('给出供应商原料/加工标识的报价', () => {
						return dbSave(schema, {supplier, part})
							.then(doc => {
								partQuot = doc
								return testTarget.create({date}, doc.id)
							})
							.then(doc => {
								expect(doc).eql({
									partQuots: partQuot.id,
									supplier, part,
									id: doc.id,
									date: date.toJSON(),
									type: 'inquery'
								})
								partQuot = doc
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
									date: date.toJSON(),
									type: 'inquery'
								})
							})
					})

					it('指定供应商原料/加工首次最简单报价', () => {
						return testTarget.create({supplier, part})
							.then(doc => {
								partQuot = doc
								expect(doc).eql({
									partQuots: doc.partQuots,
									supplier, part,
									id: doc.id,
									date: doc.date,
									type: 'inquery'
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
									type, price, ref, remark, tags
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
								expect(doc).eql({
									id: partQuot.quots[0].id,
									partQuots: partQuot.id,
									supplier, part, 
									date:date.toJSON(),
									type, price, ref, remark, tags,
									...__.pick(partQuot, '__v', 'createdAt', 'updatedAt')
								})
							})
					})

					
				})

				describe('更新供应商原料/加工报价', () => {
					beforeEach(() => {
						return dbSave(schema, {supplier, part, quots: [{}]})
							.then(doc => {
								partQuot = doc
							})
					})

					it('正确更新', () => {
						return testTarget.updateQuot(partQuot.quots[0].id, {
								__v: partQuot.__v,
								date, type, price, ref, remark, tags
							})
							.then(() => {
								return schema.findById(partQuot.id)
							})
							.then((doc) => {
								const quot = doc.quots[0].toJSON()
								expect(quot).eql({
									id: partQuot.quots[0].id,
									date: date.toJSON(),
									type, price, ref, remark, tags
								})
							})
					})
				})

				describe('删除供应商原料/加工报价', () => {
					beforeEach(() => {
						return dbSave(schema, {supplier, part, quots: [{}]})
							.then(doc => {
								partQuot = doc
							})
					})

					it('删除一条报价', () => {
						return schema.findById(partQuot.id)
							.then((doc) => {
								doc.quots.push({price})
								return doc.save()
							})
							.then(() => {
								return testTarget.removeQuot(partQuot.quots[0].id)
							})
							.then(() => {
								return schema.findById(partQuot.id)
							})
							.then((doc) => {
								expect(doc.quots.length).eql(1)
								const quot = doc.quots[0].toJSON()
								expect(quot.price).eql(price)
							})
					})

					it('无任何报价时，删除整条供应商原料/加工', () => {
						return testTarget.removeQuot(partQuot.quots[0].id)
							.then(() => {
								return schema.findById(partQuot.id)
							})
							.then((doc) => {
								expect(doc).not.exist
							})
					})
				})				

				it('IF-Match', () => {
					return dbSave(schema, {supplier, part, quots: [{}]})
							.then(doc => {
								return testTarget.ifMatchQuot(doc.quots[0].id, doc.__v.toString())
							})
							.then(match => {
								expect(match).true
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
								expect(docs[0]).eql({id, part})
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
								expect(docs[0]).eql({id, supplier})
							})
					})

					it('报价原料/加工与指定原料/加工一致', () => {
						let partId, quotId
						return dbSave(schema, {supplier, part, quots: [{}]})
							.then(doc => {
								partId = doc.part
								quotId = doc.quots[0].id
								return testTarget.checkQuotPart(partId, quotId)
							})
							.then(ok => {
								expect(ok).true
								return testTarget.checkQuotPart(ID_NOT_EXIST, quotId)
							})
							.then(ok => {
								expect(ok).false
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
								expect(doc.pic).not.exist;
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