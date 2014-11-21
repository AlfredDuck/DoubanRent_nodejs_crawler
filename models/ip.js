var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var ipSchema = new Schema({
calltime: Array,             //记录单独ip每次访问的时间
ip: String                   //ip地址
});

module.exports = mongodb.mongoose.model("ip", ipSchema);
