//临时关键词库
//当遇到用户输入的关键词没有 关键词库 的匹配时，此关键词会先放到临时关键词库，等到第二次有人再次使用这个关键词时，就将这个关键词转入 正式关键词库。

var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var temp_keywordsSchema = new Schema({
repeat: Number,               //记录此关键词被使用的次数
keyword: String,              //关键词
city: String                  //关键词所在的城市
});

module.exports = mongodb.mongoose.model("temp_keywords", temp_keywordsSchema);

