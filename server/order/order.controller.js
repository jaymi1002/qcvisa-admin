const express = require('express');
const router = express.Router();
const orderService = require('./order.service');
const userService = require('../user/user.service');
const moment = require('moment');
const multer = require('multer');
const db = require('_helpers/db');
const XLSX = require('xlsx');
const Order = db.Order;
const upload = multer({ dest: './uploads/'});

const getStatusText = (status) => {
    switch(status){
        case 'TODO':
            return '待处理';
        case 'DOING':
            return '处理中';
        case 'DONE':
        default:
            return '已完成';
    }
}

router.post('/create', create);
router.get('/list', getAll);
router.get('/export', exportXlsx);
router.post('/import', upload.single('excel'),importXlsx);
// 生成最新订单号
router.get('/getNewOrderCode', getNewOrderCode);
router.put('/:id', update);
router.get('/:id', getById);
// 删除
router.delete('/:id', _delete);
// 跟进、完成
router.post('/updateStatus/:id', updateStatus);
// 转让
router.post('/updateRecipient/:id', updateRecipient);

router.get('/rank/money', getRankMoney);

router.get('/rank/count', getRankCount);



module.exports = router;

async function genNewOrderCode(params) {
    return await orderService.getCount().then(count => {
        const customId = moment().format('YYYY-MM-DD') + '-' + count.toString().padStart(5, '0');
        const orderCode = 'DJ-' + customId;
        return orderCode;
    })
}


async function create(req, res, next) {
    const newCode = await genNewOrderCode();
    if(!req.body.orderCode || req.body.orderCode !== newCode) {
        req.body.orderCode = newCode;
    }

    orderService.create(req.body)
        .then(() => res.success())
        .catch(err => next(err));
}

function getAll(req, res, next) {
    const queryParams = {
        ...req.query
    }

    // 创建时间筛选
    if(req.query.startDate){
        queryParams.registrationDate = Object.assign(queryParams.registrationDate || {}, {
            $gte: parseInt(req.query.startDate) || null,
        });
        delete queryParams.startDate;
    } 
    if(req.query.endDate){
        queryParams.registrationDate = Object.assign(queryParams.registrationDate || {}, {
            $lte: parseInt(req.query.endDate) || null,
        });
        delete queryParams.endDate;
    } 

    // 认领时间筛选
    if(req.query.recipientStartDate){
        queryParams.recipientDate = Object.assign(queryParams.recipientDate || {}, {
            $gte: req.query.recipientStartDate || null,
        });
        delete queryParams.recipientStartDate;
    } 

    if(req.query.recipientEndDate){
        queryParams.recipientDate = Object.assign(queryParams.recipientDate || {}, {
            $lte: req.query.recipientEndDate || null,
        });
        delete queryParams.recipientEndDate;
    }

    // 完成时间筛选
    if(req.query.completeStartDate){
        queryParams.completeDate = Object.assign(queryParams.completeDate || {}, {
            $gte: req.query.completeStartDate || null,
        });
        delete queryParams.completeStartDate;
    } 

    if(req.query.completeEndDate){
        queryParams.completeDate = Object.assign(queryParams.completeDate || {}, {
            $lte: req.query.completeEndDate || null,
        });
        delete queryParams.completeEndDate;
    }

    if(req.query.keyword){
        queryParams.$or = [{
            title: { $regex: eval(`/${req.query.keyword}/g`)}
        }, {
            customer:  { $regex: eval(`/${req.query.keyword}/g`)}
        }, {
            orderCode: { $regex: eval(`/${req.query.keyword}/g`)}
        }]
        delete queryParams.keyword;
    }
    orderService.getAll(queryParams)
        .then(orders => {
            res.success(orders)
        })
        .catch(err => next(err));
}

function getById(req, res, next) {
    orderService.getById(req.params.id)
        .then(order => order ? res.success(order) : res.fail(200, '订单不存在'))
        .catch(err => next(err));
}

function getNewOrderCode(req, res, next) {
    genNewOrderCode().then(orderCode => {
        res.success(orderCode)
    })
    .catch(err => next(err));
}

function update(req, res, next) {
    orderService.update(req.params.id, req.body)
        .then(() => res.success())
        .catch(err => next(err));
}

function _delete(req, res, next) {
    orderService.delete(req.params.id)
        .then(() => res.success())
        .catch(err => next(err));
}

