//用于crawler_content.js的测试

var http = require('http');
var $ = require('cheerio');
//对validator模块的介绍 https://github.com/chriso/validator.js
var validator = require('validator');
var async = require('async');

var addURLs = require('./../models/url.js');
var addContent = require('./../models/content.js');    //temp_content.js用作测试代替content.js
var data_clear_url = require('./data_clear_url.js');
var crawler_url = require('./crawler_url.js');
var addKeywords = require('./../models/keywords.js');


exports.main = function(URLs){
  main(URLs);
};

//main();
function main(URLs){    //启动器
  //debug断点
  console.log('等待获得urls of ' + URLs.city);
  if (URLs) {
      var i = 0;
      var timer = setInterval(function(){
         console.log('--帖子--' + i);
         //如果要访问的帖子url为空，则直接进入第4步骤
         if (URLs.url.length == 0){
            data_clear_url.clearURLs();
         }else{
            getContent(URLs.url[i], URLs.city);
         }

         i++;
         if (i>URLs.url.length-1){
            clearInterval(timer);
            data_clear_url.clearURLs();   //循环完成时，进入第4步骤
         }
      }, randomTime());
  }
  else {
      console.log('没有找到url');
      crawler_url.main();
  }
}

function randomTime(){   //生成2～3秒间的随机秒数,每次调用使用不同随机间隔
  var xx = Math.random();
  xx = Math.floor(xx*3000) + 3000;
  console.log('wait: ' + xx + 'ms');
  return xx;
}

