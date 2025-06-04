const db = require('_helpers/db');
const Order = db.Order;

module.exports = {
    getAll,
    getByRecipient,
    getByOrderCode,
    getByCreate,
    create,
    update,
    getCount,
    delete: _delete,
    getById,
    createBatch
};

async function getAll(queryParams) {
    return await Order.find(queryParams).sort({ registrationDate: -1, orderCode: 1 });
}

async function getCount(queryParams) {
    return await Order.find(queryParams).count();
}

async function getByOrderCode(orderCode) {
    return await Order.findOne({orderCode});
}

async function getById(id) {
    return await Order.findById(id);
}

async function getByRecipient(recipient) {
    return await Order.find({recipient});
}

async function getByCreate(creator) {
    return await Order.find({creator});
}

async function create(orderParam) {
    const order = new Order(orderParam);
    await order.save();
}

async function update(id, orderParam) {
    const order = await Order.findById(id);
    Object.assign(order, orderParam);
    await order.save();
}

async function _delete(id) {
    await Order.findByIdAndRemove(id);
}

async function createBatch(orderParam) {
    await Order.insertMany(orderParam);
}