// 跟进、完成
async function updateStatus(req, res, next) {
    const user = await userService.getById(req.user.sub);
    const { status, completeDate, recipientDate} = req.body;
    const params = {
        status
    };
    if(status === 'DOING') {
        params.recipient = user.username;
        params.recipientDate = recipientDate || Date.now();
    }

    if(status === 'DONE') {
        params.completeDate = completeDate || Date.now();
    }
    orderService.update(req.params.id, params).then(() => res.success())
    .catch(err => next(err));
}

// 转让
async function updateRecipient(req, res, next) {
    const { recipient} = req.body;
    const order = await orderService.getById(req.params.id)
    const params = {
        recipient
    };

    if(order.status !== 'DOING') {
        res.fail(200, '非进行中的订单不能转让');
        return;
    }

    params.recipient = user.username;
    orderService.update(req.params.id, params).then(() => res.success())
    .catch(err => next(err));
}


async function getRankMoney(req, res, next){
    const queryParams = {
        ...req.query
    }
    // 创建时间筛选
    if(req.query.date){
        const startDate = +req.query.date;
        queryParams.registrationDate = Object.assign(queryParams.registrationDate || {}, {
            $gte: new Date(startDate),
        });
        const endDate = moment(+startDate).add(1,'M').valueOf();
        queryParams.registrationDate = Object.assign(queryParams.registrationDate || {}, {
            $lte: new Date(endDate),
        });
        delete queryParams.date;
    } 
    Order.aggregate([
        {
            $project : {
                _id : 0 ,
                creator : 1 ,
                orderMoney: 1,
                receivedMoney: 1,
                registrationDate: 1
            }
        },
        {
            $match : {
                ...queryParams,
            }
        },
        { $group: { _id: '$creator', orderMoney: {$sum: '$orderMoney'}, receivedMoney: { $sum: '$receivedMoney' } }},
        { $sort:  { receivedMoney: 1 }}
    ]).then(rankList => {
        res.success(rankList)
    })
}



async function getCompletedCount(date) {
    const queryParams = {}
    // 创建时间筛选
    if(date){
        const startDate = +date;
        queryParams.completeDate = Object.assign(queryParams.completeDate || {}, {
            $gte: new Date(startDate),
        });
        const endDate = moment(+startDate).add(1,'M').valueOf();
        queryParams.completeDate = Object.assign(queryParams.completeDate || {}, {
            $lte: new Date(endDate),
        });
    } 
    return Order.aggregate([
        {
            $project : {
                _id : 0 ,
                status: 1,
                recipient: 1,
                completeDate: 1,
            }
        },
        {
            $match : {
                ...queryParams,
                status: 'DONE'
            }
        },
        { $group: { _id: '$recipient', completedCount: { $sum: 1} }},
        // { $sort:  { completedCount: 1 }}
    ]).then(rankList => {
        return rankList;
        
    })
}

async function getRecipientCount(date) {
    const queryParams = {}
    // 创建时间筛选
    if(date){
        const startDate = +date;
        queryParams.recipientDate = Object.assign(queryParams.recipientDate || {}, {
            $gte: new Date(startDate),
        });
        const endDate = moment(+startDate).add(1,'M').valueOf();
        queryParams.recipientDate = Object.assign(queryParams.recipientDate || {}, {
            $lte: new Date(endDate),
        });
    } 
    return Order.aggregate([
        {
            $project : {
                _id : 0 ,
                status: 1,
                recipient: 1,
                recipientDate: 1,
            }
        },
        {
            $match : {
                ...queryParams,
                status: 'DONE'
            }
        },
        { $group: { _id: '$recipient', recipientCount: { $sum: 1} }},
        { $sort:  { recipientCount: 1 }}
    ]).then(rankList => {
        return rankList;
        
    })
}

async function getRankCount(req, res, next){
    const completeList = await getCompletedCount(req.query.date);
    const recipientList = await getRecipientCount(req.query.date);
    const completedCountMaps = completeList.reduce((all, item)=> {   
        if(!all[item._id]){
            all[item._id] = {};
        }
        all[item._id].completedCount = item.completedCount;
        return all;
    },{});
    const allMaps = recipientList.reduce((all, item)=> {   
        if(!all[item._id]){
            all[item._id] = {};
        }
        all[item._id].recipientCount = item.recipientCount;
        return all;
    }, completedCountMaps);
    const result = Object.keys(allMaps).map(_id => {
        const { completedCount, recipientCount} = allMaps[_id];
        return {
            _id, 
            completedCount,
            recipientCount
        }
    }).sort((a, b) => a.recipientCount - b.recipientCount);
    res.success(result)
}

