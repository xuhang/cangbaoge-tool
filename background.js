/*function httpRequest(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            callback(true);
        }
    }
    xhr.onerror = function() {
        callback(false);
    }
    xhr.send();
}*/


var count = 0;

var flag = true;

var page = 1;

var productIndex = 1;