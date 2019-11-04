const po = require('../pur/Purchases'),
    purReview = require('../pur/Reviews'),
    inInv = require('../inv/InInvs'),
    outInv = require('../inv/OutInvs'),
    part = require('../bas/Parts'),
    suppliers = require('../bas/Suppliers'),
    employee = require('../bas/Employee'),
    purTransTask = require('./ImportPurTransTask'),
    logger = require('@finelets/hyper-rest/app/Logger'),
    __ = require('underscore');

const partType = {
    器具: 4,
    耗材: 3,
    资产: 2,
    料品: 1
};

const supplyType = {
    厂家: 1,
    电商: 2,
    实体店: 3
};

const __extractFields = (source, fields) => {
    let data = {};
    __.each(fields, (fld) => {
        if (source[fld]) {
            data[fld] = source[fld];
        }
    });
    return data;
};

const __extractPart = (doc) => {
    if (!doc.partName) throw 'Part name is required';
    const fields = ['spec', 'unit'];
    let data = __extractFields(doc, fields);
    let type = doc.partType;
    if (type) {
        type = partType[type];
        if (!type) throw 'invalid part type value: ' + doc.partType;
    }
    if (type) data.type = type;

    data.name = doc.partName;

    return data;
};

const __extractSupplier = (doc) => {
    let data = {}
    let type = doc.supply;
    if (type) {
        type = supplyType[type];
        // if (!type) throw 'supply value is invalid: ' + doc.supply;
    }
    if (type) data.type = type;
    if (doc.supplyLink) data.link = doc.supplyLink
    data.name = doc.supplier;
    return data;
};

const __extractPurchase = (doc) => {
    const fields = ['qty', 'price', 'amount', 'refNo', 'purPeriod', 'appDate', 'remark'];

    let data = __extractFields(doc, fields);
    data.left = data.qty
    if (doc.appDate) data.createDate = doc.appDate;
    if (doc.transNo) {
        data.code = doc.transNo;
        data.source = doc.transNo;
    }
    data.state = 'Draft'
    return data;
};

const __extractReview = (po, reviewer, doc) => {
    let data = {po, reviewer}
    if (doc.reviewDate) {
        data.reviewDate = doc.reviewDate
    }

    return data
};

const __extractInInv = (po, doc) => {
    let data = {po, source: doc.transNo}
    data.qty = doc.qty
    if (doc.invLoc) data.loc = doc.invLoc
    data.date = doc.invDate

    return data
};

const __extractOutInv = (part, doc) => {
    let data = {
        part: part,
        qty: doc.useQty,
        source: doc.transNo
    }
    if (doc.useDate) data.date = doc.useDate
    if (doc.project) data.project = doc.project

    return data
};

const __pubBas = (doc, extract, create) => {
    let data;
    let result = {
        errors: []
    };
    try {
        data = extract(doc);
    } catch (err) {
        result.errors.push(err);
        return Promise.resolve(result);
    }
    return create(data)
        .then((doc) => {
            result.id = doc.id;
            return result;
        })
        .catch((err) => {
            result.errors.push(err);
            return result;
        })
}

class ExecutePurTransTask {
    pubPart(doc) {
        return __pubBas(doc, __extractPart, (data) => {
            return part.createNotExist(data)
        })
    }

    pubSupplier(doc) {
        if (!doc.supplier) return Promise.resolve({
            errors: []
        })
        return __pubBas(doc, __extractSupplier, (data) => {
            return suppliers.createNotExist(data)
        })
    }

    pubEmployee(who) {
        let result = {
            errors: []
        };
        if (!who) return Promise.resolve(result)

        return employee.createNotExist({
                name: who
            })
            .then((doc) => {
                result.id = doc.id;
                return result;
            })
            .catch((err) => {
                result.errors.push(err);
                return result;
            })
    }

    pubPurchase(partId, doc) {
        let task = this;
        let data = __extractPurchase(doc);
        let bas = [];
        bas.push(task.pubSupplier(doc));
        bas.push(task.pubEmployee(doc.applier));
        return Promise.all(bas)
            .then((ids) => {
                data.part = partId
                if (ids[0] && ids[0].id) data.supplier = ids[0].id;
                if (ids[1] && ids[1].id) {
                    data.applier = ids[1].id;
                    if (doc.purchaser === doc.applier) {
                        data.creator = data.applier;
                    } else {
                        return task.pubEmployee(doc.purchaser)
                            .then((result) => {
                                if (result.id) data.creator = result.id
                            })
                    }
                }
            })
            .then(() => {
                return po.createBySource(data);
            })
            .then((doc) => {
                return doc.id;
            });
    }

    pubReview(po, doc) {
        if (!doc.reviewer) return Promise.reject('reviewer is not found')
        return this.pubEmployee(doc.reviewer)
            .then((result) => {
                let data = __extractReview(po, result.id, doc)
                return purReview.create(data)
            })
            .then((doc) => {
                return doc.id
            })
    }

    pubInInv(po, doc) {
        if (!doc.invDate) return Promise.reject('inInv is not found')
        let data = __extractInInv(po, doc)
        return inInv.create(data)
            .then((doc) => {
                return doc.id
            })
    }

    pubOutInv(part, doc) {
        if (!doc.useQty) return Promise.reject('outInv is not found')
        let task = this
        const __pub = (part, user, doc) => {
            let data = __extractOutInv(part, doc)
            if (user) data.user = user
            return outInv.create(data)
                .then((doc) => {
                    return doc.id
                })
        }
        if (!doc.user) return __pub(part, null, doc)

        return task.pubEmployee(doc.user)
            .then((result) => {
                return __pub(part, result.id, doc)
            })
    }

    exec(doc) {
        let task = this;
        let partId, purId, reviewId, inInvId, outInvId
        return task.pubPart(doc.task)
            .then((data) => {
                if (!data || !data.id) {
                    logger.error('TransNo:[' + doc.transNo + '] ---- Part is not found')
                    return Promise.reject()
                }
                partId = data.id
                logger.debug('purchase trans ' + doc.transNo + ' part is published')
                return task.pubPurchase(partId, doc.task)
            })
            .then((id) => {
                purId = id;
                logger.debug('purchase trans ' + doc.transNo + ' purchase is published')
                return task.pubReview(purId, doc.task)
            })
            .then((id) => {
                // outInvId = id
                return purTransTask.updateState(doc.id, {
                    purchase: purId,
                    review: reviewId,
                    // inInv: inInvId,
                    // outInv: outInvId
                })
            })
            /* .then((id) => {
                reviewId = id
                logger.debug('purchase trans ' + doc.transNo + ' review is published')
                return task.pubInInv(purId, doc.task)
            })
            .then((id) => {
                inInvId = id
                logger.debug('purchase trans ' + doc.transNo + ' inInv is published')
                // TODO: 暂不处理出库交易
                // return task.pubOutInv(partId, doc.task)
            })
            .then((id) => {
                // outInvId = id
                return purTransTask.updateState(doc.id, {
                    purchase: purId,
                    review: reviewId,
                    inInv: inInvId,
                    // outInv: outInvId
                })
            }) */
            .catch((err) => {
                if (purId) {
                    let state = {
                        purchase: purId
                    }
                    if (reviewId) state.review = reviewId
                    if (inInvId) state.inInv = inInvId
                    // if (outInvId) state.outInv = outInvId

                    return purTransTask.updateState(doc.id, state)
                }
            });
    }
}

module.exports = () => {
    return new ExecutePurTransTask();
};