/* 全图 */
function allMap() {
    $(".downtown").fadeOut();
    $(".citySel .county").fadeOut();
    $(".mapPot span").text("湖南省");
    var bounds = new SuperMap.Bounds(111.01830338208, 27.45066750293, 113.65502213208, 28.785506370118);
    map.zoomToExtent(bounds, true);
}

/* 清除 */
function clearElements() {
    $("#mCSB_1_container").html(' ');
    $(".resultPane .resultCont").css("bottom", "0px"); //让结果面板距离底部距离恢复为0
    $("#Pagination").hide(); //隐藏分页按钮
    $(".resultPane").fadeOut();
    vectorLayer.removeAllFeatures();
    markerLayer.clearMarkers();
    startChooise = -1, endChooise = -1;
    start.onclick = function () { //恢复起点被再次点击的功能
        chooseStart("start");
    }
    end.onclick = function () { //恢复终点被再次点击的功能
        chooseStart("end");
    }
    clearAllMeasureAreaResult();
    clearAllMeasureDistanceResult();
    clearAllMeasureCircleResult();
}


/* 量算 */
function measuresAll() {
    if (seeSearchShow) { //根据实际情况调整具体位置
        $(".tool_measure").css("top", "340px");
    } else {
        $(".tool_measure").css("top", "60px");
    }
    $(".tool_measure").fadeIn();
    measureShow = true;
}
/* 量算种类切换 */
$(".tool_measure .top ul li").click(function () {
    var index = $(this).index();
    $(this).addClass("selT").siblings().removeClass("selT");
    $(".tool_measure .content ul li").eq(index).addClass("selC").siblings().removeClass("selC");
    if (index == 0) {
        lineMeasure(); //线  该方法在文件measure.js中
    } else if (index == 1) {
        polygonMeasure(); //多边形 该方法在文件measure.js中
    } else if (index == 2) {
        circleMeasure(); //圆 该方法在文件measure.js中
    } else { //关闭量算框
        $(".tool_measure").hide();
        $(".tool_measure .top ul li").removeClass("selT");
        $(".tool_measure .content ul li").removeClass("selC");
        clearAllMeasureAreaResult();
        clearAllMeasureDistanceResult();
        clearAllMeasureCircleResult();
        $(".tool_measure").css("top", "60px");
        if (seeSearchShow) {
            $(".seeSearch").css("top", "60px");
        }
        measureShow = false;
    }
});

/* 多时相跳转 */
function gotoMultidate() {
    window.open('http://222.247.40.204:8081/TDTHN/portal/map/multidatefilter.html');
}


/* 视野内查询显示和隐藏 */
function showSeeSearch() {
    if (measureShow) { //根据实际情况调整具体位置
        $(".seeSearch").css("top", "160px");
    } else {
        $(".seeSearch").css("top", "60px");
    }
    $(".seeSearch").fadeIn();
    seeSearchShow = true;
}
$(".seeSearch .close").click(function () {
    $(".seeSearch").hide();
    $(".seeSearch").css("top", "60px");
    if (measureShow) {
        $(".tool_measure").css("top", "60px");
    }
    seeSearchShow = false;
});