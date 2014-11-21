var http          = require('http');
var $             = require('cheerio');  //cheerio用于解析DOM tree，类似于前端的jquery
var addURLs       = require('./../models/url.js');
var data_url      = require('./data_url.js');
var add_local_url = require('./../models_local/tiezi_url.js');

//var url_based = 'http://www.douban.com/group/beijingzufang/discussion?start=';
//var url = 'http://www.douban.com/group/topic/51224313/';
//var cookie = {};  //需要登录才用cookie
var maxNum = 2;   //全局变量，控制访问页数

exports.main = function(group){
  main(group);
};

function main(group){   //使用setInterval做计时器以及循环
   var URLs = [];
   var i = 0;
   var timer = setInterval(function(){
      getURLs(i, URLs, group);
      console.log('--page--' + i);
      i = i + 25;
      if (i>(maxNum-1)*25){
         clearInterval(timer);
      }
   }, randomTime());
}

function randomTime(){   //生成2～3秒间的随机秒数
  var xx = Math.random();
  xx = Math.floor(xx*3000) + 3000;
  console.log('wait: ' + xx + 'ms');
  return xx;
}


function getURLs(page, URLs, group){    //定义获取帖子URL的函数，输入 讨论区的页数 和 要加入的数组
   
   var s_1 = group[1];
   var s_2 = group[2];
   var s_3 = group[3];
   var s_4 = group[4];
   console.log('当前抓取的城市是：' + group[0]);
   
   var the_path;
   var ran = Math.random();
   if ( ran <= 0.5 ){
     the_path = s_1 + page;
   }
   else if ( ran>0.5 && ran<=0.7 ){
     the_path = s_2 + page;
   }
   else if ( ran>0.7 && ran<=0.85 ){
     the_path = s_3 + page;
   }
   else if ( ran>0.85 && ran<1.0 ){
     the_path = s_4 + page;
   }
   
   console.log('抓取地址： ' + the_path);
   var options={  
        host:'www.douban.com',
        path:the_path,
        //method:'get',     
        headers:{  
            'Content-Type':'application/x-www-form-urlencoded',  
            'User-Agent':'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:18.0) Gecko/20100101 Firefox/18.0',
            //'User-Agent':'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)',
            'Referer':'http://www.douban.com/group/search?cat=1019&q=%E5%8C%97%E4%BA%AC%E7%A7%9F%E6%88%BF',
            'Host':'www.douban.com',
            'Connection':'keep-alive',
            'Cache-Control':'max-age=0',
            //'Accept-Language':'zh-cn,zh;q=0.8,en-us;q=0.5,en;q=0.3',
            //'Accept-Encoding':'gzip, deflate',
        }
        

   }; 
   http.get(options, function(res) {
     var size = 0;
     var chunks = [];
     res.on('data', function(chunk){
         size += chunk.length;
         chunks.push(chunk);
         //debug断点
         console.log('等待网页返回' + options.path);
     });
     res.on('end', function(){
      
         var data = Buffer.concat(chunks, size);
         var stringData = data.toString();
         //debug断点
         if (stringData){
            console.log('断点1，抓取到网页' + options.path);
            //console.log(stringData);
         }
         else {
            console.log('断点1，丢失网页' + options.path);
         }
         
         //console.log(stringData);   //如果被屏蔽了，可以在这里看到
         
         var discussHTML = $('.olt', stringData).html();   //获取帖子列表（一页的）
         //var $html = cheerio.load(discussHTML);
         var tiezi_urls = $('.title', discussHTML).children();
      
         for (var i=0; i<=tiezi_urls.length-1; i++){
            var kk = tiezi_urls[i].attribs.href;    //获取帖子地址
            URLs.push(kk);
            console.log('url: ' + i);
            //console.log(kk);
         }
         
         //储存url数组到数据库
         if (URLs.length > 25*(maxNum-1)+12){   //防止多次重复写入,加12是为了防止有时候一页超过25个
            var uniqueURL = unique(URLs);            //数组去重
            //check if local data has the url
            localExist(uniqueURL, group[0]);
				
            /*
            var newURLs = new addURLs({
               crawler_time: new Date(),             //爬取时间
               length: URLs.length,                  //帖子数量
               url: uniqueURL,                       //帖子数组
               city: group[0]
            });
            //debug断点
            console.log('传递url到下一步');
            data_url.getURLs(newURLs);  //进入第2步骤
            /*
            newURLs.save(function(err, doc, num){
               if (err) {   
                  console.log("Got error: ");
               }
               console.log('save success: ' + num);
               data_url.getURLs();  //进入第2步骤
            });
            */
         }
     });
   }).on('error', function(e) {
     console.log("Got error: " + e.message);
   });
}


