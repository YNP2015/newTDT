//点击矢量按钮切换
function showVec() {
    curType = "vec";
    getZoomNum(); //该方法写在 map.js  中
}

//点击影像按钮切换
function showImg() {
    curType = "img";
    getZoomNum();
}
//放大按钮
function zoomIn() {
    $("#rKey").css("visibility", "hidden");
    map.zoomIn();
}

//缩小按钮
function zoomOut() {
    $("#rKey").css("visibility", "hidden");
    map.zoomOut();
}


/* 市点击调整地图范围 */
function zoomToProvincesCities(x1, y1, x2, y2, cityName) {
    $(".mapPot span").text(cityName);
    var bounds = new SuperMap.Bounds(x1, y1, x2, y2);
    map.zoomToExtent(bounds, false);
}

/* 获取市区顺序序号并将对应地名显示 */
$(".downtown li").click(function () {
    $(".citySel .county").html('');
    var index = $(this).index() + 1;
    var url = "../public/city.json";
    $.ajax({
        type: "get",
        url: url,
        async: false,
        success: function (data) {
            obj = data[index];
            for (var i = 0; i < obj.length; i++) {
                var citys = obj[i].name;
                var poi = obj[i].bounds;
                $(".citySel .county").append(`<li onclick = "zoomToProvincesCities(${poi[0]}, ${poi[1]}, ${poi[2]}, ${poi[3]},'${citys}')">${citys}</li>`);
            }
        }
    });
});


/* 显示路径查询框 */
function showRoadSearch() {
    clearElements();
    $(".searchPane").fadeOut(300, function () {
        $(".searchRoadPane").fadeIn();
    });
}
/* 关闭历经查询框后显示搜索框 */
function showPoiSearch() {
    clearElements();
    $(".searchRoadPane").fadeOut(300, function () {
        $(".searchPane").fadeIn();
    });
}

/* 與地圖無關的功能 */
$(function () {
    /* 点击菜单按钮显示菜单块 */
    $(".searchLeft").click(function () {
        $(".resultPane").fadeOut(300, function () {
            clearElements();
            $(".menuPane").fadeIn();
        });
    });
    /* 当搜索框获得焦点 */
    $(".poiSearch").focus(function () {
        $(".menuPane").fadeOut();
    });
    /* 关闭错误弹出框 */
    $(".errorCont i").click(function () {
        $(".errorPane").fadeOut();
        $(".resultPane").fadeOut(); //关闭结果面板
    });
    /* 点击显示市选择栏 */
    var downtownShow = false;
    $(".mapPot").click(function () {
        if (downtownShow) {
            $(".downtown").fadeOut();
            $(".county").fadeOut();
            downtownShow = false;
        } else {
            $(".downtown").fadeIn();
            downtownShow = true;
        }
    });
    $(".downtown>li").click(function () {
        $(".citySel .county").fadeIn();
    });

    /* 关闭poi详细信息弹出框显示poi搜索列表 */
    $(".poiMsg .return").click(function(){
        $(".poiMsg").fadeOut(300,function(){
            closeInfoPoi();
            $(".resultPane").fadeIn();
        });
    });
})