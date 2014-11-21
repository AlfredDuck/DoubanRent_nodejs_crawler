//关键词库
//（怎么获得相关关键词？哈，问用户啊，同一个ip搜索的多个词不就是相关的吗，试用于北大和北京大学这样的，也适用于地震局和苏州街这样的）

var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var keywordsSchema = new Schema({
relative_keywords: Array,       //相关关键词，任何相关关键词都包含自身
keyword: String,                //关键词
city: String                    //地理关键词所在的城市   
});

module.exports = mongodb.mongoose.model("keywords", keywordsSchema);
