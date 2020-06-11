const logger = require('@finelets/hyper-rest/app/Logger'),
    employee = require('./biz/Employee'),
    picGridFs = require('./biz/PicGridFs')

module.exports = {
    connect: process.env.MQ,
    exchanges: {
        textrade: {
            isDefault: true,
            publishes: [
                'employeePicChanged',
                'removePic'
            ],
            queues: {
                EmployeePicChanged: {
                    topic: 'employeePicChanged',
                    consumer: ({
                        id,
                        pic
                    }) => {
                        logger.debug(`handle message employeePicChanged: {id: ${id}, pic: ${pic}}`)
                        return employee.updatePic(id, pic)
                            .then(() => {
                                return true
                            })
                            .catch(e => {
                                return true
                            })
                    }
                },
                RemovePic: {
                    topic: 'removePic',
                    consumer: (pic) => {
                        logger.debug(`handle message removePic: ${pic}`)
                        return picGridFs.remove(pic)
                            .then(() => {
                                return true
                            })
                            .catch(e => {
                                return true
                            })
                    }
                }
            }
        }
    }
}