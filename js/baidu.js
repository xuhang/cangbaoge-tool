var kw = $('#kw');
var form = $('#form');
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action == "send") {
            kw.val(request.keyword)
            sendResponse({state:'关键词填写成功！'});
        }
        if (request.action == "submit") {
            form.submit();
            sendResponse({state:'提交成功！'});
        }
    }
);