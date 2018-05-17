//点击矢量按钮切换
function showVec() {
    layerImg.setVisibility(false);
    layerCia.setVisibility(false);
    layerVec.setVisibility(true);
    layerCva.setVisibility(true);
    map.setBaseLayer(layerVec);
}

//点击影像按钮切换
function showImg() {
    layerVec.setVisibility(false);
    layerCva.setVisibility(false);
    layerImg.setVisibility(true);
    layerCia.setVisibility(true);
    map.setBaseLayer(layerImg);
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


var startPointNameAndDestPointNameFromPopup = false;
/* 获取路径信息 */
function findPath() {
    drawPoint.deactivate();
    var findPathService, parameter, analystParameter, resultSetting;
    resultSetting = new SuperMap.REST.TransportationAnalystResultSetting({
        returnEdgeFeatures: true,
        returnEdgeGeometry: true,
        returnEdgeIDs: true,
        returnNodeFeatures: true,
        returnNodeGeometry: true,
        returnNodeIDs: true,
        returnPathGuides: true,
        returnRoutes: true
    });
    analystParameter = new SuperMap.REST.TransportationAnalystParameter({
        resultSetting: resultSetting,
        weightFieldName: "SmLength"
    });

    parameter = new SuperMap.REST.FindPathParameters({
        isAnalyzeById: false,
        nodes: nodeArray,
        hasLeastEdgeCount: false,
        parameter: analystParameter
    });
    if (nodeArray.length <= 1) {
        $(".errorPane").fadeIn(300, function () {
            $(".errorCont .bottom").text("站点数目有误！");
        });
    }
    findPathService = new SuperMap.REST.FindPathService(urlRoudNet, {
        eventListeners: {
            "processCompleted": processCompletedPath
        }
    });
    findPathService.processAsync(parameter);
    nodeArray = [];
}

function processCompletedPath(findPathEventArgs) {
    var result = findPathEventArgs.result;
    allScheme(result);
}

function allScheme(result) {
    if (pathListIndex < result.pathList.length) {
        addPath(result);
    } else {
        pathListIndex = 0;
    }
}
/* 以动画效果显示分析结果 */
function addPath(result) {
    if (routeCompsIndex < result.pathList[pathListIndex].route.components.length) {
        var pathFeature = new SuperMap.Feature.Vector();
        var points = [];
        for (var k = 0; k < 2; k++) {
            if (result.pathList[pathListIndex].route.components[routeCompsIndex + k]) {
                for (var circle = 0; circle < result.pathList[pathListIndex].route.components[routeCompsIndex + k].components.length; circle++) {
                    points.push(new SuperMap.Geometry.Point(
                        result.pathList[pathListIndex].route.components[routeCompsIndex + k].components[circle].x,
                        result.pathList[pathListIndex].route.components[routeCompsIndex + k].components[circle].y));
                }
            }
        }
        var curLine = new SuperMap.Geometry.LineString(points);
        pathFeature.geometry = curLine;
        pathFeature.style = style;
        vectorLayer.addFeatures(pathFeature);
    } else {
        return;
    }
    var roadAjax = ""; //存放路径文字信息的字符串（带html样式）
    if (startPointNameAndDestPointNameFromPopup) {
        startPointName = $(".q-input").eq(0).val();
        destPointName = $(".q-input").eq(1).val();
    } else {
        startPointName = "自定义点";
        destPointName = "自定义点";
    }
    roadAjax += "<div class='path_km'><span>总距离约为<b>" + result.pathList[0].weight.toFixed(2) + "</b>米</span></div>"; //roadDistance.toFixed(2)
    roadAjax += "<dl><dt><i>起</i>" + startPointName + "</dt></dl>";
    var roadNum = 0,
        description;
    roadAjax += "<dl>";
    for (j = 0; j < result.pathList[0].pathGuideItems.length; j++) {
        if (result.pathList[0].pathGuideItems[j].isStop != true && result.pathList[0].pathGuideItems[j].turnType != "NONE") {
            roadAjax += ",";
            roadAjax += result.pathList[0].pathGuideItems[j].description.replace(/([0-9]+\.[0-9]{2})[0-9]*/, "$1");
            roadAjax += "</dd>";
        }
        if (result.pathList[0].pathGuideItems[j].isStop == true || result.pathList[0].pathGuideItems[j].turnType == "NONE") {
            roadAjax += "<dd>";
            roadNum++;
            roadAjax += "<s>";
            roadAjax += roadNum;
            roadAjax += "、</s>";
            roadAjax += result.pathList[0].pathGuideItems[j].description.replace(/([0-9]+\.[0-9]{2})[0-9]*/, "$1");
        }
    }
    roadAjax += "</dl>";
    roadAjax += "<dl><dt><i class='btn-orange'>终</i>" + destPointName + "</dt></dl>";
    $(".resultPane").fadeIn();
    $("#mCSB_1_container").html(roadAjax);
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
})