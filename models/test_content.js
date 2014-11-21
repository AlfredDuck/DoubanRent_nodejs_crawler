/*
----------临时用来测试的,作为content.js的替代--------------
*/

var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var temp_contentSchema = new Schema({
city: String,              //发帖所在的城市
title: String,             //帖子标题
uptime: String,            //发帖时间
text: String,              //帖子正文
url: String,               //帖子地址
keys: Array,               //关键词数组
price: Array,              //价格关键词数组
room_num: Array,           //房间数量数组（一居）
room_size: Array,          //房间大小（主卧，整租，次卧）
rent_way: Array,           //租赁方式（求租，合租）
date: String               //发帖日期（比如2014-09-08）
});

module.exports = mongodb.mongoose.model("temp_content", temp_contentSchema);
