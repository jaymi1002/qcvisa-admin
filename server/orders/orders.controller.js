const express = require('express');
const router = express.Router();
const orderService = require('./orders.service');
const moment = require('moment');

router.post('/create', create);
router.get('/list', getAll);
router.get('/getNewOrderCode', getNewOrderCode);
router.put('/:id', update);
router.get('/:id', getByOrderCode);
router.delete('/:id', _delete);



module.exports = router;

// function authenticate(req, res, next) {
//     userService.authenticate(req.body)
//         .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
//         .catch(err => next(err));
// }

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

function receive(req, res, next) {

}