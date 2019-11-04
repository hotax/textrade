const createExtractors = require('../../finelets/common/CreateDataExtractors'),

    config = {
        importPurTransTask: {
            fields: ['transNo', 'partType', 'partName',
                'spec', 'unit', 'qty', 'price', 'amount', 'supplier', 'supply', 'refNo',
                'supplyLink', 'purPeriod', 'applier', 'appDate', 'reviewer', 'reviewDate',
                'purDate', 'purchaser', 'invDate', 'user', 'useDate', 'useQty', 'project',
                'invLoc', 'remark'
            ],
            rules: {
                transNo: {
                    required: true
                },
                partName: {
                    required: true
                },
                qty: {
                    required: true
                },
                amount: {
                    required: true
                },
                supplier: {
                    required: true
                }
            }
        },
        partFromPurTransTask: {
            fields: ["partType", "partName", "spec", "unit"],
            rules: {}
        },
        purApplyFromPurTransTask: {
            fields: ["transNo", "partType", "partName", "spec",
                "unit", "qty", "price", "amount",
                "supplier", "supply", "supplyLink",
                "purPeriod", "applier", "appDate", "remark"
            ],
            rules: {}
        },
        purReviewFromPurTransTask: {
            fields: ['reviewer', 'reviewDate'],
            rules: {
                reviewer: {
                    required: true
                },
                reviewDate: {
                    required: true
                },
            }
        },
        purchaseFromPurTransTask: {
            fields: ['refNo', 'purchaser', 'purDate'],
            rules: {
                purchaser: {
                    required: true
                },
                purDate: {
                    required: true
                },
            }
        },
        purInInvFromPurTransTask: {
            fields: ['invDate', 'invLoc'],
            rules: {
                invLoc: {
                    required: true
                },
                invDate: {
                    required: true
                },
            }
        },
        purOutInvFromPurTransTask: {
            fields: ['project', 'user', 'useDate', 'useQty'],
            rules: {
                user: {
                    required: true
                },
                useQty: {
                    required: true
                },
                useDate: {
                    required: true
                },
            }
        },
    }

module.exports = createExtractors(config)