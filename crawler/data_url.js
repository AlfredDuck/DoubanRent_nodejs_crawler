var addURLs          = require('./../models/url.js');
var addContent       = require('./../models/content.js');
var crawler_content2  = require('./crawler_content2.js');

function getURLs(){
  addURLs.find(function(err, docs){
     console.log(docs.length);
     console.log(docs);
  });
}
//getURLs();

exports.getURLs = function(URLs){
	//展现将要访问的帖子地址
   console.log(URLs);
   crawler_content2.main(URLs);   //进入第3步骤，抓取帖子
  /*
  console.log('cut');
  addURLs.find(function(err, docs){
    console.log('url组： ' + docs.length);
    console.log('url数组： ' + docs);
    crawler_content2.main();   //进入第3步骤    
  });
  */
};








