var addURLs             = require('./../models/url.js');
var addContent          = require('./../models/content.js');
var addKeywords         = require('./../models/keywords.js');
var addTempKeywords     = require('./../models/temp_keywords.js');

//main();   //用于手动控制
//tempContent();
//keywords_database(allKeys());
//show_keywords();
//price();
//clear();
//room();

exports.main = function(){   //用于流水生产
  main();
};

function main(){
   addContent.find(null, null,{sort:[['uptime', -1]]}, function(err, docs){
      //console.log(docs.length);
      //console.log(docs);
      var contentUsed = 0;
      var keyMash = 0;
      for (var i=0; i<=docs.length-1; i++){

         if ( 
              (stringToDate(docs[i].uptime) >= stringToDate('2014-05-10 00:00:00')) &&
              (stringToDate(docs[i].uptime) <= stringToDate('2014-05-11 00:00:00'))
            ){
            console.log('\n★★★' + docs[i].title + '★★★');
            console.log('【关键词】： ' + docs[i].keys);
            console.log('【发帖时间】： ' + docs[i].date);
            console.log('【帖子正文】： ' + docs[i].text);
            console.log('【帖子链接】： ' + docs[i].url + '\n');
            contentUsed ++;
         }
      }
      console.log('USE: ' + contentUsed);     //有用的帖子数
      console.log('ALL: ' + docs.length);     //所有的帖子数
      
   });
}

//字符串转日期
function stringToDate(string){
   var str = string;
   str = str.replace(/-/g,"/");
   var date = new Date(str);
   return date;
}


//查看临时content数据
function tempContent(){
   addContent.find(
      {date: {"$gte": '2014-05-20', "$lte":'2014-05-22'}}, 
      null,
      {sort:[['uptime', -1]]}, 
      function(err, docs){
         console.log(docs.length);
         for (var i=0; i<=12; i++){
            console.log(docs[i]);
            //console.log(docs[i].price);
            //console.log(docs[i].title);
            //console.log(docs[i].text);
         }
     
      //console.log(docs[12]);
   });
}


//用于把现有的关键词录入 关键词数据库
function keywords_database(keys){
   console.log('【本次录入关键词个数】： ' + keys);
   
   addKeywords.find(function(err, docs){
      console.log('【现有关键词个数】： ' + docs.length);
      var hash = {};
      for (var i=0; i<=docs.length-1; i++) {
         var hh = typeof(docs[i].keyword) + docs[i].keyword;   //加typeof是为了区分0和'0'
         hash[hh] = 21;  //随便选了一个数字
      }
      //console.log(hash);
      
      for (var j=0; j<=keys.length-1; j++) {
         var kw = keys[j];
         var rekey = new Array();
         rekey[0] = kw;
         var ks = typeof(kw) + kw;
         if (hash[ks] != 21) {      //即，与要录入的词不重复
            var newKeyword = new addKeywords({
               relative_keywords: rekey,       //相关关键词，任何相关关键词都包含自身
               keyword: kw,
               city: '广州'
            });
            newKeyword.save(function(err, doc2, num){
               console.log('【新录入关键词】： ' + doc2.keyword);
            });  
         }
      }
   });
}

function allKeys(){
   var Keys = [
    '广佛线',
  '1号线',
  '2号线',
  '3号线',
  '3号线机场线',
  '4号线',
  '5号线',
  '8号线',
  'APM线',
  '南沙' 
   ];
   
   return Keys;
}

show_keywords();
function show_keywords(){
   addKeywords.find({keyword: '中关村'}, function(err, docs){
      console.log(docs);
   });
}


function clear(){
   var kk = '地铁';
   /*
   addKeywords.remove(function(err, num){
      console.log('removed keyword: ' + num);
   });
   addTempKeywords.remove(function(err, num){
      console.log('removed tempkeyword: ' + num);
   });
   */
   
   addContent.remove(function(err, num){
      console.log('removed testcontent: ' + num);
   });
   
}


