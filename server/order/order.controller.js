const express = require('express');
const router = express.Router();
const orderService = require('./order.service');
const userService = require('../user/user.service');
const moment = require('moment');

router.post('/create', create);
router.get('/list', getAll);
router.put('/:id', update);
router.get('/:id', getByOrderCode);

// 生成最新订单号
router.get('/getNewOrderCode', getNewOrderCode);
// 删除
router.delete('/:id', _delete);
// 跟进、完成
router.post('/updateStatus/:id', updateStatus);
// 转让
router.post('/updateRecipient/:id', updateRecipient);

module.exports = router;

async function genNewOrderCode(params) {
    return await orderService.getCount().then(count => {
        const customId = moment().format('YYYY-MM-DD') + '-' + count.toString().padStart(5, '0');
        const orderCode = 'DJ-' + customId;
        return orderCode;
    })
}


async function create(req, res, next) {
    if(!req.body.orderCode) {
        req.body.orderCode = await genNewOrderCode();
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
        queryParams.createdDate = Object.assign(queryParams.createdDate || {}, {
            $gte: req.query.startDate || null,
        });
        delete queryParams.startDate;
    } 
    if(req.query.endDate){
        queryParams.createdDate = Object.assign(queryParams.createdDate || {}, {
            $gte: req.query.endDate || null,
        });
        delete queryParams.endDate;
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
            $gte: req.query.completeEndDate || null,
        });
        delete queryParams.completeEndDate;
    }

    orderService.getAll(queryParams)
        .then(orders => {
            res.success(orders)
        })
        .catch(err => next(err));
}

function getByOrderCode(req, res, next) {
    orderService.getByOrderCode(req.params.id)
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
    const { status, completeDate} = req.body;
    const params = {
        status
    };
    if(status === 'DOING') {
        params.recipient = user.username;
    }

    if(status === 'DONE') {
        params.completeDate = completeDate || Date.now;
    }
    orderService.update(req.params.id, params).then(() => res.success())
    .catch(err => next(err));
}

// 转让
async function updateRecipient(req, res, next) {
    const { recipient} = req.body;
    const order = await orderService.getByOrderCode(req.params.id)
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