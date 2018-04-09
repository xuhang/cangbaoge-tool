var running = true;
$(function(){
	chrome.runtime.onMessage.addListener(
		function (request, sender, sendResponse) {
	 		if (request.action == 'stop') {
	 			running = false;
	 			sendResponse({state:'STOP'});
	        		}
	    	}
	);
	var location = window.location.href;

	if('http://xyq.cbg.163.com/' == location){
		//首页
		init();
	}else if(location.indexOf('xyq_overall_search') > 0 && location.indexOf('show_search_role_form') > 0){
		//搜索页
		search();
	}else if(location.indexOf('xyq_overall_search') > 0 && location.indexOf('show_search_role_form') < 0){
		//计算
		calculate();
	}else if(location.indexOf('equip') > 0 && location.indexOf('eid') > 0){
		//提取
		extract(function(){
			document.querySelector('#btn_buy').click();
		});
	}else if(location.indexOf('usertrade') > 0 && location.indexOf('orderid') > 0){
		buy();
	}
});

function init(){
	var links = document.getElementsByTagName('a');
	for (var i = 0; i < links.length; i++) {
		if(links[i].getAttribute('class') == 'f14px'){
			window.location.href= links[i].getAttribute('href');
			break;
		}
	}
}

function search(){
	$('#txt_price_min').val('61');
	$('#txt_price_max').val('1000000');
	document.getElementById('btn_do_query').click();
}

function calculate(){
	waitForElementToDisplay("#order_menu", 100, function(ele){
		var thas = document.querySelectorAll('#order_menu th a');
		for (var i = 0; i < thas.length; i++) {
			if(thas[i].getAttribute('data_attr_name') == 'expire_time'){
				thas[i].click();
				break;
			}
		}
		pageNum = 1;
		startCrawling(pageNum);
	});
}

function startCrawling(pn){
	var curPage = document.querySelector('#pager_bar div a.on');
	if(document.querySelector('#sub_role').getAttribute('class') == 'on' && pn == curPage.innerText){
		allItems = document.querySelectorAll('tr td a.soldImg');
		wi = 0;
		openWindow(wi);
	}
}

function openWindow(wi){
	console.log(running);
	if(!running){
		return;
	}
	if(wi == allItems.length - 1){
		var pageBtn = document.querySelectorAll('#pager_bar div a');
		for (var i = 0; i < pageBtn.length; i++) {
			if("下一页" === pageBtn[i].innerText){
				pageBtn[i].click();
				pageNum = pageNum + 1;
				setTimeout('startCrawling('+pageNum+')', 1000);
				
			}
		}
	}else{
		w = window.open(allItems[wi].getAttribute('href'));
		// window.w.focus();
		winTimer = window.setInterval("winsclosed()", 500);
	}
}


function winsclosed(){
	if(w.closed){
		// alert(window.returnValue);
		console.log(window.returnValue);
		window.clearInterval(winTimer);
		wi = wi+1;
		openWindow(wi);
	}
}


