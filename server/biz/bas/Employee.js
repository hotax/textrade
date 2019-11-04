const schema = require('../../../db/schema/bas/Employee'),
    createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
    dbSave = require('../../../finelets/db/mongoDb/saveNotExist')

const config = {
    schema,
    projection: '-password',
    updatables: ['userId', 'name', 'pic', 'email'],
    searchables: ['userId', 'name', 'email'],
    listable: 'name',
    setValues: (doc, data) => {
        // do nothing but an example
        /* if (data.userId && !doc.password) {
            doc.password = '9'
        } */
    }
}

const obj = {
    createNotExist: (data) => {
        if (!data.name) return Promise.reject('employee name is required')
        return dbSave(schema, ['name'], data)
    },

    authenticate: (userName, password) => {
        return schema.findOne({
                userId: userName,
                password: password,
                inUse: true
            }, ['userId', 'name', 'email', 'pic', 'isAdmin', 'roles'])
            .then(doc => {
                if (doc) {
                    return doc.toJSON()
                }
            })
    },

    authorize: (_id, { __v, isAdmin, roles }) => {
        return schema.findById(_id)
        .then(doc => {
            if (doc && doc.__v === __v) {
                if(isAdmin) {
                    doc.inUse = true
                    doc.isAdmin = true
                    doc.roles = undefined
                } else if(roles) {
                    doc.inUse = true
                    doc.isAdmin = undefined
                    doc.roles = roles
                } else {
                    doc.inUse = undefined
                    doc.isAdmin = undefined
                    doc.roles = undefined
                }
                return doc.save()
            }
        })
        .then(data => {
            if(data) data = data.toJSON()
            return data
        })
        .catch(e => {
            if (e.name === 'CastError') return false
            throw e
        }) 
    },

    updatePassword: (_id, {oldPassword, password}) => {
        return schema.updateOne({_id, password: oldPassword}, {$set: {password}})
            .then(data => {
                return data.n === 1 && data.nModified === 1 && data.ok === 1
            })
            .catch(e => {
                if (e.name === 'CastError') return false
                throw e
            })
    }
}

const types = {
    ALL: {},
    NONUSER: {
        inUse: {
            $ne: true
        },
        isAdmin: {
            $ne: true
        }
    },
    ALLUSER: {
        $or: [{
            inUse: true
        }, {
            isAdmin: true
        }]
    },
    ADMIN: {
        isAdmin: true
    },
    NONADMINUSER: {
        inUse: true,
        isAdmin: {
            $ne: true
        }
    },
}

const entity = createEntity(config, obj)
const search = entity.search
entity.search = (cond, text, sort) => {
    let finalCond = {
        ...cond
    }
    if (finalCond.TYPE) {
        const condType = finalCond.TYPE
        delete finalCond.TYPE
        if (types[condType]) finalCond = {
            ...finalCond,
            ...types[condType]
        }
    }
    return search(finalCond, text, sort)
}

module.exports = entity