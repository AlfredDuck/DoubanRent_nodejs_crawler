var addURLs      = require('./models/url.js');
var addContent   = require('./models/content.js');

function getContent(){
   addContent.find(null, null,{sort:[['uptime', -1]]}, function(err, docs){
      console.log(docs.length);
      //console.log(docs);
      var contentUsed = 0;
      var keyMash = 0;
      for (var i=0; i<=docs.length-1; i++){

         if (
              (stringToDate(docs[i].uptime) >= stringToDate('2014-05-04 12:00:00')) &&
              (stringToDate(docs[i].uptime) <= stringToDate('2014-05-04 22:00:00'))
            ){
            
            if (keyCheck(docs[i].title)){
              keyMash ++;
            }
            
            console.log('\n★★★' + docs[i].title + '★★★\n');
            /*
            console.log('【发帖时间】： ' + docs[i].uptime);
            console.log(docs[i].text);
            console.log('【帖子链接】： ' + docs[i].url + '\n');
            */
            contentUsed ++;
         }
      }
      console.log('USE: ' + contentUsed);     //有用的帖子数
      console.log('ALL: ' + docs.length);     //所有的帖子数
      console.log('KEYMASH: ' + keyMash);     //匹配到的关键词个数
   });
}
getContent();


//字符串转日期
function stringToDate(string){
   var str = string;
   str = str.replace(/-/g,"/");
   var date = new Date(str);
   return date;
}

//查找关键词
function keyCheck(str){
   var keyWords = allWords;
   var result = false;
   
   if (checkcheck(keyWords['朝阳'], str)){
      result = true;
   }
   else if (checkcheck(keyWords['海淀'], str)){
      result = true;
   }
   else if (checkcheck(keyWords['东城'], str)){
      result = true;
   }
   else if (checkcheck(keyWords['西城'], str)){
      result = true;
   }
   else if (checkcheck(keyWords['崇文'], str)){
      result = true;
   }
   else if (checkcheck(keyWords['宣武'], str)){
      result = true;
   }
   else if (checkcheck(keyWords['昌平'], str)){
      result = true;
   }
   else if (checkcheck(keyWords['丰台'], str)){
      result = true;
   }
   else if (checkcheck(keyWords['通州'], str)){
      result = true;
   }
   else if (checkcheck(keyWords['石景山'], str)){
      result = true;
   }
   else if (checkcheck(keyWords['房山'], str)){
      result = true;
   }
   return result;
}

function checkcheck(keyWords, str){
   var check = false;
   for (var i=0; i<=keyWords.length-1; i++){
      var station = str.indexOf(keyWords[i]); //如果匹配到，则返回关键词在字符串中的位置，没匹配到则返回-1
      //console.log(station);
      if (station >= 0) {
        check = true;
        console.log('【-----------------地区----------------】： ' + keyWords[i]);
      }
      else{
        //console.log('【地区】：unknown');
      }
   }
   return check;
}

var allWords = {
    "海淀":[
      '海淀','中关村','学院路','安宁庄','白石桥','北航','北京大学','北太平庄','北洼路','厂洼','车道沟','大钟寺','定慧寺','恩济里','二里庄','甘家口','公主坟','航天桥','花园桥','交通大学','蓟门桥','金沟河','军博','联想桥','马连洼','明光桥','牡丹园','清河','清华大学','人民大学','上地','世纪城','双榆树','四季青','苏州街','苏州桥','田村','万柳','万泉河','万寿路','万寿寺','魏公村','温泉','五彩城','五道口','五棵松','五路居','香山','肖家河','西八里庄','西北旺','西二旗','西三旗','西山','西苑','学院路','永定路','玉泉路','皂君庙','增光路','知春路','紫竹桥' 
    ],
    "朝阳":[
       '朝阳','安慧桥','安贞','奥运村','百子湾','八里庄','北沙滩','北苑','CBD','常营','朝青板块','朝外大街','朝阳公园','慈云寺','大山子','大屯','大望路','定福庄','东坝','东大桥','豆各庄','垡头','甘露园','高碑店','工体','广渠门','管庄','国贸','国展','和平街','红庙','花家地','欢乐谷','华威桥','惠新里','惠新西街','呼家楼','将台路','建外大街','健翔桥','京广桥','劲松','酒仙桥','来广营','柳芳','麦子店','媒体村','南磨房','南沙滩','潘家园','三里屯','三元桥','芍药居','胜古','十八里店','石佛营','十里堡','十里河','首都机场','双井','双桥','水碓子','四惠','松榆里','孙河','太阳宫','甜水园','团结湖','望京','小关','小红门','西坝河','燕莎','姚家园','亚运村','左家庄' 
    ],
    "东城":[
      '东城','安定门','北京站','北新桥','朝阳门','灯市口','东单','东四','东四十条','东直门','海运仓','和平里','建国门','交道口','景山','沙滩','王府井','雍和宫' 
    ],
    "西城":[
       '西城','百万庄','车公庄','德胜门','地安门','阜成门','复兴门','官园','鼓楼','金融街','积水潭','六铺炕','马甸','木樨地','南礼士路','三里河','什刹海','小西天','西便门','西单','新街口','西四','西直门','月坛','展览路','真武庙' 
    ],
    "崇文":[
      '崇文门','磁器口','东花市','法华寺','光明楼','广渠门','龙潭湖','前门','天坛','新世界','永定门' 
    ],
    "宣武":[
     '宣武','白广路','白纸坊','菜市口','长椿街','椿树街道','大观园','大栅栏','广安门','和平门','红莲','虎坊桥','马连道','南菜园','牛街','陶然亭','天宁寺','天桥','宣武门','珠市口' 
    ],
    "丰台":[
     '丰台','北大地','菜户营','草桥','长辛店','成寿寺','大红门','东高地','东铁匠营','方庄','丰台路','丰益桥','和义','花乡','角门','嘉园','看丹桥','科技园区','莲花池','刘家窑','六里桥','丽泽桥','卢沟桥','马家堡','木樨园','南苑','蒲黄榆','七里庄','青塔','世界公园','宋家庄','太平桥','五里店','西客站','西罗园','新发地','洋桥','右安门','岳各庄','云岗','玉泉营','赵公口','总部基地','左安门' 
    ],
    "通州":[
     '八里桥','八通线','北关','次渠','东关','果园','九棵树','临河里','梨园','潞城','马驹桥','乔庄','通州北苑','土桥','武夷花园','漷县','西门','新华大街','永乐店','永顺','运河大街','玉桥','张家湾','中仓' 
    ],
    "石景山":[
     '石景山','八宝山','八大处','八角','广宁','古城','金顶街','老山','鲁谷','模式口','苹果园','五里坨','西山','衙门口','杨庄','永乐','玉泉路' 
    ],
    "房山":[
     '房山','长阳','窦店','房山城关','韩村河','良乡','琉璃河','阎村','燕山','迎风','周口店' 
    ],
    "昌平":[
     '昌平','百善','北七家','城北','城南','东小口','回龙观','霍营','立水桥','龙泽','南口','南邵镇','沙河','天通苑','小汤山','阳坊' 
    ],
};