function extract(next){
	var values = [];
	
	var infoItems = document.querySelectorAll('#info_panel ul li');
	for (var i = 0; i < infoItems.length; i++) {
		var s = infoItems[i].innerText;
		values.push(s);
		var re_no = /编号：(\d+)/;
		var re_status = /状态：(\S+)/;
		var re_type = /类型：(\S+)/;
		var re_price = /价格：	￥(\d+.?\d+)（元）/;
		var re_expire = /出售剩余时间：(\d+)\D*(\d+)\D*(\d+)\D*/;
	}
	var allTabs = document.querySelectorAll('div.tabs ul li');
	// alert(allTabs.length);
	for (var i = 0; i < allTabs.length; i++) {
		// alert('~~~');
		var attr = allTabs[i].getAttribute('class');
		// alert(i + " - " +attr);
		
		allTabs[i].click();

		var tabId = allTabs[i].getAttribute('id');
		
		var tabTitle = allTabs[i].innerText;

		var role = {};

		if('role_basic' == tabId){//人物/修炼
			var tables = document.querySelectorAll('#role_info_box div table');
			/*
			tables[0]: 人物状态
			tables[1]: 输出/抗性
			tables[2]: 角色修炼及宠修1
			tables[3]: 角色修炼及宠修2
			tables[4]: 房屋信息
			tables[5]: 积分 其他
			*/
			var role_st = expandTable(tables[0], 1, ['级别','获得经验','新版乾元丹数量','成就点数','总经验','飞升/渡劫/化圣']);
			var role_status = {};
			for(var r=0; r<role_st.length; r++){
				var rr = role_st[r].split(':');
				role_status[rr[0]] = rr[1];
			}
			// var role_resistance = expandTable(tables[1], 0);
			var role_pet_1 = expandTable(tables[2], 0);
			var role_pet_2 = expandTable(tables[3], 0);

			for(var rp in role_pet_2){
				role_pet_1[rp] = role_pet_2[rp];
			}
			// var role_house = expandTable(tables[4], 0);
			// var role_score = expandTable(tables[5], 0);

			var role_basic = {
				'role_status': role_status,
				// 'role_resistance': role_resistance,
				'role_pet': role_pet_1
			};			

			// alert(JSON.stringify(role_basic));
		}else if('role_skill' == tabId){//技能
			var skills = document.querySelectorAll('#role_info_box div div.skill ul li');
			var master_skill = {};
			for(var o=0; o<skills.length; o++){
				if(skills[o].querySelector('h5') && skills[o].querySelector('p')){
					var skill_name = skills[o].querySelector('h5').innerText;
					var skill_level = skills[o].querySelector('p').innerText;
					master_skill[skill_name] = skill_level;
				}
			}

			var tables = document.querySelectorAll('#role_info_box div table.skillTb');

			var life_skill = {};
			var t1_skills = tables[0].querySelectorAll('tr td');
			for(var m=0; m<t1_skills.length; m++){
				if(t1_skills[m].querySelector('h5') && t1_skills[m].querySelector('p')){
					var skill_name = t1_skills[m].querySelector('h5').innerText;
					var skill_level = t1_skills[m].querySelector('p').innerText;
					life_skill[skill_name] = skill_level;
				}
			}

			/*var plot_skill = {};
			var t2_skills = tables[1].querySelectorAll('tr td');
			for(var m=0; m<t2_skills.length; m++){
				if(t2_skills[m].querySelector('h5') && t2_skills[m].querySelector('p')){
					var skill_name = t2_skills[m].querySelector('h5').innerText;
					var skill_level = t2_skills[m].querySelector('p').innerText;
					plot_skill[skill_name] = skill_level;
				}
			}*/

			var tb = document.querySelector('#role_info_box table.tb02');
			var skill_masted = expandTable(tb, 0);

			var role_skill = {
				"master_skill": master_skill,
				"life_skill": life_skill,
				"skill_masted": skill_masted
			};
			// alert(JSON.stringify(role_skill));
		}else if('role_equips' == tabId){//道具/法宝
			var tables = document.querySelectorAll('#role_info_box table.tb03');
			var props = [];
			for(var x=0; x<4; x++){
				var items = tables[x].querySelectorAll('tr td img');
				for(var y=0; y<items.length; y++){
					var equip_name = items[y].getAttribute('data_equip_name');
					var equip_type = items[y].getAttribute('data_equip_type');
					var equip_desc = items[y].getAttribute('data_equip_desc');
					var equip_type_desc = items[y].getAttribute('data_equip_type_desc');
					var desc_list = [];
					var dd = equip_desc.split('#r');
					for(var a=0; a<dd.length; a++){
						var ai = dd[a].indexOf(' ');
						if(ai > 0){
							var t = {};
							t[dd[a].substring(0, ai)] = dd[a].substring(ai+1);
							desc_list.push(t);
						}else{
							desc_list.push(dd[a]);
						}
					}

					dd = equip_type_desc.split('#r');
					for(var a=0; a<dd.length; a++){
						var ai = dd[a].indexOf(' ');
						if(ai > 0){
							var t = {};
							t[dd[a].substring(0, ai)] = dd[a].substring(ai+1);
							desc_list.push(t);
						}else{
							desc_list.push(dd[a]);
						}
					}
					props.push(desc_list);
				}
			}
			// alert(JSON.stringify(props));
			var tables2 = document.querySelectorAll('#role_info_box table.tb02');
			var info = expandTable(tables2[0], 0);
			var info2 = expandTable(tables2[1], 0);
			// alert(JSON.stringify(info));
			// alert(JSON.stringify(info2));
		}else if('role_pets' == tabId){//召唤兽/孩子
			var tb = document.querySelector('#pet_detail_panel table.tb02');
			var pet_info = expandTable(tb, 1, ['类型','是否宝宝','攻击资质','灵性']);
			var pet_skill = document.querySelectorAll('.hasLayout > div:nth-child(1) >  table tr td img');
			var pskills = [];//召唤兽-技能
			for (var c = 0; c < pet_skill.length; c++) {
				var re = /(\d+).gif/g;
				var m;
				if((m = re.exec(pet_skill[c].getAttribute('src'))) != null){
					pskills.push(pets_skills[m[1]]);
				}
				
			}

			//召唤兽-装备
			var child_equips = document.querySelectorAll('#RolePetEquips tr td > img');
			var child_equip = [];
			for(var e=0;e<child_equips.length; e++){
				var equip = getDesc(child_equips[e].getAttribute('data_equip_desc'), child_equips[e].getAttribute('data_equip_type_desc'), ['等级', '伤害', '耐力', '套装效果', '镶嵌效果', '灵力', '修理失败', '特效']);
				child_equip.push(equip);
			}

			// alert(JSON.stringify(child_equip));
		}else if('role_riders' == tabId){//坐骑
			var tb = document.querySelector('#RoleXiangRui');
			var xiangrui = expandTable(tb, 0);
			// alert(JSON.stringify(xiangrui));
		}else if('role_clothes' == tabId){//锦衣
			var tables = document.querySelectorAll('#role_info_box div table');
			var clothes_color = expandTable(tables[0], 0);
			var clothes_tools = expandTable(tables[1], 1).slice(2);

			var role_clothes = {
				"clothes_color": clothes_color,
				"clothes_tools": clothes_tools
			};

			// alert(JSON.stringify(role_clothes));
		} 

		if(i == allTabs.length - 1){
			// alert(values);
			window.opener.window.returnValue = values;
			// console.log(values);
			//parent.window.close();
		}
	}
	// alert(values);
	/*sendNotice('open', '1', function(resp){
		alert('open ' + resp);
	});*/
	next();
}

