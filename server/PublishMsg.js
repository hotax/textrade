logger = require('@finelets/hyper-rest/app/Logger')

function publish(topic, msg){
    let pub = require('./CrossMessageCenter')[topic]
    if(pub) {
        logger.debug('Publish ' + topic + ' message:\r\n' + JSON.stringify(msg, null, 2))
        pub(msg)
    } else {
        logger.error('An ' + topic + ' message did not be send out !!!!')
    }
}
module.exports = publish