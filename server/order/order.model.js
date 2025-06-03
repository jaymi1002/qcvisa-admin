const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

const schema = new Schema({
    title: { type: String, required: true},
    // orderCode: { type: String, default() {
    //     var customId = moment().format('YYYY-MM-DD-HHmmss') + Math.floor(Math.random() * 10);
    //     return 'DJ-' + customId;
    // } },
    orderCode: { type: String, required: true, unique: true},
    creator: {type: String, required: true}, // 提交人 咨询老师
    recipient: {type: String, default: ''}, // 跟进人
    customer:  { type: String, required: true }, // 客户
    country: {type: String, required: true}, // 办理国家
    type: {type: String, required: true}, // 办理类型
    orderMoney: {type: Number}, // 签单金额
    receivedMoney: {type: Number}, // 到账金额
    status: {type: String, required: true, default: 'TODO'}, // TOOD: 待跟进、 DOING：正在更近、DONE：已完成
    completeDate: { type: Date, default: null }, // 完成时间
    registrationDate:  { type: Date, default: Date.now }, // 登记日期
    recipientDate:  { type: Date, default: null }, // 认领时间
    createdDate: { type: Date, default: Date.now }, // 创建时间戳
    comment: {type: String, default:''}, // 备注
    operateMoney: {type: String, default: 0} // 操作费
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model('Order', schema);