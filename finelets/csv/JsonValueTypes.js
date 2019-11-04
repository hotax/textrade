const general = (convert, strVal) => {
    if(strVal.length === 0) return undefined
    let val = convert(strVal)
    return isNaN(val) ? null : val
}

const __removeEql = (str) => {
    if(str.startsWith('"') && str.endsWith('"')){
        str = str.substr(1, str.length - 2)
    }
    return str
}

module.exports = {
    Default: (strVal) => {
        return strVal.length ? __removeEql(strVal) : undefined
    },
    Number: (strVal) => general(Number, strVal),

    Date: (strVal) => {
        let val = general((strVal)=>new Date(strVal), strVal)
        return val ? val.toJSON() : val
    },
    Bool: (strVal) => {
        if(strVal.length === 0) return undefined
        strVal = strVal.toLowerCase().trim()
        return strVal === 'true' ? true : (strVal === 'false') ? false : null
    }
}