function buy(){
	var blc = document.querySelector('#pay_detail > div:nth-child(2) > label > strong');
	var tpr = document.querySelector('#pay_detail > div.textRight.f14px > div > strong');
	var re_blc = /￥(\d+.?\d+)/;
	var e = re_blc.exec(blc);
	var balance = parseFloat(e[1]);
	e = re_blc.exec(tpr);
	var tot_price = parseFloat(e[1]);
	if(balance >= tot_price){
		//pagInCurPage();
	}else{
		var btns = document.querySelectorAll('a.btn1');
		if(btns[btns.length - 1].innerText.indexOf('立即支付') >= 0){
			btns[btns.length - 1].click();
		}
	}
	
}


function waitForElementToDisplay(selector, time, handler) {
        if(document.querySelector(selector)!=null) {
            // console.log("The element is displayed, you can put your code instead of this alert.")
            var ele = document.querySelector(selector);
            handler(ele);
            // return;
        }
        else {
            setTimeout(function() {
                waitForElementToDisplay(selector, time, handler);
            }, time);
        }
}


function sendNotice(action, kw, callback){
	chrome.tabs.query({active:true, currentWindow:true}, function (tab) {//获取当前tab
		//向tab发送请求
		chrome.tabs.sendMessage(tab[0].id, 
			{ 
				action: action,
				keyword: kw
			}, 
			function (response) {
				callback(response);
			}
		);
	});
}

function regListener(action, handler){
	chrome.runtime.onMessage.addListener(
		function (request, sender, sendResponse) {
	 		if (request.action == action) {
	 			// handler();
	            			sendResponse({state:'123'});
	        		}
	    	}
	);
}

function expandTable(table, tp, filters){
	//tp = 1 [] 
	//tp = 0 {}
	var rows = table.querySelectorAll('tr');
	var t;
	if(tp == 1){
		t = [];
	}else{
		t = {};
	}
	for (var i = 0; i < rows.length; i++) {
		var dc = rows[i].children;
		if(tp == 0){
			if(dc.length % 2 == 0){
				for(var j=0; j<dc.length/2; j++){
					var key = dc[j*2].innerText.replace('：', '');
					if(filters){
						for(var s=0;s<filters.length;s++){
							if(key.indexOf(filters[s]) >= 0){
								t[key] = dc[j*2 + 1].innerText.replace('：', '');
							}
						}
					}else{
						t[key] = dc[j*2 + 1].innerText.replace('：', '');
					}
				}
			
			}
		}else{
			for(var k=0; k<dc.length; k++){
				var e = dc[k].innerText.replace('：', ':');
				if(filters){
					for(var s=0;s<filters.length;s++){
						if(e.indexOf(filters[s]) >= 0){
							t.push(e);
						}
					}
				}else{
					t.push(e);
				}
			}
		}
	}
	return t;
}

