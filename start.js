/*
流水生产步骤：
0.start              每隔1小时执行一次流水作业
1.crawler_url        抓取并储存帖子URL
2.data_url           展示帖子URL
3.crawler_content    抓取并储存帖子内容
4.data_clear_url     删除帖子URL数据库（为下次抓取做准备）

*/

var addURLs          = require('./models/url.js');
var addContent       = require('./models/content.js');
var crawler_url      = require('./crawler/crawler_url.js');


main();


function main(){   //使用setInterval做计时器以及循环,每隔10分钟调用一次，超过当前小时则停止
   console.log('【开始爬取】');
   var gp_1 = showGroups();
   crawler_url.main(gp_1);

   var timer = setInterval(function(){
      console.log('【开始爬取】');
      var gp_2 = showGroups();
      crawler_url.main(gp_2);
      //clearInterval(timer);
   }, 1000*60*6);
}

//定义一个json，包含各地租房小组的url
function showGroups(){
   var groups = {};
   groups['北京'] = [
   '北京',
   '/group/beijingzufang/discussion?start=',  //北京租房
   '/group/zhufang/discussion?start=',        //北京无中介租房
   '/group/26926/discussion?start=',          //北京租房豆瓣
   '/group/sweethome/discussion?start='       //北京租房密探
   ];
   groups['上海'] = [
   '上海',
   '/group/shanghaizufang/discussion?start=',   //上海租房
   '/group/zufan/discussion?start=',            //上海租房@长宁租房/徐汇/静安租房
   '/group/homeatshanghai/discussion?start=',   //和我住在一起
   '/group/259227/discussion?start='            //上海租房（不良中介勿扰）
   ];
   groups['广州'] = [
   '广州',
   '/group/gz020/discussion?start=',    //广州租房（推荐指数★★★★★）
   '/group/90742/discussion?start=',    //广州租房
   '/group/banjia/discussion?start=',   //广州租房那些事
   '/group/gz020/discussion?start='     //广州租房（推荐指数★★★★★）故意重复的
   ];

   var ran = Math.random();
   if ( ran <= 0.6 ){
     return groups['北京'];
   }
   else if ( ran>0.6 && ran<=0.9 ){
     return groups['上海'];
   }
   else if ( ran>0.9 && ran<1.0 ){
     return groups['广州'];
   }
   else{
     return groups['北京'];
   }
}







