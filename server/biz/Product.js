const schema = require('../../db/schema/Product'),
	createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
	logger = require('@finelets/hyper-rest/app/Logger')

const config = {
	schema,
	projection: ['-suppliers'],
    updatables: ['code', 'desc', 'content', 'constructure', 'yarn',
                'spec', 'grey', 'creator', 'tags', 'remark'],
	searchables: ['code', 'desc', 'content', 'constructure', 'yarn', 'remark', 'tags']
}

const addIn = {
};

module.exports = createEntity(config, addIn);
