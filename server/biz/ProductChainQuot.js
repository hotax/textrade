const schema = require('../../db/schema/Product'),
	partQuot = require('./PartQuot'), 
	entity = require('./Product'),
	__ = require('underscore'),
	logger = require('@finelets/hyper-rest/app/Logger')

const __check = (partId, quotId) => {
	return partQuot.checkQuotPart(partId, quotId)
}

module.exports = (checkQuotPart) => {
	checkQuotPart = checkQuotPart || __check
	return {
		listQuots: (chainPartId) => {
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
				if(!doc) return []
				doc = doc.toJSON()
				let part
				__.find(doc.chains, (ch) => {
					part = __.findWhere(ch.parts, {id: chainPartId})
					return part
				})
				return part.quots
			})
		},
	
		addQuot: (chainPartId, data) => {
			let part, product, chain, row
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
				product = doc
				chain = __.find(doc.chains, (ch) => {
					part = __.findWhere(ch.parts, {id: chainPartId})
					const quotExists = __.find(part.quots, (q) => {
						q = q.toJSON()
						return q.quot == data.quot
					})
					if(quotExists) logger.warn('产品链原料/加工报价已存在')
					return part && !quotExists
				})
				if(!chain) return Promise.reject()
				return checkQuotPart(part.part.toString(), data.quot)
			})
			.then(ok => {
				if(!ok) {
					logger.warn('报价原料/加工与产品链原料/加工不一致')
					return Promise.reject()
				}
				row = part.quots.push(data)
				return product.save()
			})
			.then((doc) => {
				chain = doc.chains.id(chain.id)
				part = chain.parts.id(part.id)
				const quot = part.quots[row - 1]
				return {
					id: quot.id,
					quot: data.quot
				}
			})
			.catch(e => {
				throw e
			})
		},

		ifMatchQuot: (id, version) => {
			return entity.ifMatch({
				chains: {
					$elemMatch: {
						parts: {
							$elemMatch: {
								quots: {
									$elemMatch: {
										_id: id
									}
								}
							}
						}
					}
				}
			}, version)
		},

		findQuotById: (id) => {
			let part, product, chain, quot
			return schema.findOne({
				chains: {
					$elemMatch: {
						parts: {
							$elemMatch: {
								quots: {
									$elemMatch: {
										_id: id
									}
								}
							}
						}
					}
				}
			})
			.then(doc => {
				if(!doc) return
				product = doc.toJSON()
				chain = __.find(product.chains, (ch) => {
					part = __.find(ch.parts, (p) => {
						quot = __.find(p.quots, (q) => {
							return q.id == id
						})
						return quot
					})
					return part
				})
				return {
					product: product.id,
					chain: chain.id,
					part: part.id,
					...quot,
					__v: product.__v
				}
			})
		},

		removeQuot: (id) => {
			let part, product, chain, quot
			return schema.findOne({
				chains: {
					$elemMatch: {
						parts: {
							$elemMatch: {
								quots: {
									$elemMatch: {
										_id: id
									}
								}
							}
						}
					}
				}
			})
			.then(doc => {
				if(!doc) return
				product = doc
				chain = __.find(product.chains, (ch) => {
					part = __.find(ch.parts, (p) => {
						quot = __.find(p.quots, (q) => {
							return q.id == id
						})
						return quot
					})
					return part
				})
				quot.remove()
				return product.save()
			})
		}
	}
}