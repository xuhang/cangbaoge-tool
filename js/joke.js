var initJoke = true;
var linkText;
var bgColor;
function change_link_text(el, ml, mt){
	linkText = el.text;
	el.text = charTimes('哈', linkText.length);
	bgColor = el.style.backgroundColor;
	el.style.backgroundColor = "#ff0000";
}

function recover_link_text(el, ml, mt){
	el.text = linkText;
	el.style.backgroundColor = bgColor;
}
// alert('--');

function mouse_over(e){
	if(!e){
		e = window.event;
	}
	change_link_text(this, e.clientX, e.clientY);
}

function mouse_out(e){
	if(!e){
		e = window.event;
	}
	recover_link_text(this, e.clientX, e.clientY);
}

function charTimes(ch, times){
	res = '';
	for(var i=0;i<times;i++){
		res += ch;
	}
	return res;
}

var allEles = document.querySelectorAll('a');
if(allEles){
	for(var i=0; i<allEles.length;i++){
		allEles[i].onmouseover = mouse_over;
		allEles[i].onmouseout = mouse_out;
	}
	
}
