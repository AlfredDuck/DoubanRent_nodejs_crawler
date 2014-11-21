var mongoose = require('mongoose');
//线上数据库
mongoose.connect('mongodb://housemap:6174@emma.mongohq.com:10051/alfredmongodb');
//mongolab测试环境
//mongoose.connect('mongodb://housemap:eric61746174@ds053728.mongolab.com:53728/housemap');
//mongolab正式环境
//mongoose.connect('mongodb://alfred:6174@ds053438.mongolab.com:53438/alfredmongodb');
//bae测试环境
//mongoose.connect('mongodb://mAOBrcoqTQDa9ofu8prCPyth:KSB11XfBG5EwCMQZF9mMOY4oVXSof009@mongo.duapp.com:8908/YiODtkLKexNKaHrWgwMY'); //指定数据库名为sofar_mongo
//本地数据库
//mongoose.connect('mongodb://localhost/search_engine_douban_group');
exports.mongoose = mongoose;
