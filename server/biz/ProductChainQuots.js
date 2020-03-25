const schema = require('../../db/schema/Product'),
	partQuot = require('./PartQuot'), 
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
				return __.map(part.quots, (q) => {
					return {quot: q.quot}
				})
			})
		},
	
		addQuot: (chainPartId, data) => {
			let part, product
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
				const chain = __.find(doc.chains, (ch) => {
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
				part.quots.push(data)
				return product.save()
			})
			.then(() => {
				return {quot: data.quot}
			})
			.catch(e => {
				throw e
			})
		}
	}
}