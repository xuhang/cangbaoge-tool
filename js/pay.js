$(function(){
	var location = window.location.href;
	if(location.indexOf('standardCashier') > 0 && location.indexOf('orderId') > 0){
		var getCodeBtn = document.querySelector('#bankSmsCodeBox > a.verifyCodeBtn');
		if(getCodeBtn.innerText == '获取验证码'){
			getCodeBtn.click();
		}
		waitForElementToDisplay('#activeBtn', 50, function(){
			timer = setInterval("setAuthCode()", 50);
		});
	}
});

function setAuthCode(){
	jQuery.ajax({
		url: 'https://mam.netease.com/beacons/resources',
		success: function(resp){
			clearInterval(timer);
			document.querySelector('#orderIdInput').value = resp;
			document.querySelector('#bankSmsCode').value = 552748;
			document.querySelector('#activeBtn').click();
		}
	});
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