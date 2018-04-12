$(function(){
	var location = window.location.href;
	if(location.indexOf('standardCashier') > 0 && location.indexOf('orderId') > 0){
		waitForElementToDisplay('.verifyCodeBtn', 50, function(){
			getCodeBtn = document.querySelector('#bankSmsCodeBox > a.verifyCodeBtn');
			if(getCodeBtn.innerText == '获取验证码'){
				setTimeout('getCodeBtn.click();', 300);
				
			}
			
		});
		waitForElementToDisplay('#activeBtn', 50, function(){
			timer = setInterval("setAuthCode()", 300);
		});
	}
});

function setAuthCode(){
	var amt = document.querySelector('#productPrice').innerText;
	jQuery.ajax({
		url: baseurl + 'code/getcode.action?a='+amt,
		dataType: 'json',
       		crossDomain: true,
		success: function(code){
			console.log(code);
			// var code = JSON.parse(resp);
			// console.log('======='+code['amount'] == amt+'=======')
			if(code['amount'] == amt){
				clearInterval(timer);
				// document.querySelector('#orderIdInput').value = resp;
				document.querySelector('#bankSmsCode').value = code['code'];
				if(document.querySelector('#bankSmsCode').value == code['code']){
					document.querySelector('#activeBtn').click();
				}

				// document.querySelector('#activeBtn').click();
			}
			
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