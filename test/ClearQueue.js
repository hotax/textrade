const mqConnStr = 'amqp://qladapfm:CjtgA21O-1Ux-L108UCR70TcJ4GDpRVh@spider.rmq.cloudamqp.com/qladapfm'
const amqp = require('amqplib'),
logger = require('@finelets/hyper-rest/app/Logger');

const clearQueue = (queueName) => {
    return amqp.connect(mqConnStr)
        .then((conn) => {
            return conn.createChannel()
        })
        .then((ch) => {
            return ch.deleteQueue(queueName)
        })
        .then(() => {
            logger.debug('The queue "' + queueName + '" is deleted!!!!')
        })
}

module.exports = clearQueue