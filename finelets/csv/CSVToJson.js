const __ = require('underscore'),
    logger = require('@finelets/hyper-rest/app/Logger'),
    defaultType = require('./JsonValueTypes').Default

class CsvToJson {
    constructor() {
        this.__columns = []
    }

    addColumn(name, type = defaultType) {
        this.__columns.push({
            name: name,
            type: type
        })
        return this
    }

    parse(csv) {
        if (this.__columns.length === 0) {
            logger.error('no column is defined')
            throw 'no column is defined'
        }
        let vals = csv.split(',')
        if (vals.length !== this.__columns.length) {
            logger.error('format error: the row val acturally have ' + vals.length + ' fields')
            return null
        }
        let cols = []
        for (let i = 0; i < vals.length; i++) {
            let colval = this.__columns[i].type(vals[i])
            if (colval === null) {
                logger.error('format error: the column ' + this.__columns[i].name + ' value ' + colval + ' is not match type defined')
                return null;
            }
            if (colval !== undefined) cols.push([this.__columns[i].name, colval])
        }

        return __.object(cols)
    }
}

module.exports = () => new CsvToJson()