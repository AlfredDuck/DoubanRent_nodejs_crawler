var addip = require('./../models/ip.js');

show_ips();
function show_ips(){
   addip.find(function(err, docs){
   	  var sub = 0;
      for(var i=0; i<=docs.length-1; i++){
      	 var count = '';
         for (var j=0; j<=docs[i].calltime.length-1; j++){
            count = count + '|';
            sub = sub + 1;
         }
         console.log(count);
      }
      console.log(docs.length);
      console.log(sub);
      console.log('end');
   });
}

//console.log(math(45));
function math(count){
   if (count == 0 || count == 1){
   	return 1;
   } 
   else {
      return math(count - 1) + math(count-2);
   }
}