function getDesc(desc, type_desc, filters){
	var d = [];
	if(desc){
		var d1 = desc.split('#r');
	}
	if(type_desc){
		var d2 = type_desc.split('#r');
	}
	if(d1){
		var c = d1.concat(d2);
	}else{
		var c = d2;
	}
	
	if(filters){
		for(var k=0; k<c.length; k++){
			for(var j=0; j<filters.length; j++){
				if(c[k].indexOf(filters[j]) >= 0){
					d.push(c[k]);
				}
			}
		}
		return d;
	}else{
		return c;
	}
}

function xhrRequest(url,callback){  
    var xhr = createXHR();  
    xhr.onreadystatechange = function(){  
        if(xhr.readyState == 4){  
            if((xhr.status >= 200 && xhr.status<300) || xhr.status == 304){  //200 表示相应成功 304 表示缓存中存在请求的资源  
                // 对响应的信息写在回调函数里面  
                var str = xhr.responseText;  
                callback(str);  
            }  
            else{  
                return 'request is unsucessful '+xhr.status;  
            }  
        }  
    }  
    xhr.open('get',url,true);  
    xhr.send();  
}

var pets_skills = {'0571': '力劈华山',
		'0554': '善恶有报',
		'0552': '死亡召唤',
		'0661': '须弥真言',
		'0595': '壁垒击破',
		'0579': '法术防御',
		'0639': '灵能激发',
		'0638': '法力陷阱',
		'0597': '剑荡四方',
		'0599': '移花接木',
		'0553': '上古灵符',
		'0671': '无畏布施',
		'0673': '灵山禅语',
		'0505': '迟钝',
		'0596': '嗜血追击',
		'0404': '高级吸血',
		'0416': '高级必杀',
		'0425': '高级偷袭',
		'0405': '高级连击',
		'0407': '高级隐身',
		'0422': '高级敏捷',
		'0411': '高级神佑复生',
		'0412': '高级鬼魂术',
		'0424': '高级魔之心',
		'0573': '高级法术连击',
		'0577': '高级法术暴击',
		'0578': '高级法术波动',
		'0434': '高级强力',
		'0413': '高级驱鬼',
		'0435': '高级防御',
		'0414': '高级毒',
		'0406': '高级飞行',
		'0410': '高级冥思',
		'0415': '高级慧根',
		'0627': '高级法术抵抗',
		'0430': '高级雷属性吸收',
		'0431': '高级土属性吸收',
		'0432': '高级水属性吸收',
		'0433': '高级火属性吸收',
		'0401': '高级夜战',
		'0408': '高级感知',
		'0641': '高级合纵',
		'0629': '高级盾气',
		'0403': '高级反震',
		'0417': '高级幸运',
		'0418': '高级精神集中',
		'0419': '高级神迹',
		'0426': '奔雷咒',
		'0427': '泰山压顶',
		'0428': '水漫金山',
		'0429': '地狱烈火',
		'0301': '夜战',
		'0308': '感知',
		'0640': '合纵',
		'0628': '盾气',
		'0303': '反震',
		'0317': '幸运',
		'0318': '精神集中',
		'0319': '神迹',
		'0326': '雷击',
		'0327': '落岩',
		'0328': '水攻',
		'0329': '烈火',
		'0304': '吸血',
		'0316': '必杀',
		'0325': '偷袭',
		'0305': '连击',
		'0307': '隐身',
		'0322': '敏捷',
		'0311': '神佑复生',
		'0312': '鬼魂术',
		'0324': '魔之心',
		'0510': '法术连击',
		'0575': '法术暴击',
		'0576': '法术波动',
		'0334': '强力',
		'0313': '驱鬼',
		'0335': '防御',
		'0314': '毒',
		'0306': '飞行',
		'0310': '冥思',
		'0315': '慧根',
		'0626': '法术抵抗',
		'0330': '雷属性吸收',
		'0331': '土属性吸收',
		'0332': '水属性吸收',
		'0333': '火属性吸收',
		'0402': '高级反击',
		'0420': '高级招架',
		'0421': '高级永恒',
		'0409': '高级再生',
		'0423': '高级否定信仰',
		'0593': '八凶法阵',
		'0624': '龙魂',
		'0572': '夜舞倾城',
		'0551': '惊心一剑',
		'0302': '反击',
		'0320': '招架',
		'0321': '永恒',
		'0309': '再生',
		'0323': '否定信仰',
		'0650': '苍鸾怒击',
		'0663': '天降灵葫',
		'0667': '大快朵颐',
		'0669': '月光',
		'0684': '食指大动',
		'0685': '理直气壮',
		'0336': '独行',
		'0337': '法术反震',
		'0436': '高级独行',
		'0437': '高级法术反震',
		'0660': '浮云神马'}