//content测试数据库，尝试添加‘价格关键词’
function price(){
   var pricekeys = [ '500','600','700','800','900','1000','1100','1200','1300','1400','1500',
   '1600','1700','1800','1900','2000','2100','2200','2300','2400','2500',
   '2600','2700','2800','2900','3000','3100','3200','3300','3400',
   '3500','3600','3700','3800','3900','4000','4100','4200','4300','4400','4500','4600','4700',
   '4800','4900','5000','5100','5200','5300','5400','5500','5600','5700','5800','5900','6000'
   ];
   
   addContent.find(null, null,{sort:[['uptime', -1]]}, function(err, docs){
   
      for (var i=0; i<=docs.length-1; i++) {
         console.log('正式数据库长度： ' + docs.length);
         var keys = [];
         for (var t=0; t<=pricekeys.length-1; t++) {
            var titleStation = docs[i].title.indexOf(pricekeys[t]); 
            var textStation  = docs[i].text.indexOf(pricekeys[t]);
            //如果匹配到，则返回关键词在字符串中的位置，没匹配到则返回-1
            if ( (titleStation >= 0) || (titleStation < 0 && textStation >= 0) ){
               keys.push(pricekeys[t]);
               if ( (keys.length>1) && (keys[0]<1000) ){
                  keys.shift();    //如果数组多于1个且第一个小于1000，则删除第一个元（500和1500的问题）
               }
            }
         }
         addContent.update(
            {title: docs[i].title},
            {price: keys},
            function(err, num){
               console.log('title价格的个数： '+ num);
         });
         //console.log(keys);
      }
   });
}


//content&keyword测试数据库，尝试添加结构化关键词
function room(){
  console.log('wait for the database');
  var roomSize = ['主卧','次卧','整租','单间','床位'];
  var rentWay = ['求租','合租'];
  var roomNum = roomnum();
  
  addContent.find(
    {date: {"$gte": '2014-05-20', "$lte":'2014-05-22'}}, 
    null,
    {sort:[['uptime', -1]]}, 
    function(err, docs){
    
    for (var i=0; i<=docs.length-1; i++){
       console.log('数据库长度：' + docs.length);
       var size = [];
       var way = [];
       var num = [];
       
       //提取roomSize
       for (var t=0; t<=roomSize.length-1; t++) {
          var titleStation = docs[i].title.indexOf(roomSize[t]); 
          var textStation  = docs[i].text.indexOf(roomSize[t]);
          //如果匹配到，则返回关键词在字符串中的位置，没匹配到则返回-1
          if ( (titleStation >= 0) || (titleStation < 0 && textStation >= 0) ){
             size.push(roomSize[t]);
          }
       }
       //提取rentWay
       for (var t=0; t<=rentWay.length-1; t++) {
          var titleStation = docs[i].title.indexOf(rentWay[t]); 
          var textStation  = docs[i].text.indexOf(rentWay[t]);
          //如果匹配到，则返回关键词在字符串中的位置，没匹配到则返回-1
          if ( (titleStation >= 0) || (titleStation < 0 && textStation >= 0) ){
             way.push(rentWay[t]);
          }
       }
       //提取roomNum
       for (var t=0; t<=roomNum.length-1; t++) {
          for (var j=0; j<=roomNum[t].length-1; j++) {
             var titleStation = docs[i].title.indexOf(roomNum[t][j]); 
             var textStation  = docs[i].text.indexOf(roomNum[t][j]);
             //如果匹配到，则返回关键词在字符串中的位置，没匹配到则返回-1
             if ( (titleStation >= 0) || (titleStation < 0 && textStation >= 0) ){
                num.push(roomNum[t][j]);
             }
          }
       }
       
       addContent.update(
          {title: docs[i].title},
          {room_size: size,
           rent_way: way,
           room_num: num},
          function(err, num){
             console.log('更新的个数： '+ num);
       });
      
    }
  }); 
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

//keybeijing();
//给现有的北京的关键词添加 “city”
function keybeijing(){
   /*
   addContent
   addTempKeywords
   */
   addContent.update(
   null,
   {city: '北京'},
   {safe: true,multi: true},   //更新所有符合条件的
   function(err, num){
      console.log('update tempkeywords: ' + num);
   });
}