//数组去重
function unique(arr) {    
//数组去重函数 http://blog.csdn.net/dannywj1371/article/details/8573909  http://www.1008a.com/post/277.html
  var ret = [];
  var hash = {};

  for (var i = 0; i < arr.length; i++) {
    var item = arr[i];
    var key = typeof(item) + item;
    if (hash[key] !== 1) {
      ret.push(item);
      hash[key] = 1;
    }
  }
  return ret;
}

//检查是否本地数据库已经存在这个url，若没有，则访问这个url并保存，若有，则不操作
function localExist(urls, city){
	var to_visit = [];
	var hash = {};
   add_local_url.find(function(err, docs){
	  	//如果有本地urls，那就执行操作
	  if (err){
	  	 console.log('[err]:' + err);
	  }else{
	      if (docs.length != 0) {
	         console.log('local urls:');
	         console.log(docs.length);
	         //记录本地urls，并保存一个字典的key值中
	         for (var i = 0; i <= docs.length - 1; i++) {
	            var key = typeof(docs[i].url) + docs[i].url;
	            hash[key] = 1;
	         }
	         //刚获得的urls是否有对应的key，若没有，则这部分URL与本地不重复
	         for (var i = 0; i <= urls.length - 1; i++) {
	            var key_2 = typeof(urls[i]) + urls[i];
	            if (hash[key_2] != 1) {
	               //生成新的用于访问豆瓣的urls数组
	               to_visit.push(urls[i]);
	            }
	         }
	         console.log('not local urls:' + to_visit.length);
	         //将不是本地urls存入本地
	         add(to_visit);
	         //进入第二天则清空本地urls
	         clear_local(docs[0].date);
	         //将此数组封装到newURLs对象中，并传递到下一步
	         createURLs(to_visit, city);

	      } else {
	         console.log('本地暂无URLs记录');
	         //将不是本地urls存入本地
	         add(urls);
	         //将此数组封装到newURLs对象中，并传递到下一步
	         createURLs(urls, city);
	      }
      }
   });
}

//将此数组封装到newURLs对象中，并传递到下一步
function createURLs(to_visit, city){
   //将此数组封装到newURLs对象中
   var newURLs = new addURLs({
      crawler_time: new Date(), //爬取时间
      length: to_visit.length, //帖子数量
      url: to_visit, //帖子数组
      city: city
   });
   //debug断点
   console.log('传递url到下一步');
   data_url.getURLs(newURLs); //进入第2步骤，访问帖子
}

//将不是本地urls存入本地
function add(urls){
   console.log('add local mongo: ' + urls.length)
   for (var i=0; i<=urls.length; i++){
      var localURL = new add_local_url({
         date: new Date().toLocaleDateString(),
         url: urls[i]
      });
      localURL.save(function(err, doc, num) {
         console.log('--------saved--------');
         //console.log(doc);
      });
   }
   /*
   add_local_url.remove(function(err, num){
      console.log('removed: ' + num);
   });
*/
}

//进入第二天则清空本地urls
function clear_local(date){
   if (new Date().toLocaleDateString() != date) {
      console.log('已进入第二天');
      add_local_url.remove(function(err, num) {
         console.log('clear local data: ' + num);
      });
   }
}

/*
--豆瓣租房小组爬虫--
从北京租房小组开始 www.douban.com/group/beijingzufang/discussion?start=200
1.URL的解析规则很简单，第1页是start=0，即0-24条帖子，第2页是start=25，即25-49条帖子。
2.首先下载论坛前10（待定）页，根据前10页含的帖子链接，取得帖子地址。
3.遍历并下载帖子网页文件，解析出：标题/楼主/时间/正文（包括图片链接）等内容，并保存到数据库。
4.在数据库中去重，并按照发帖时间倒序排序，再次过滤掉7天（待定）以前的帖子。
5.输出可以复制粘贴的格式化文本。
--备注--
1.前10页和7天前都是为了保证帖子的时效性，如果有关闭帖子的字段，则可以直接删除此条帖子。
2.发布帖子到租房小组和运营日志zhaoyingzong@gmail.com:eric61746174
3.正常运营以后，考虑每天发布昨天一天的汇总，每周发布一次前一周的汇总。
*/


