const createSchema = require('@finelets/hyper-rest/db/mongoDb/CreateSchema')

const contact = createSchema({
        name: String,
        phone: String,
        email: String
    })
module.exports = contact