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
		extract();
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


function extract(){
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

		alert(tabId);
		
		var tabTitle = allTabs[i].innerText;

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
			var role_status = expandTable(tables[0], 1);
			var role_resistance = expandTable(tables[1], 0);
			var role_pet_1 = expandTable(tables[2], 0);
			var role_pet_2 = expandTable(tables[3], 0);
			var role_house = expandTable(tables[4], 0);
			var role_score = expandTable(tables[5], 0);

			var role_basic = {
				'role_status': role_status,
				'role_resistance': role_resistance,
				'role_pet_1': role_pet_1,
				'role_pet_2': role_pet_2,
				'role_house': role_house,
				'role_score': role_score,
			};			

			//console.log(JSON.stringify(role_basic));
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

			var plot_skill = {};
			var t2_skills = tables[1].querySelectorAll('tr td');
			for(var m=0; m<t2_skills.length; m++){
				if(t2_skills[m].querySelector('h5') && t2_skills[m].querySelector('p')){
					var skill_name = t2_skills[m].querySelector('h5').innerText;
					var skill_level = t2_skills[m].querySelector('p').innerText;
					plot_skill[skill_name] = skill_level;
				}
			}

			var role_skill = {
				"master_skill": master_skill,
				"life_skill": life_skill,
				"plot_skill": plot_skill
			};
			
		}else if('role_equips' == tabId){//道具/法宝
		}else if('role_pets' == tabId){//召唤兽/孩子
		}else if('role_riders' == tabId){//坐骑
		}else if('role_clothes' == tabId){//锦衣
			var tables = document.querySelectorAll('#role_info_box div table');
			var clothes_color = expandTable(tables[0], 0);
			var clothes_tools = expandTable(tables[1], 0);

			var role_clothes = {
				"clothes_color": clothes_color,
				"clothes_tools": clothes_tools
			};

			alert(JSON.stringify(role_clothes));
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


function expandTable(table, tp){
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
					t[dc[j*2].innerText.replace('：', '')] = dc[j*2 + 1].innerText.replace('：', '');
				}
			
			}
		}else{
			for(var k=0; k<dc.length; k++){
				t.push(dc[k].innerText.replace('：', ':'));
			}
		}
	}
	return t;
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
