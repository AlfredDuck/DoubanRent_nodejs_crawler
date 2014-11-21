var mongodb_local = require('./mongodb_local');
var Schema = mongodb_local.mongoose.Schema;
var tiezi_url_Schema = new Schema({
   date: String,             //获得此地址时的日期
   url: String                   //url地址
});

module.exports = mongodb_local.mongoose.model("tiezi_url", tiezi_url_Schema);
