//设置起点和终点的函数
function chooseStart(startOrEnd) {
    $(".menuPane").fadeOut(); //隐藏菜单块
    if ((startChooise == 1) && (endChooise == 1)) {
        clearElements(); /* 该函数在 main.js 文件中定义 */
    }
    if (startOrEnd == "start") {
        imgIcon = "../public/images/mark/start.png";
        startChooise = 0;
        drawCompleted();
    } else {
        imgIcon = "../public/images/mark/end.png";
        endChooise = 0;
        drawCompleted();
    }
}
/* 标记起始点 */
function drawCompleted(drawGeometryArgs) {
    var pixelX = parseInt($('#rKey').css("left"));
    var pixelY = parseInt($('#rKey').css("top"));
    var px = new SuperMap.Pixel(pixelX, pixelY);
    var lonlat = map.getLonLatFromPixel(px);
    var size = new SuperMap.Size(25, 40);
    var offset = new SuperMap.Pixel(-(size.w / 2), -size.h);
    if (imgIcon == "../public/images/mark/start.png") {
        var startIcon = new SuperMap.Icon(imgIcon, size, offset);
        markerStartRtclick = new SuperMap.Marker(lonlat, startIcon);
        markerLayer.addMarker(markerStartRtclick);
        vectorLayer.removeAllFeatures();
        startPointSM = new SuperMap.Geometry.Point(lonlat.lon, lonlat.lat);
        nodeArray.push(startPointSM);

    }
    if (imgIcon == "../public/images/mark/end.png") {
        var endIcon = new SuperMap.Icon(imgIcon, size, offset);
        markerEndRtclick = new SuperMap.Marker(lonlat, endIcon);
        markerLayer.addMarker(markerEndRtclick);
        vectorLayer.removeAllFeatures();
        destPointSM = new SuperMap.Geometry.Point(lonlat.lon, lonlat.lat);
        nodeArray.push(destPointSM);
    }
    $("#rKey").css("visibility", "hidden");
    if (startChooise == 0) { //如果设置的是起点
        startChooise = 1;
        map.removeAllPopup();
        /*移除掉起点和终点的marker*/
        if (markerStart) {
            markerLayer.removeMarker(markerStart);
        }
        if (markerEnd) {
            markerLayer.removeMarker(markerEnd);
        }
        start.onclick = function () { //禁止起点被再次点击
            return false;
        }
    } else if (endChooise == 0) {
        endChooise = 1;
        map.removeAllPopup();
        /*移除掉起点和终点的marker*/
        if (markerStart) {
            markerLayer.removeMarker(markerStart);
        }
        if (markerEnd) {
            markerLayer.removeMarker(markerEnd);
        }
        end.onclick = function () { //禁止终点被再次点击
            return false;
        }
    }
    if ((startChooise == 1) && (endChooise == 1)) { //如果起点和终点都已经设置好了
        map.raiseLayer(vectorLayer, 5);
        $("#rKey").css("visibility", "hidden"); //隐藏鼠标右击弹窗
        findPath(); /* 该函数在 main.js 文件中定义 */
        start.onclick = function () { //恢复起点被再次点击的功能
            chooseStart("start");
        }
        end.onclick = function () { //恢复终点被再次点击的功能
            chooseStart("end");
        }
    }
    drawPoint.deactivate(); //关闭点击画点事件，防止一次可以多次点击，没有这句就可以一次设置多个起（终）点
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