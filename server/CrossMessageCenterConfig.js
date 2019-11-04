const logger = require('@finelets/hyper-rest/app/Logger'),
PO = require('./biz/pur/Purchases'),
INV = require('./biz/bas/Parts');

/* const executePurTransTask = require('./biz/batches/ExecutePurTransTask'),
// purchaseInInv = require('./biz/pur/Purchases').inInv,
InvInInv = require('./biz/inv/Invs').inInv //,
// InvLocInInv = require('./biz/inv/Locs').inInv */

module.exports = {
    connect: process.env.MQ,
    exchanges: {
        cross: {
            isDefault: true,
            publishes: [
                // 'importPurTransTaskCreated',
                'poInInv',
                'outInv'
            ],
            queues: {
                /* ImportedPurchaseTransactions: {
                    topic: 'importPurTransTaskCreated',
                    consumer: (doc) => {
                        let task = executePurTransTask()
                        logger.debug('Begin to exec task ........')
                        return task.exec(doc)
                            .then(() => {
                                return true
                            })
                    }
                }, */
                /* PoInInv_Purchase: {
                    topic: 'poInInv',
                    consumer: purchaseInInv
                }, */
                PoInInv_Inv: {
                    topic: 'poInInv',
                    consumer: (doc) => {
                        return PO.poInInv(doc.parent, doc.data.qty)
                            .then(() => {
                                logger.debug('Inventory qty is updated by InInv !!!')
                                return true
                            })
                    }
                },
                OutInv_Inv: {
                    topic: 'outInv',
                    consumer: (doc) => {
                        const qty = doc.qty * -1
                        return INV.updateInvQty(doc.part, qty)
                            .then(() => {
                                logger.debug('Inventory qty is updated by outInv !!!')
                                return true
                            })
                    }
                }
            }
        }
    }
}