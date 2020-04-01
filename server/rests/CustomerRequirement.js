const {
    ifMatchRequirement,
    updateRequirement,
    removeRequirement,
    findRequirementById
} = require('../biz/Customer');

const ifNoneMatch = (id, version) => {
    return ifMatchRequirement(id, version)
        .then(match => {
            return !match
        })
}

module.exports = {
    url: '/textrade/api/customers/requirements/:id',
    transitions: {
        ProductChain: {id: 'context'}
    },
    rests: [{
            type: 'read',
            ifNoneMatch,
            dataRef: {
                User: 'creator'
            },
            handler: findRequirementById
        },
        {
            type: 'update',
            ifMatch: ifMatchRequirement,
            handler: updateRequirement
        },
        {
            type: 'delete',
            handler: removeRequirement
        }
    ]
}