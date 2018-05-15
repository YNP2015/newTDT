//设置起点和终点的函数
function chooseStart(startOrEnd) {
    $(".menuPane").fadeOut(); //隐藏菜单块
    if ((startChooise == 1) && (endChooise == 1)) {
        clearElements();/* 该函数在 main.js 文件中定义 */
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
        start.onclick = function () {					//禁止起点被再次点击
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
        end.onclick = function () {					//禁止终点被再次点击
            return false;
        }
    }
    if ((startChooise == 1) && (endChooise == 1)) { //如果起点和终点都已经设置好了
        map.raiseLayer(vectorLayer, 5);
        $("#rKey").css("visibility", "hidden"); //隐藏鼠标右击弹窗
        findPath(); /* 该函数在 main.js 文件中定义 */
        start.onclick = function () {					//恢复起点被再次点击的功能
            chooseStart("start");
        }
        end.onclick = function () {					//恢复终点被再次点击的功能
            chooseStart("end");
        }
    }
    drawPoint.deactivate(); //关闭点击画点事件，防止一次可以多次点击，没有这句就可以一次设置多个起（终）点
}