function getContent(url, city){  //获取帖子内容
   var re = /.com/gi;
   var the_path = url.split(re)[1];
   console.log(the_path);
   
   var options={
        host:'www.douban.com',  
        path:the_path,
        //method:'get',
        headers:{
            'Content-Type':'application/x-www-form-urlencoded',  
            //'User-Agent':'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:18.0) Gecko/20100101 Firefox/18.0',
            'User-Agent':'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0',
            //'Referer':'http://www.douban.com/group/dbapi/',
            'Host':'www.douban.com',
            'Connection':'keep-alive',
            'Cache-Control':'max-age=0',
            //'Accept-Language':'zh-cn,zh;q=0.8,en-us;q=0.5,en;q=0.3',
            //'Accept-Encoding':'gzip, deflate',
            //'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
   };
   http.get(options, function(res) {
     var size = 0;
     var chunks = [];
     res.on('data', function(chunk){
         size += chunk.length;
         chunks.push(chunk);
         //debug断点
         //console.log('等待网页返回' + options.path);
     });
     res.on('end', function(){
        //拼接buffer
        var data = Buffer.concat(chunks, size);
        var stringData = data.toString();
        //debug断点
        console.log('website return successfully');
        
        //获取title/uptime/date/text/url
        var title = $('h1', stringData).text();
        title = validator.trim(title);
        var uptime = $('.color-green', stringData).text();
        
        var re = / /gi;
        var date = uptime.split(re)[0];
        
        var text = $('.topic-content', stringData).children('p').text();
        
        //生成初步json
        var newContent = new addContent({
           city: city,               //帖子所在城市  
           title: title,             //帖子标题
           uptime: uptime,           //发帖时间
           text: text,               //帖子正文
           url: url,                 //帖子地址
           date: date                //发帖日期（比如2014-09-08）
        });
        
        //重构
        async.auto({
           //step1说明,过滤
           step1: function(callback, result){
              filter(newContent, callback, result);     //callback要传入
           },
           //step2说明,从标题中获取地点
           step2:['step1', function(callback, result){
              console.log('【打印step1结果】');
              //当需要依赖其他步骤时，需要传入result
              getKeyword(result.step1, callback, result);
           }],
           //step3说明，从标题or正文中获得价格
           step3:['step2', function(callback, result){
              getPrice(result.step2, callback, result);
           }],
           //step4说明，从标题or正文中获得格式化数据
           step4:['step3', function(callback, result){
              getRoomInfor(result.step3, callback, result);
           }],
           //step5说明，储存新的content到数据库
           step5:['step4', function(callback, result){
              saveContent(result.step4, callback, result);
           }]
        }, function(err, result){
           console.log('async.auto get err');
        });
        
        
     });
   }).on('error', function(e) {
      console.log("Got error: " + e.message);
   });
}

//step1 过滤
function filter(newContent, callback, result){
   var today = todayDate();     //获取今天的日期
   //console.log('【今天日期】： ' + today);
   //console.log('【发帖日期】： ' + newContent.date);
   if (newContent.date == today){      //判断发帖时间是否是今天，暂时放开爬取所有日期，扩充数据
      addContent.findOne({url: newContent.url}, function(err, doc){ //判断是否跟今天的帖子重复
         if (err){ console.log('err: ' + err); };
         if (doc){
            console.log('有重复帖子');
         }
         else{
            //判断是否两个小组同时发帖子（title重复）
            addContent.findOne({title: newContent.title}, function(err, doc){
               if (err){ console.log('err: ' + err); };
               if (doc){
                  console.log('有两个小组同时发帖子');
               } else {
                  //过关斩将后，将newContent发送给下一步
                  return callback(null, newContent);
               }
            });
         }
      });
   }
}

//step2 从标题中获取地点（or）其他关键词
function getKeyword(newContent, callback, result){
   addKeywords.find({city: newContent.city}, function(err, docs){    //过滤所在城市的关键词
      var keys = [];
      if (docs){
         for (var i=0; i<=docs.length-1; i++) {
            var station = newContent.title.indexOf(docs[i].keyword); 
            //如果匹配到，则返回关键词在字符串中的位置，没匹配到则返回-1
            if (station >= 0) {
               keys.push(docs[i].keyword);
            }
         }
      }
      //callback(null, keys);
      newContent.keys = keys;
      console.log('【打印step2结果】');
      callback(null, newContent);
      
   });
}

//step3 从标题or正文中获得价格
function getPrice(newContent, callback, result){
   var pricekeys = [];
   for (var i=10; i<=140; i++){
      pricekeys.push(i*50);
   }
   
         var keys = [];
         for (var t=0; t<=pricekeys.length-1; t++) {
            var titleStation = newContent.title.indexOf(pricekeys[t]); 
            var textStation  = newContent.text.indexOf(pricekeys[t]);
            //如果匹配到，则返回关键词在字符串中的位置，没匹配到则返回-1
            if ( (
                 (titleStation >= 0) &&
                 (!/^[0-9]*$/g.test(newContent.title.charAt(titleStation-1))) &&
                 (!/^[0-9]*$/g.test(newContent.title.charAt(titleStation+4)))
                  //以上匹配数字前后都不是数字，防止是电话号码,bug是当价格在首或尾时也无法识别。
                 ) || 
                 (
                 (titleStation < 0 && textStation >= 0) &&
                 (!/^[0-9]*$/g.test(newContent.text.charAt(textStation-1))) &&
                 (!/^[0-9]*$/g.test(newContent.text.charAt(textStation+4)))
                 )
               ){
               keys.push(pricekeys[t]);
               if ( (keys.length>1) && (keys[0]<1000) ){
                  keys.shift();    //如果数组多于1个且第一个小于1000，则删除第一个元（500和1500的问题）
               }
            }
         }
         newContent.price = keys;
         console.log('【打印step3结果】');
         callback(null, newContent);
}

//step4说明，从标题or正文中获得格式化数据
function getRoomInfor(newContent, callback, result){
  var roomSize = ['主卧','次卧','整租','单间','床位'];
  var rentWay = ['求租','合租'];
  var roomNum = roomnum();
  

       var size = [];
       var way = [];
       var num = [];
       
       //提取roomSize
       for (var t=0; t<=roomSize.length-1; t++) {
          var titleStation = newContent.title.indexOf(roomSize[t]); 
          var textStation  = newContent.text.indexOf(roomSize[t]);
          //如果匹配到，则返回关键词在字符串中的位置，没匹配到则返回-1
          if ( (titleStation >= 0) || (titleStation < 0 && textStation >= 0) ){
             size.push(roomSize[t]);
          }
       }
       //提取rentWay
       for (var t=0; t<=rentWay.length-1; t++) {
          var titleStation = newContent.title.indexOf(rentWay[t]); 
          var textStation  = newContent.text.indexOf(rentWay[t]);
          //如果匹配到，则返回关键词在字符串中的位置，没匹配到则返回-1
          if ( (titleStation >= 0) || (titleStation < 0 && textStation >= 0) ){
             way.push(rentWay[t]);
          }
       }
       //提取roomNum
       for (var t=0; t<=roomNum.length-1; t++) {
          for (var j=0; j<=roomNum[t].length-1; j++) {
             var titleStation = newContent.title.indexOf(roomNum[t][j]); 
             var textStation  = newContent.text.indexOf(roomNum[t][j]);
             //如果匹配到，则返回关键词在字符串中的位置，没匹配到则返回-1
             if ( (titleStation >= 0) || (titleStation < 0 && textStation >= 0) ){
                num.push(roomNum[t][j]);
             }
          }
       }
       newContent.room_size = size;
       newContent.room_num = num;
       newContent.rent_way = way;
       console.log('【打印step4结果】');
       callback(null, newContent);
      
}

//step5说明，储存新的content到数据库
function saveContent(newContent, callback, result){
   console.log('【最终json】：');
   console.log('城市：' + newContent.city);
   console.log('标题：' + newContent.title);
   console.log('关键词：' + newContent.keys);
   console.log('【json end】');
   if (newContent.keys.length != 0) {
      newContent.save(function(err, doc, num){
         console.log('【最终saved】');
      });
   }
}


function roomnum(){
  var roomNum= [];
  roomNum[0] = ['一居','一室','1居','1室'];
  roomNum[1] = ['二居','两居','2居','二室','两室','2室'];
  roomNum[2] = ['三居','三室','3居','3室'];
  roomNum[3] = ['四居','四室','4居','4室'];
  roomNum[4] = ['五居','五室','5居','5室'];
  return roomNum;
}

//通用函数-获得今天日期
function todayDate(){    
   var today = new Date();
   var year = today.getFullYear();
   var month, date;
   
   if ((today.getMonth()+1) <= 9){
      month = '0' + (today.getMonth() + 1);  
   }else{
      month = today.getMonth() + 1;
   }
   if (today.getDate() <= 9){
      date = '0' + today.getDate();  
   }else{
      date = today.getDate();
   }
      
   today = year + '-' + month + '-' + date;
   return today;
}


/*
async.auto标准结构
        //重构
        async.auto({
           //step1说明
           step1: function(callback, result){
              callback(null, somethingAsResult);
           },
           //step2说明
           step2:['step1', function(callback, result){
              result.step1;
           }],
           //step3说明
           step3:['step2', function(callback, result){
           
           }]    
        }, function(err, result){
           console.log('async.auto get err');
        });
*/


