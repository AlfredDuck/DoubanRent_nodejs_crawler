//处理来自58同城的关键词
/*
var ke = '广佛线 1号线 2号线 3号线 3号线机场线 4号线 5号线 8号线 APM线 ';
   var re = / /gi;
   var word_arr = ke.split(re);

   for (var i=0; i<=word_arr.length-1; i++){
      if(word_arr[i] = ' '){
         word_arr.splice(i);
      }
   }

   console.log(word_arr);
   
   function f_check(obj)   
{          
   if (/^[A-Z]+$/.test(obj))    
   {   
      return true;   
   }    
   return false;   
}   
*/

var kk = new Date();
kk = kk.toLocaleDateString();
console.log(kk);

var add_local_url = require('./../models_local/tiezi_url.js');

add();
function add(){
var url = 'www.douban.com'
var localURL = new add_local_url({
   date: kk,
   url: url
});
localURL.save(function(err, doc, num){
   console.log('saved');
   console.log(doc);
});
}

find();
function find(){
add_local_url.find(function(err, data){
   console.log(data);
});
}