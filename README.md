# TexTrade - 亿泰业务管理系统

系统主要目标在于帮助业务员针对客户需求进行报价。

首先，业务员需要向系统提供客户、供应商、产品、原料（加工）等基本信息，并及时加以维护。

当客户通过各种询价方式（如电话、EMail等）提出的明确的购买需求时，业务员须及时记录此客户需求，如果后续同客户沟通过程中
发生变化，则应对该客户需求进行相应修改。客户需求的主要内容包括：日期、客户、需求（可支持MarkDown格式）、附件列表、
标签、业务员等。

在明确了客户实际需求后，需要通过系统提供的多种在线[业务查询](#业务查询)帮助业务员在线下确定可能能够满足特定客户需求
的目标产品及其生产方案和供应商报价，其间可能涉及大量工作，例如：

  * 在产品目录中查询产品
    * 查询指定产品的客户需求
      * 查询指定客户需求的指定目标产品的生产方案
        * 查询指定客户需求的指定目标产品的指定生产方案中所包含的各种原料或加工及其供应商报价
    * 查询指定产品已有的生产方案
    * 查询指定产品已有的对外报价
  * 查询原料（加工）
    * 查询指定原料（加工）供应商报价
  
当业务员获得供应商对特定原料（加工）的报价时应及时记录，其内容包括：日期、供应商、原料（加工）、报价、标签、说明、业务员。

业务员可以为特定产品创建生产方案，其内容包括：产品、方案说明、原料/加工及其报价列表、标签、业务员、创建/更新日期。

业务员可以为特定客户需求指定一个或多个生产方案，其内容包括：客户需求、生产方案、业务员、创建/更新日期。

业务员可以针对特定客户需求相关联的一个或多个生产方案对外报价，其内容包括：客户需求、生产方案、报价/更新日期、报价、业务员。

## 业务员
业务员主要

业务员需要通过系统完成以下工作：
* 提供和维护客户基本信息
* 记录客户需求
* 针对客户需求进行报价
  

同业务员相关联的信息包括：客户

### 客户（Customers）
同客户相关联的信息包括：需求、产品

#### 需求（Requirements）
客户需求是指客户通过各种询价方式（如电话、EMail等）提出的采购需求。

业务员在获得客户需求后，如果希望对此客户需求进行进一步响应时，向系统输入该客户需求，内容包括：
* 客户
* 需求 - 可支持MarkDown格式
* 日期
* 标签
* 业务员

同客户需求相关的信息包括：产品、生产方案、报价

##### 客户需求目标产品

### 原料或加工
原料或加工是特定的供应商所能提供的可用于产品生产的原材料或加工工序服务，例如：坯布、印花等。
原料或加工的内容包括：
* 类型 - 原料或加工的标准分类
* 名称 - 可用于识别特定原料或加工的描述
* 规格 - 原料或加工的一组相关的规格性描述。
  * 属性 - 用以描述特定规格的属性
  * 描述 - 对规格属性的描述
* 样品图片
  * 图片
  * 说明
* 标签 - 辅助分类信息

### 供应报价（SupplyingQuot）
供应报价是业务员向供应商询价相关产品后向系统输入的有关供应商、产品、价格之间的相互关系。可用以满足一个或多个客户需求。

供应报价的内容包括：
* 产品 - 供应报价的相关产品，一种产品可包含多个供应商报价列表
* 供应商报价列表 - 对于特定产品各个供应商的报价
  * 供应商 - 提供报价的供应商
  * 产品编号 - 供应商对产品的编号
  * 产品名称 - 供应商产品名称
  * 报价列表 - 对于特定产品，供应商在不同的时间，出于不同的原因所提出或能够接受的价格
    * 日期 - 报价日期
    * 价格 - 报价
    * 原因 - 报价原因
      * 类型 - 报价原因的类型，例如：询价、报价、成交价等
      * 参考单号 - 不同的报价原因相关的参考单据编号
      * 说明
  
## 业务查询

- 产品
  - 客户需求
  - 生产方案

## 系统安装
假设安装目录为: /home/jsmtest/apps

Clone cross：

```
git clone -b docker-deploy-test https://github.com/JSMetta/cross.git
cd cross
git pull origin dev

git clone -b vcross-1.0.1 https://github.com/JSMetta/VCross.git
cd VCross
git pull origin vcross-1.0.1

cd ..

docker-compose up --build -d

```
cross项目在/home/jsmtest/apps/cross中


## 常用命令

cd /home/jsmtest/apps/cross
git pull origin docker-deploy-test
docker build -t jsmetta/cross .
docker run -d --name redis -p 6379:6379 redis

docker run --name mongodb --restart unless-stopped -v /home/mongo/data:/data/db -v home/mongo/backups:/backups -d mongo --smallfiles

docker run -d -p 8089:8080 --link redis:redis --name cross jsmetta/cross

docker run -it --link mongodb:mongo --rm mongo mongo --host mongo test

docker run -d --name nginx -p 80:80 --link cross:cross cross/nginx

docker-compose up --build

docker exec -it mongodb mongo

#### Remove dangling images
docker images -f dangling=true
docker images purge

## 开发文档

处理消息时，如果返回：
* Promise.resolve(true) - 接收消息
* Promise.resolve(false) - 拒绝消息，重新进入消息列表
* Promise.reject(err) - 拒绝消息，消息将被废弃

### REST服务

#### PoTransactions - 采购单交易集合

采购单交易集合资源提供采购单交易查询和交易执行服务

##### 采购单交易查询服务

采购单交易查询服务实现为标准Finelets REST查询服务。
* 参数
  * id -- 采购单标识
* 返回 -- 采购单交易资源（PoTransaction）数据集合。

##### 执行采购单业务交易
执行采购单业务交易实现为标准Finelets Create REST服务。
* 参数
  * id -- Uri param，采购单标识
  * type -- Uri query，业务交易类型，有效交易类型包括：
    * commit -- 提交审批
    * review -- 审核
    * inv -- 入库
* 交易数据（request body）
  * __v -- 采购单版本号
  * actor -- 当前业务交易执行者标识，例如，如果当前交易为入库，则actor为库管人员
  * date -- 交易日期
  * data -- 交易相关信息
  * remark -- 交易备注
* 返回结果
  * 201 -- 交易成功，并返回采购入库交易资源
  * 400 -- 交易参数错误，如单号不存在、无交易数据等
  * 500 -- 交易失败
   
###### 采购入库
采购入库是对处于"执行"状态的采购单相关采购到货进行入库，其结果包括：
* 记录采购入库单
* 更新库存量 -- 库存量 = 当前库存量 + 入库量
* 更新在单量 -- 在单量 = 当前在单量 - 入库量

采购入库的交易相关信息包括：
* qty -- 入库数量，required
* loc -- 库位
* refNo -- 参考单号
  
业务规则包括：

* 交易数据合法
  * 由id指定的采购单必须存在
  * 当前采购单版本号必须与交易数据中__v给出的版本号一致
  * 当前采购单必须处于"执行/open"状态
  * 必须指定入库交易者，且入库交易者必须存在
  * 如未指定入库日期，则取数据库当前日期
  * 必须指定非0的入库数量，入库数量可以为负， 以应用于入库数量对冲 

采购入库交易返回采购入库单资源：
* type -- 'inv'，为采购单交易类型
* id -- 采购单交易标识
* parent -- 采购单标识
* actor -- 交易者标识
* date -- 交易日期
* data -- 入库信息
  * qty -- 数量
  * loc -- 库位
  * refNo -- 参考单号
* remark -- 交易备注
  

## 业务规则

### 采购单业务交易



### 采购交易导入
采购交易可以通过CSV文件导入，格式为：
* 首行为字段名称
* 字段
  * 交易编号
  * 品名
  * 料品类型 - 低值易耗品/资产/料品（采购/委外）
  * 规格
  * 单位
  * 供应商类型 - 实体店/电商/厂家
  * 供应商名称
  * 供应商链接
  * 采购周期
  * 采购单价
  * 数量
  * 金额
  * 申请人
  * 申请日期
  * 审核人
  * 审核日期
  * 采购日期
  * 采购人
  * 到货日期
  * 领用人
  * 领用日期
  * 领用项目
  * 领用数量
  * 货位

```
交易编号,料品类型,品名,规格,单位,数量,采购单价,金额,供应商名称,供应商类型,参考单号,供应商链接,采购周期,申请人,申请日期,审核人,审核日期,采购日期,采购人,到货日期,领用人,领用日期,领用数量,领用项目,货位,备注

transNo,partType,partName,spec,unit,qty,price,amount,supplier,supply,refNo,supplyLink,purPeriod,applier,appDate,reviewer,reviewDate,purDate,purchaser,invDate,user,useDate,useQty,project,invLoc,remark

const expected = {
                        transNo: 'xulei00001',
                        partType: '物料',
                        partName: 'JSM-A1实验用格子布',
                        spec: 'abcd',
                        unit: '米',
                        qty: 150,
                        price: 8800,
                        amount: 8800,
                        supplier: '绍兴惟楚纺织品有限公司',
                        supply: '厂商',
                        refNo: 'JSMCONV20181109A',
                        supplyLink: '开票中',
                        purPeriod: 80,
                        applier: '徐存辉',
                        appDate: new Date('2018/11/9').toJSON(),
                        reviewer: '徐存辉',
                        reviewDate: new Date('2018/11/9').toJSON(),
                        purchaser: '徐存辉',
                        purDate: new Date('2018/11/9').toJSON(),
                        invDate: new Date('2018/12/12').toJSON(),
                        user: '测试组',
                        useDate: new Date('2018/12/12').toJSON(),
                        useQty: 100,
                        project: '测试组',
                        invLoc: ' h234',
                        remark: 'remark'
                    }

```

## MQ
Consumers receive messages from a particular queue in one of two ways:
* By subscribing to it via the basic.consume AMQP command. This will place the channel being used into a receive mode until unsubscribed from the queue.
* Requesting a single message from the queue is done by using the basic.get AMQP command. This will cause the consumer to receive the next message in the queue and then not receive further messages until the next basic.get. You shouldn't use basic.get in a loop as an alternative to
basic.consume, because it's much more intensive on Rabbit.

When a Rabbit queue has multiple consumers, messages received by the queue are served in a round-robin fashion to the consumers.

Every message that's received by a consumer is required to be acknowledged. Either the consumer must explicitly send an acknowledgement to RabbitMQ using the basic.ack AMQP command,
or it can set the auto_ack parameter to true when it subscribes to the queue.

If a consumer receives a message and then disconnects from Rabbit (or unsubscribes
from the queue) before acknowledging, RabbitMQ will consider the message
undelivered and redeliver it to the next subscribed consumer.

Both consumers and producers can create queues by using the queue.declare
AMQP command. But consumers can't declare a queue while subscribed to another
one on the same channel.

Here are some other useful properties you can set for the queue:
* exclusive—When set to true, your queue becomes private and can only be
consumed by your app. This is useful when you need to limit a queue to only
one consumer.
* auto-delete—The queue is automatically deleted when the last consumer
unsubscribes. If you need a temporary queue used only by one consumer, combine
auto-delete with exclusive. When the consumer disconnects, the queue
will be removed.

With passive set to true, queue.declare will return successfully if the queue exists, and return an error without
creating the queue if it doesn't exist.

A queue is said to be bound to an exchange by a routing key.

There are four kinds of exchanger:
* direct - if the routing key matches, then the message is delivered to the corresponding queue.
  * 利用缺省Exchange, 通过: `$channel->basic_publish($msg, '', 'queue-name');`可以向特定的队列发送消息
  * 可以实现将向多个队列发送消息
* fanout - when you send a message to a fanout
exchange, it'll be delivered to all the queues attached to this exchange.
* topic - 可以实现将多种消息发送给多个队列
* headers