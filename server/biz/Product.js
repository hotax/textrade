const schema = require('../../db/schema/Product'),
	createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
	__ = require('underscore'),
	logger = require('@finelets/hyper-rest/app/Logger')

const config = {
	schema,
	projection: ['-chains'],
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
	create(data) {
		const toCreate = {...data, chains: undefined}
        return new schema(toCreate).save()
            .then(doc => {
                return {id: doc.id}
            })
    },

	createChain: (product, data) => {
		let row
		return schema.findById(product)
			.then(doc => {
				row = doc.chains.push(data)
				return doc.save()
			})
			.then(doc => {
				doc = doc.toJSON()
				return {
					product: doc.id,
					id: doc.chains[row - 1].id
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

	listChains: (product) => {
		return schema.findById(product)
			.then(doc => {
				doc = doc ? doc.toJSON() : []
				return __.map(doc.chains, (ch) => {
					const {id, date, desc, qty, creator, tags} = ch
					return {id, date, desc, qty, creator, tags}
				})
			})
	},

	listChainParts: (chain, product) => {
		return findProductChainWithFindByIdOrFindOne(chain, product)
			.then(({chain}) => {
				if (!chain) return []
				chain = chain.toJSON()
				return __.map(chain.parts, p => {
					const {id, part, price, remark} = p
					return {id, part, price, remark}
				})
			})
	},

	addChainPart: (chain, chainPart, product) => {
		let productId, chainId, id
		let row
		return findProductChainWithFindByIdOrFindOne(chain, product)
			.then(({chain, product}) => {
				productId = product.id
				chainId = chain.id
				row = chain.parts.push(chainPart)
				return product.save()
			})
			.then(doc => {
				id = doc.chains.id(chainId).parts[row - 1].id
				return {product: productId, chain: chainId, id}
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
			const {id, __v, createdAt, updatedAt} = doc
			delete part.quots
			const result = {
				product: id,
				chain: chain.id,
				...part,
				__v, createdAt, updatedAt
			}
			return result
		})
	}
}

module.exports = createEntity(config, addIn);