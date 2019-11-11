const schema = require('../../db/schema/Supplier'),
	createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity')

const config = {
	schema,
    updatables: ['code', 'name', 'address', 'account', 'link', 'contacts', 'tags'],
    searchables: ['code', 'name', 'address', 'tags']
}

/* const addIn = {
} */

// module.exports = createEntity(config, addIn);
module.exports = createEntity(config);
