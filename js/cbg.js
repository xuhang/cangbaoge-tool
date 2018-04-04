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
		
		var tabTitle = allTabs[i].innerText;
		var tables = document.querySelectorAll('#role_info_box div table');
		values.push("========"+tabTitle+"========");
		// alert('---');
		for (var j = 0; j < tables.length; j++) {
			var t = expandTable(tables[j]);
			values.push(JSON.stringify(t));
		}
		// alert('===');
		// var t = document.querySelectorAll('#role_info_box div h4');
		// values.push(tabTitle + " - " +t[0].innerText);
		if(i == allTabs.length - 1){
			// alert(values);
			window.opener.window.returnValue = values;
			// console.log(values);
			parent.window.close();
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


function expandTable(table){
	var rows = table.querySelectorAll('tr');
	var t = {};
	for (var i = 0; i < rows.length; i++) {
		var dc = rows[i].children;
		if(dc.length == 2){
			t[dc[0].innerText] = dc[1].innerText;
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