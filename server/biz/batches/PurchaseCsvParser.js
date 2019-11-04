const csvToJson = require('../../../finelets/csv/CSVToJson')(),
    jsonValueTypes = require('../../../finelets/csv/JsonValueTypes')

csvToJson
    .addColumn('transNo')
    .addColumn('partType')
    .addColumn('partName')
    .addColumn('spec')
    .addColumn('unit')
    .addColumn('qty', jsonValueTypes.Number)
    .addColumn('price', jsonValueTypes.Number)
    .addColumn('amount', jsonValueTypes.Number)
    .addColumn('supplier')
    .addColumn('supply')
    .addColumn('refNo')
    .addColumn('supplyLink')
    .addColumn('purPeriod', jsonValueTypes.Number)
    .addColumn('applier')
    .addColumn('appDate', jsonValueTypes.Date)
    .addColumn('reviewer')
    .addColumn('reviewDate', jsonValueTypes.Date)
    .addColumn('purchaser')
    .addColumn('invDate', jsonValueTypes.Date)
    .addColumn('user')
    .addColumn('useDate', jsonValueTypes.Date)
    .addColumn('useQty', jsonValueTypes.Number)
    .addColumn('project')
    .addColumn('invLoc')
    .addColumn('remark')

module.exports = (line) => {
    return csvToJson.parse(line)
}