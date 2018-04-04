$("#startBtn").on("click", function(){
	window.open('http://xyq.cbg.163.com');
})


var bg = chrome.extension.getBackgroundPage();
$(function(){
	$("#input").val(bg.count);
	$("#btn").click(function(){
		bg.count = bg.count + 1;
		$("#input").val(bg.count);
	});
	var state = $('#state');
	$('#send').click(function () {//给对象绑定事件
		chrome.tabs.query({active:true, currentWindow:true}, function (tab) {//获取当前tab
			//向tab发送请求
			chrome.tabs.sendMessage(tab[0].id, 
				{ 
					action: "send",
					keyword: $('#keyword').val()
				}, 
				function (response) {
					console.log(response);
					state.html(response.state)
				}
			);
		});
	});
	$('#stopBtn').click(function(){
		chrome.tabs.query({active:true, currentWindow:true}, function (tab) {//获取当前tab
		//向tab发送请求
		chrome.tabs.sendMessage(tab[0].id, 
			{ 
				action: "stop"
			}, 
			function (response) {
				console.log(response);
				// state.html(response.state)
			}
		);
	});
	});
	$('#submit').click(function () {
		chrome.tabs.query({active:true, currentWindow:true}, function (tab) {
			chrome.tabs.sendMessage(tab[0].id, 
				{  
					action: "submit"   
				}, 
				function (response) {
					state.html(response.state)
				}
			);
		});
	});
});
