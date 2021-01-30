$(".messageItem_content_img").bind("click", function (e) {
    $("#viewImgObj").attr("src", e.currentTarget.src);

    let w = e.currentTarget.width * 2;
    let h = e.currentTarget.height * 2;

    let l = screen.width/2 - w/2;
    let t = 10;

    $("#viewImgObj").attr("width", w);
    $("#viewImgObj").attr("height", h);

    $("#viewImgBox").css("width", w);
    $("#viewImgBox").css("height", h + 20);

    $("#viewImgBox").css("top", t);
    $("#viewImgBox").css("left", l);

    $("#viewImg").show();
});