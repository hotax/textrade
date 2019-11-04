const schema = require('../../../db/schema/pur/Purchase')
const func = {
    create: (data) => {
        if (!data.reviewer) return Promise.reject('reviewer is required')
        return schema.findById(data.po)
            .then((doc) => {
                if (!doc) return Promise.reject('po[' + data.po + '] not found')
                doc.reviewer = data.reviewer
                doc.reviewDate = data.reviewDate ? data.reviewDate : new Date()
                doc.state = 'Approved'
                return doc.save()
            })
            .then((doc) => {
                return doc.toJSON()
            })
    }
}

module.exports = func