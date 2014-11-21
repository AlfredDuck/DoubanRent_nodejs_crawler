var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var urlSchema = new Schema({
crawler_time: Date,             //爬取时间
length: Number,                 //帖子数量
url: Array,                     //帖子的url数组
city: String
});

module.exports = mongodb.mongoose.model("url", urlSchema);
