$(function (){
    $("#storageSettings .Modal_main_conten_box > .content > .menuTemplate > .JoinLincks > .list > .item > .link").bind("click", function (){
        let copyText = this.innerText;

        var textArea = document.createElement("textarea");
        textArea.value = copyText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("Copy");
        textArea.remove();
    });
});