async function exportXlsx(req, res, next) {
    const queryParams = {
        ...req.query
    }

    // 创建时间筛选
    if(req.query.startDate){
        queryParams.registrationDate = Object.assign(queryParams.registrationDate || {}, {
            $gte: parseInt(req.query.startDate) || null,
        });
        delete queryParams.startDate;
    } 
    if(req.query.endDate){
        queryParams.registrationDate = Object.assign(queryParams.registrationDate || {}, {
            $lte: parseInt(req.query.endDate) || null,
        });
        delete queryParams.endDate;
    } 

    // 认领时间筛选
    if(req.query.recipientStartDate){
        queryParams.recipientDate = Object.assign(queryParams.recipientDate || {}, {
            $gte: req.query.recipientStartDate || null,
        });
        delete queryParams.recipientStartDate;
    } 

    if(req.query.recipientEndDate){
        queryParams.recipientDate = Object.assign(queryParams.recipientDate || {}, {
            $lte: req.query.recipientEndDate || null,
        });
        delete queryParams.recipientEndDate;
    }

    // 完成时间筛选
    if(req.query.completeStartDate){
        queryParams.completeDate = Object.assign(queryParams.completeDate || {}, {
            $gte: req.query.completeStartDate || null,
        });
        delete queryParams.completeStartDate;
    } 

    if(req.query.completeEndDate){
        queryParams.completeDate = Object.assign(queryParams.completeDate || {}, {
            $lte: req.query.completeEndDate || null,
        });
        delete queryParams.completeEndDate;
    }

    if(req.query.keyword){
        queryParams.$or = [{
            title: { $regex: eval(`/${req.query.keyword}/g`)}
        }, {
            customer:  { $regex: eval(`/${req.query.keyword}/g`)}
        }, {
            orderCode: { $regex: eval(`/${req.query.keyword}/g`)}
        }]
        delete queryParams.keyword;
    }

    const orders = await orderService.getAll(queryParams);
    const labelMaps = {
        orderCode: '订单编号',
        title: '标题',
        registrationDate: '登记日期',
        customer: '客户名称',
        country: '办理国家',
        type: '办理类型',
        orderMoney: '签单金额',
        receivedMoney: '到账金额',
        creator: '咨询老师',
        status: '办理状态',
        recipient: '认领人',
        operateMoney: '操作费',
        registrationMonth: '登记月份',
        comment: '备注',
    }
    const list = Object.keys(labelMaps);

    const ws_data =[];
    ws_data.push(list.map(item => labelMaps[item]));
    orders.forEach(order => {
        ws_data.push(list.map(item => {
            if(item === 'registrationMonth') {
                return moment(order.registrationDate).format('YYYY-MM')
            }
            if(item === 'status') {
                return getStatusText(order[item]);
            }
            return order[item];
        }));
    });
    const ws = XLSX.utils.aoa_to_sheet(ws_data); 
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '订单');
    // 将工作簿写入一个buffer（二进制格式）
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
     // 设置响应头为Excel文件类型
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader("Content-Disposition", "attachment; filename=example.xlsx");
    res.end(excelBuffer)
}

async function importXlsx(req, res, next) {
    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        const labelMaps = {
            '[标题]': 'title',
            '标题': 'title',
            '订单编号':'orderCode',
            '登记日期': 'registrationDate',
            '客户名称': 'customer',
            '办理国家': 'country',
            '办理类型': 'type',
            '签单金额': 'orderMoney',
            '到账金额': 'receivedMoney',
            '咨询老师': 'creator',
            '办理状态': 'status',
            '文案老师': 'recipient',
            '操作费': 'operateMoney',
            '备注': 'comment',
        }
        const orderList = jsonData.map(item => {
            const order = {};
            Object.keys(item).forEach(key => {
                if(key === '办理状态') {
                    const status = item[key] === '未办理' ? 'TODO' : 
                    (item[key] === '正在办理' ? 'DOING' : 'DONE');
                    order[labelMaps[key]] = status;
                }else {
                    labelMaps[key] && (order[labelMaps[key]] = item[key]);
                }
            });
            return order;
        })
        await orderService.createBatch(orderList);
        // 此处可添加数据库存储逻辑
        res.success(orderList)
      } catch (err) {
        console.log(err);
        next(err)
      }
}