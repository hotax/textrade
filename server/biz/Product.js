const schema = require('../../db/schema/Product'),
	createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
	__ = require('underscore'),
	logger = require('@finelets/hyper-rest/app/Logger')

const config = {
	schema,
	projection: {chains: 0},
	updatables: ['code', 'desc', 'content', 'constructure', 'yarn',
		'spec', 'grey', 'creator', 'tags', 'remark'
	],
	searchables: ['code', 'desc', 'content', 'constructure', 'yarn', 'remark', 'tags'],
	listable: {chains: 0}
}

const findProductChainWithFindByIdOrFindOne = (id, product) => {
	const func = product ? 'findById' : 'findOne'
	const arg = product ? product : {
			chains: {
				$elemMatch: {
					_id: id
				}
			}
		}
		return schema[func](arg)
			.then(doc => {
				let chain
				if(doc) {
					chain = doc.chains.id(id)
				}
				return {chain, product: doc}
			})
}

const addIn = {
	createProduct(data) {
		const toCreate = {...data, chains: undefined}
        return entity.create(toCreate)
    },

	createChain: (product, data) => {
		let row
		return schema.findById(product)
			.then(doc => {
				const chain = {...data, parts: []}
				row = doc.chains.push(chain)
				return doc.save()
			})
			.then(doc => {
				doc = doc.toJSON()
				const chain = doc.chains[row -1]
				delete chain.parts
				return {
					product: doc.id,
					...chain
				}
			})
			.catch(e => {
				logger.error('error when create a product chain: \n' + JSON.stringify(e, null, 2))
				throw e
			})
	},

	findChainById: (id, product) => {
		return findProductChainWithFindByIdOrFindOne(id, product)
			.then(({chain, product}) => {
				if (chain) {
					chain = chain.toJSON()
					delete chain.parts
					return {
						product: product.id,
						...chain,
						__v: product.__v
					}
				}
			})
	},

	ifMatchChain: (id, version) => {
		return entity.ifMatch({
			chains: {
				$elemMatch: {
					_id: id
				}
			}
		}, version)
	},

	updateChain: (id, toUpdate) => {
		return schema.findOne({
			__v: toUpdate.__v,
			chains: {
				$elemMatch: {
					_id: id
				}
			}
		})
		.then(doc => {
			const subDoc = doc.chains.id(id)
			__.each(['date', 'desc', 'customerRequirement', 'qty', 'creator', 'tags'], (key) => {
				if(toUpdate[key]) subDoc[key] = toUpdate[key]
				else subDoc[key] = undefined
			})
			return doc.save()
		})
	},

	removeChain: (id) => {
		return schema.findOne({
			chains: {
				$elemMatch: {
					_id: id
				}
			}
		})
		.then(doc => {
			if(doc) {
				const subDoc = doc.chains.id(id)
				subDoc.remove()
				return doc.save()
			}
		})
	},

	listChains: (product) => {
		return schema.findById(product)
			.then(doc => {
				doc = doc ? doc.toJSON() : []
				return __.map(doc.chains, (ch) => {
					return __.pick(ch, 'id', 'date', 'desc', 'qty', 'creator', 'tags')
				})
			})
	},

	listChainParts: (chain, product) => {
		return findProductChainWithFindByIdOrFindOne(chain, product)
			.then(({chain}) => {
				if (!chain) return []
				chain = chain.toJSON()
				return __.map(chain.parts, p => {
					return __.pick(p, 'id', 'part', 'price', 'remark')
				})
			})
	},

	addChainPart: (chain, chainPart, product) => {
		let productId, chainId
		let row
		return findProductChainWithFindByIdOrFindOne(chain, product)
			.then(({chain, product}) => {
				productId = product.id
				chainId = chain.id
				if(__.find(chain.parts, (p) => {
					return p.part.toString() == chainPart.part
				})) throw 'Duplicate part in a product chain'
				row = chain.parts.push(chainPart)
				return product.save()
			})
			.then(doc => {
				const part = doc.chains.id(chainId).parts[row - 1].toJSON()
				delete part.quots
				return {product: productId, chain: chainId, ...part}
			})
	},

	findProductChainPartById: (chainPartId) => {
		return schema.findOne({
			chains: {
				$elemMatch: {
					parts: {
						$elemMatch: {
							_id: chainPartId
						}
					}
				}
			}
		})
		.then(doc => {
			if(!doc) return
			doc = doc.toJSON()
			let part
			const chain = __.find(doc.chains, (ch) => {
				part = __.findWhere(ch.parts, {id: chainPartId})
				return part
			})
			delete part.quots
			const result = {
				product: doc.id,
				chain: chain.id,
				...part,
				__v: doc.__v
			}
			return result
		})
	},

	ifMatchChainPart: (id, version) => {
		return entity.ifMatch({
			chains: {
				$elemMatch: {
					parts: {
						$elemMatch: {
							_id: id
						}
					}
				}
			}
		}, version)
	}, 

	updateChainPart: (id, toUpdate) => {
		return schema.findOne({
			__v: toUpdate.__v,
			chains: {
				$elemMatch: {
					parts: {
						$elemMatch: {
							_id: id
						}
					}
				}
			}
		})
		.then(doc => {
			let part
			__.find(doc.chains, (ch) => {
				part = __.findWhere(ch.parts, {id})
				return part
			})
			__.each(['part', 'price', 'remark'], (key) => {
				if(toUpdate[key]) part[key] = toUpdate[key]
				else part[key] = undefined
			})
			return doc.save()
		})
	},

	removeChainPart: (id) => {
		return schema.findOne({
			chains: {
				$elemMatch: {
					parts: {
						$elemMatch: {
							_id: id
						}
					}
				}
			}
		})
		.then(doc => {
			if(doc) {
				let part
				__.find(doc.chains, (ch) => {
					part = __.findWhere(ch.parts, {id})
					return part
				})
				part.remove()
				return doc.save()
			}
		})
	},

	listChainsByRequirement: (requirement) => {
		let chain
		return schema.find({
			chains: {
				$elemMatch: {
					customerRequirement: requirement
				}
			}
		})
		.then(docs => {
			return __.map(docs, (doc) => {
				doc = doc.toJSON()
				chain = __.find(doc.chains, (ch) => {
					return ch.customerRequirement = requirement
				})
				delete chain.parts
				return chain
			})
		})
	}
}

const entity = createEntity(config, addIn)
module.exports = entity