const locSchema = require('../../../db/schema/inv/Loc'),
    PO = require('../pur/Purchases'),
    __ = require('underscore'),
    logger = require('@finelets/hyper-rest/app/Logger'),
    dbSave = require('../../../finelets/db/mongoDb/dbSave');

const __defaultLoc = '@@@CROSS@@@'

module.exports = {
    inInv: (doc) => {
        let partId
        let loc = doc.loc || __defaultLoc
        let date = doc.date || new Date()
        return PO.getPart(doc.po)
            .then((data) => {
                partId = data.id
                return dbSave(locSchema, {
                    loc: loc,
                    part: partId,
                    date: date,
                    qty: doc.qty
                })
            })
            .then((doc) => {
                logger.debug('料品移入库位：\r\n' + JSON.stringify(doc, null, 2))
                return true
            })
    },

    listLocState: condi => {
        const query = [{
                $lookup: {
                    from: 'parts',
                    localField: 'part',
                    foreignField: '_id',
                    as: 'partDoc'
                }
            },
            {
                $group: {
                    _id: {loc: '$loc', part: '$partDoc'},
                    qty: {
                        $sum: '$qty'
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ];

        return locSchema.aggregate(query).then((docs) => {
            let result = {
                items: []
            }
            __.each(docs, doc=>{
                let item = {
                    loc: doc._id.loc,
                    qty: doc.qty
                }
                let docPart = doc._id.part[0]
                let part = {
                    id: docPart._id.toString(),
                    name: docPart.name
                }
                if(docPart.spec) part.spec = docPart.spec
                item.part = part
                result.items.push(item)
            })
            return result
        });
    }
}