/**
 * measureDistanceCounts 量算次数
 * measureMapDistance 一次量算对应到绘制的所有点和线
 * featuresDistanceId 所有点和线要素的id
 * popupDistanceMap 一次量算对应到添加的所有量算结果popup
 * popups 所有量算结果集合
 */
var measureDistanceControl, measureDistanceCounts = 0,
    measureCircleControl, measureCircleCounts = 0,
    measureAreaControl, measureAreaCounts = 0,
    measureMapDistance = new HashMap(),
    featuresDistanceId = [],
    measureMapCircle = new HashMap(),
    featuresCircleId = [],
    measureMapArea = new HashMap(),
    featuresAreaId = [],
    popupDistanceMap = new HashMap(),
    popupCircleMap = new HashMap(),
    popupAreaMap = new HashMap(),
    popups,
    measureDistanceIndex, measureCircleIndex, measureAreaIndex, measureFeature;
var styleLine = {
        strokeWidth: 3,
        strokeLinecap: "round",
        strokeOpacity: 1,
        strokeColor: "#569cf1",
        strokeDashstyle: "solid"
    },
    styleCircle = {
        strokeWidth: 3,
        strokeLinecap: "round",
        strokeOpacity: 1,
        strokeColor: "#569cf1",
        strokeDashstyle: "solid",
        fillColor: "#569cf1",
        fillOpacity: 0.3
    },
    styleArea = {
        strokeWidth: 3,
        strokeLinecap: "round",
        strokeOpacity: 1,
        strokeColor: "#569cf1",
        strokeDashstyle: "solid",
        fillColor: "#569cf1",
        fillOpacity: 0.3
    },
    stylePoint = {
        pointRadius: 4,
        graphicName: "square",
        fillColor: "white",
        fillOpacity: 1,
        strokeWidth: 1,
        strokeOpacity: 1,
        strokeColor: "#569cf1"
    };
var sketchSymbolizers = {
    "Point": {
        pointRadius: 0,
        graphicName: "square",
        fillColor: "white",
        fillOpacity: 1,
        strokeWidth: 1,
        strokeOpacity: 1,
        strokeColor: "#333333"
    },
    "Line": {
        strokeWidth: 3,
        strokeLinecap: "round",
        strokeOpacity: 1,
        strokeColor: "#569cf1",
        strokeDashstyle: "dash"
    },
    "Polygon": {
        strokeWidth: 2,
        strokeOpacity: 1,
        strokeColor: "#666666",
        fillColor: "white",
        fillOpacity: 0.3
    }
};
var style = new SuperMap.Style();
style.addRules([
    new SuperMap.Rule({
        symbolizer: sketchSymbolizers
    })
]);
var styleMap = new SuperMap.StyleMap({
    "default": style
});
var lineMeasureState = false
var polygonMeasureState = false
var circleMeasureState = false

function lineMeasure() {

    if (measureDistanceControl) measureDistanceControl.deactivate();
    if (measureAreaControl) measureAreaControl.deactivate();
    if (measureCircleControl) measureCircleControl.deactivate();
    polygonMeasureState = false
    circleMeasureState = false
    if (lineMeasureState) {
        if ($("#measureTipDiv")) {
            $("#measureTipDiv").remove();
        }
        map.events.un({
            "mousemove": tipMeasure
        });
        map.events.un({
            "mousemove": tipMeasureCircle
        });
        //移除鼠标样式
        $("#map").removeClass('sm_measure');
        lineMeasureState = false
        return
    }

    popups = [];

    //设置标注时鼠标样式
    $("#map").addClass('sm_measure');
    measureDistanceControl = new SuperMap.Control.Measure(
        SuperMap.Handler.Path, {
            persist: false,
            immediate: true,
            geodesic: true,
            handlerOptions: {
                layerOptions: {
                    styleMap: styleMap
                }
            }
        }
    );

    //监听 measure 和 measurepartial 两个事件，量算完成时触发时
    //量算完成时触发 measure 事件，当点被添加到量算过程中时触发 measurepartial
    measureDistanceControl.events.on({
        "measure": handleDistanceMeasure,
        "measurepartial": handleDistanceMeasurepartial
    });
    //添加控件到 map 上
    map.addControl(measureDistanceControl);
    //激活控件
    measureDistanceControl.activate();
    //添加鼠标移动监听事件
    map.events.un({
        "mousemove": tipMeasureCircle
    });
    //添加鼠标移动监听事件
    map.events.on({
        "mousemove": tipMeasure
    });
    lineMeasureState = true
}

function circleMeasure() {
    if (measureDistanceControl) measureDistanceControl.deactivate();
    if (measureAreaControl) measureAreaControl.deactivate();
    if (measureCircleControl) measureCircleControl.deactivate();
    polygonMeasureState = false
    lineMeasureState = false

    if (circleMeasureState) {
        if ($("#measureTipDiv")) {
            $("#measureTipDiv").remove();
        }
        map.events.un({
            "mousemove": tipMeasureCircle
        });
        map.events.un({
            "mousemove": tipMeasure
        });
        //移除鼠标样式
        $("#map").removeClass('sm_measure');
        circleMeasureState = false
        return
    }

    popups = [];
    //设置标注时鼠标样式
    $("#map").addClass('sm_measure');
    measureCircleControl = new SuperMap.Control.Measure(
        SuperMap.Handler.RegularPolygon, {
            persist: false,
            immediate: true,
            geodesic: true,
            handlerOptions: {
                layerOptions: {
                    styleMap: styleMap
                },
                sides: 100
            }
        }
    );

    //监听 measure 和 measurepartial 两个事件，量算完成时触发时
    //量算完成时触发 measure 事件，当点被添加到量算过程中时触发 measurepartial
    measureCircleControl.events.on({
        "measure": handleMeasureCircle,
        "measurepartial": handleMeasureCirclePartial
    });
    //添加控件到 map 上
    map.addControl(measureCircleControl);
    //激活控件
    measureCircleControl.activate();
    //移除鼠标移动监听事件
    map.events.un({
        "mousemove": tipMeasure
    });
    //添加鼠标移动监听事件
    map.events.on({
        "mousemove": tipMeasureCircle
    });
    circleMeasureState = true
}

function polygonMeasure() {
    if (measureDistanceControl) measureDistanceControl.deactivate();
    if (measureAreaControl) measureAreaControl.deactivate();
    if (measureCircleControl) measureCircleControl.deactivate();
    lineMeasureState = false
    circleMeasureState = false
    if (polygonMeasureState) {
        if ($("#measureTipDiv")) {
            $("#measureTipDiv").remove();
        }
        map.events.un({
            "mousemove": tipMeasure
        });
        map.events.un({
            "mousemove": tipMeasureCircle
        });
        //移除鼠标样式
        $("#map").removeClass('sm_measure');
        polygonMeasureState = false
        return
    }

    popups = [];
    //设置标注时鼠标样式
    $("#map").addClass('sm_measure');
    measureAreaControl = new SuperMap.Control.Measure(
        SuperMap.Handler.Polygon, {
            persist: false,
            immediate: true,
            geodesic: true,
            handlerOptions: {
                layerOptions: {
                    styleMap: styleMap
                }
            }
        }
    );

    //监听 measure 和 measurepartial 两个事件，量算完成时触发时
    //量算完成时触发 measure 事件，当点被添加到量算过程中时触发 measurepartial
    measureAreaControl.events.on({
        "measure": handleMeasureArea,
        "measurepartial": handleMeasureAreaPartial
    });
    //添加控件到 map 上
    map.addControl(measureAreaControl);
    //激活控件
    measureAreaControl.activate();
    map.events.un({
        "mousemove": tipMeasureCircle
    });
    //添加鼠标移动监听事件
    map.events.on({
        "mousemove": tipMeasure
    });
    polygonMeasureState = true
}



//提示“左键单击增加点，双击结束”
function tipMeasure(event) {
    if (!$("#measureTipDiv")[0]) {
        var tipDiv = $('<div>');
        tipDiv.attr('id', 'measureTipDiv');
        tipDiv.css({
            'font-size': '13px',
            'background-color': '#fff',
            'border': '1px solid rgb(86, 156, 241)',
            'padding': '2px',
            'white-space': 'nowrap',
            'font-family': 'Arial',
            'position': 'absolute',
            'z-index': '2000',
            'left': event.xy.x + '24px',
            'top': event.xy.y - '16px'
        });
        tipDiv.html('左键单击确定起点');
        $('#map').children(".smMapViewport").append(tipDiv);
    } else {
        $("#measureTipDiv").css({
            display: 'block',
            left: event.xy.x + 24,
            top: event.xy.y - 16
        });
        $("#measureTipDiv").html('左键单击确定起点');
    }
}
//提示“左键单击增加点，双击结束”
function tipMeasureCircle(event) {
    if (!$("#measureTipDiv")[0]) {
        var tipDiv = $('<div>');
        tipDiv.attr('id', 'measureTipDiv');
        tipDiv.css({
            'font-size': '13px',
            'background-color': '#fff',
            'border': '1px solid rgb(86, 156, 241)',
            'padding': '2px',
            'white-space': 'nowrap',
            'font-family': 'Arial',
            'position': 'absolute',
            'z-index': '2000',
            'left': event.xy.x + '24px',
            'top': event.xy.y - '16px'
        });
        tipDiv.html('左键按下确定圆中心点并移动鼠标');
        $('#map').children(".smMapViewport").append(tipDiv);
    } else {
        $("#measureTipDiv").css({
            display: 'block',
            left: event.xy.x + 24,
            top: event.xy.y - 16
        });
        $("#measureTipDiv").html('左键按下确定圆中心点并移动鼠标');

    }
}

//定义 handleMeasurements 函数，触发 measure 事件会调用此函数
//事件参数 event 包含了测量要素 geometry 信息
function handleDistanceMeasure(event) {

    measureDistanceIndex = measureDistanceCounts++;

    //获取传入参数 event 的 geometry 信息
    var geometry = event.geometry;
    var endMeasurePoint = new SuperMap.Geometry.Point(geometry.components[geometry.components.length - 1].x, geometry.components[geometry.components.length - 1].y);
    var endPointGeo = geometry.components[geometry.components.length - 1];
    //添加终点
    var endPointFeature = new SuperMap.Feature.Vector(endMeasurePoint, null, stylePoint);
    //将添加的点要素的id保存起来，用于后面的清除
    featuresDistanceId.push(endPointFeature.id);
    measureVL.addFeatures(endPointFeature);
    //添加量算的线
    var lineFeature = new SuperMap.Feature.Vector(geometry, null, styleLine);
    //将添加的线要素的id保存起来，用于后面的清除
    featuresDistanceId.push(lineFeature.id);
    measureVL.addFeatures(lineFeature);
    measureMapDistance.put(measureDistanceIndex, featuresDistanceId);
    var startDiv = "<div style='user-select:none;position: absolute; z-index: 2100; border: 1px solid rgb(86, 156, 241); background-color: rgb(255, 255, 255); white-space: nowrap; font-size: 13px; padding: 2px; font-family: Arial;'>" +
        "<span style='margin: 0px 4px; float: left;'>" +
        "总长：<strong>" + event.measure.toFixed(4) + "</strong>" + " " + event.units + "</span>" +
        "<img id=measureResultClose_" + measureDistanceIndex + " hspace='0' src='./images/measureDis_p_close.png' style='width: 14px; height: 14px; cursor: pointer; position: relative; margin: 2px 2px -2px; display: inline-block;' onclick='clearMeasureDistanceResult(event);'>" +
        "</div>";
    if (event.units == "km") {
        distanceMeasureValueArray.kilometer = event.measure.toFixed(4);
        distanceMeasureValueArray.meter = (event.measure * 1000).toFixed(4);
        distanceMeasureValueArray.centimeter = (event.measure * 100000).toFixed(4);
    } else if (event.units == "m") {
        distanceMeasureValueArray.meter = event.measure.toFixed(4);
        distanceMeasureValueArray.kilometer = (event.measure / 1000).toFixed(4);
        distanceMeasureValueArray.centimeter = (event.measure * 100).toFixed(4);
    }



    var popup = new SuperMap.Popup(
        'measureResultPopup',
        new SuperMap.LonLat(endPointGeo.x, endPointGeo.y),
        new SuperMap.Size(150, 24),
        startDiv,
        false
    );
    popup.backgroundColor = 'none';
    map.addPopup(popup);
    popups.push(popup);
    popupDistanceMap.put(measureDistanceIndex, popups);
    if ($("#measureTipDiv")) {
        $("#measureTipDiv").remove();
    }
    //注销控件
    // measureDistanceControl.deactivate();
    //移除鼠标样式
    $("#map").removeClass('sm_measure');

    //每次量算时清空上次结果
    featuresDistanceId = [];
    popups = []
}

//定义 handleMeasurements 函数，触发 measure 事件会调用此函数
//事件参数 event 包含了测量要素 geometry 信息
function handleMeasureCircle(event) {
    //每次量算时清空上次结果
    featuresCircleId = [];
    popups = []
    measureCircleIndex = measureCircleCounts++;

    //获取传入参数 event 的 geometry 信息
    var geometry = event.geometry;
    var endMeasurePoint = new SuperMap.Geometry.Point(geometry.components[0].components[geometry.components[0].components.length - 1].x, geometry.components[0].components[geometry.components[0].components.length - 1].y);

    var endPointGeo = geometry.components[0].components[geometry.components[0].components.length - 2];
    //yaocs
    var measureCircle = new SuperMap.Geometry.Polygon(geometry.components[0].components);
    var mousePositionGeo = geometry.components[0].components[geometry.components[0].components.length - 1];
    var mousePositionPix = map.getPixelFromLonLat(new SuperMap.LonLat(mousePositionGeo.x, mousePositionGeo.y));

    //添加量算的面  yaocs
    var CircleFeature = new SuperMap.Feature.Vector(geometry, null, styleCircle);
    //将添加的线要素的id保存起来，用于后面的清除
    featuresCircleId.push(CircleFeature.id);
    measureVL.addFeatures(CircleFeature); //画完后添加在地图中的多边形 yaocs
    measureMapCircle.put(measureCircleIndex, featuresCircleId);


    var startDiv = "<div style='user-select:none;position: absolute; z-index: 2100; border: 1px solid rgb(86, 156, 241); background-color: rgb(255, 255, 255); white-space: nowrap; font-size: 13px; padding: 2px; font-family: Arial;'>" +
        "<span style='margin: 0px 4px; float: left;'>" +
        "总面积：<strong>" + event.measure.toFixed(2) + "</strong>" + " " + event.units + "<sup>2</sup></span>" +
        "<img id=measureResultClose_" + measureCircleIndex + " hspace='0' src='./images/measureDis_p_close.png' style='width: 14px; height: 14px; cursor: pointer; position: relative; margin: 2px 2px -2px; display: inline-block;' onclick='clearMeasureCircleResult(event);'>" +
        "</div>";

    if (event.units == "km") {
        // console.log(geometry.getGeodesicLength());
        // var r = Math.sqrt(event.measure/Math.PI);
        // var C = 2*Math.PI*r;
        var C = geometry.getGeodesicLength(); //这样就不要自己计算了。
        // 周长
        circleMeasureValueArray.kilometer = (C / 1000).toFixed(4);
        circleMeasureValueArray.meter = C.toFixed(4);
        circleMeasureValueArray.centimeter = (C * 100).toFixed(4);
        //面积
        circleMeasureValueArray.squarekilometer = event.measure.toFixed(4);
        circleMeasureValueArray.squaremeter = (event.measure * 1000000).toFixed(4);
        circleMeasureValueArray.squarecentimeter = (event.measure * 10000000000).toFixed(4);

    } else if (event.units == "m") {
        // var r = Math.sqrt(event.measure/Math.PI);
        // var C = 2*Math.PI*r;
        var C = geometry.getGeodesicLength();
        // 周长
        circleMeasureValueArray.kilometer = (C / 1000).toFixed(3);
        circleMeasureValueArray.meter = C.toFixed(4);
        circleMeasureValueArray.centimeter = (C * 100).toFixed(3);
        //面积
        circleMeasureValueArray.squarekilometer = (event.measure / 1000000).toFixed(3);
        circleMeasureValueArray.squaremeter = (event.measure).toFixed(3);
        circleMeasureValueArray.squarecentimeter = (event.measure * 10000).toFixed(3);
    }

    var popup = new SuperMap.Popup(
        'measureResultPopup',
        new SuperMap.LonLat(endPointGeo.x, endPointGeo.y),
        new SuperMap.Size(230, 24),
        startDiv,
        false
    );
    popup.backgroundColor = 'none';
    map.addPopup(popup);
    popups.push(popup);
    popupCircleMap.put(measureCircleIndex, popups);

    if ($("#measureTipDiv")) {
        $("#measureTipDiv").remove();
    }
    //注销控件
    // measureCircleControl.deactivate();
    //移除鼠标样式
    $("#map").removeClass('sm_measure');
}


//定义 handleMeasurements 函数，触发 measure 事件会调用此函数
//事件参数 event 包含了测量要素 geometry 信息
function handleMeasureArea(event) {

    measureAreaIndex = measureAreaCounts++;
    //获取传入参数 event 的 geometry 信息
    var geometry = event.geometry;
    var endMeasurePoint = new SuperMap.Geometry.Point(geometry.components[0].components[geometry.components[0].components.length - 1].x, geometry.components[0].components[geometry.components[0].components.length - 1].y);

    var endPointGeo = geometry.components[0].components[geometry.components[0].components.length - 2];
    var measureArea = new SuperMap.Geometry.Polygon(geometry.components[0].components);
    var mousePositionGeo = geometry.components[0].components[geometry.components[0].components.length - 1];
    var mousePositionPix = map.getPixelFromLonLat(new SuperMap.LonLat(mousePositionGeo.x, mousePositionGeo.y));

    //添加量算的面
    var areaFeature = new SuperMap.Feature.Vector(geometry, null, styleArea);
    //将添加的线要素的id保存起来，用于后面的清除
    featuresAreaId.push(areaFeature.id);
    measureVL.addFeatures(areaFeature); //画完后添加在地图中的多边形 
    measureMapArea.put(measureAreaIndex, featuresAreaId);



    var startDiv = "<div style='user-select:none;position: absolute; z-index: 2100; border: 1px solid rgb(86, 156, 241); background-color: rgb(255, 255, 255); white-space: nowrap; font-size: 13px; padding: 2px; font-family: Arial;'>" +
        "<span style='margin: 0px 4px; float: left;'>" +
        "总面积：<strong>" + event.measure.toFixed(2) + "</strong>" + " " + event.units + "<sup>2</sup></span>" +
        "<img id=measureResultClose_" + measureAreaIndex + " hspace='0' src='./images/measureDis_p_close.png' style='width: 14px; height: 14px; cursor: pointer; position: relative; margin: 2px 2px -2px; display: inline-block;' onclick='clearMeasureAreaResult(event);'>" +
        "</div>";

    if (event.units == "km") {
        var lengthUnitMeter = geometry.getGeodesicLength();
        var r = Math.sqrt(event.measure / Math.PI);
        var C = 2 * Math.PI * r;
        // 周长
        areaMeasureValueArray.kilometer = (lengthUnitMeter / 1000).toFixed(4);
        areaMeasureValueArray.meter = lengthUnitMeter;
        areaMeasureValueArray.centimeter = (lengthUnitMeter * 100).toFixed(4);
        //面积
        areaMeasureValueArray.squarekilometer = event.measure.toFixed(4);
        areaMeasureValueArray.squaremeter = (event.measure * 1000000).toFixed(4);
        areaMeasureValueArray.squarecentimeter = (event.measure * 10000000000).toFixed(4);

    } else if (event.units == "m") {
        var r = Math.sqrt(event.measure / Math.PI);
        var C = 2 * Math.PI * r;
        // 周长
        areaMeasureValueArray.kiometer = (C / 1000).toFixed(4);
        areaMeasureValueArray.meter = C.toFixed(4);
        areaMeasureValueArray.centimeter = (C * 100).toFixed(4);
        $(".tool_measure .content ul li").eq(2).find(".getKm").text(areaMeasureValueArray.meter);
        //面积
        areaMeasureValueArray.squarekilometer = (event.measure / 1000000).toFixed(4);
        areaMeasureValueArray.squaremeter = (event.measure).toFixed(4);
        areaMeasureValueArray.squarecentimeter = (event.measure * 10000).toFixed(4);
    }

    var popup = new SuperMap.Popup(
        'measureResultPopup',
        new SuperMap.LonLat(endPointGeo.x, endPointGeo.y),
        new SuperMap.Size(230, 24),
        startDiv,
        false
    );
    popup.backgroundColor = 'none';
    map.addPopup(popup);
    popups.push(popup);
    popupAreaMap.put(measureAreaIndex, popups);

    if ($("#measureTipDiv")) {
        $("#measureTipDiv").remove();
    }
    //注销控件
    // measureAreaControl.deactivate();
    //移除鼠标样式
    $("#map").removeClass('sm_measure');

    //每次量算结束后清空上次结果
    featuresAreaId = [];
    popups = []
}


//定义 handleMeasurements 函数，触发 measurepartial 事件会调用此函数
//事件参数 event 包含了测量要素 geometry 信息
var preGeoLen = 0;

function handleDistanceMeasurepartial(event) {

    //移除鼠标监听移动事件
    // map.events.un({
    //     "mousemove": tipMeasure
    // });
    //获取传入参数 event 的 geometry 信息
    var geometry = event.geometry;
    var measurePoint = new SuperMap.Geometry.Point(geometry.components[geometry.components.length - 1].x, geometry.components[geometry.components.length - 1].y);
    //获取实时量算结果
    var mousePositionGeo = geometry.components[geometry.components.length - 1];
    var mousePositionPix = map.getPixelFromLonLat(new SuperMap.LonLat(mousePositionGeo.x, mousePositionGeo.y));
    if (!$("#measureTipDiv")[0]) {
        var tipDiv = $('<div>');
        tipDiv.attr('id', 'measureTipDiv');
        tipDiv.css({
            'font-size': '13px',
            'background-color': '#FFFFFF',
            'border': '1px solid rgb(86, 156, 241)',
            'padding': '2px',
            'white-space': 'nowrap',
            'font-family': 'Arial',
            'position': 'absolute',
            'z-index': '2000',
            'left': mousePositionPix.x + '24px',
            'top': mousePositionPix.y - '10px'
        });
        $("#measureTipDiv").html('总长: <strong>' + event.measure.toFixed(2) + '</strong>' + ' ' + event.units + '<br>左键单击增加点，双击结束');
        $('#map').children(".smMapViewport").append(tipDiv);
    } else {
        $("#measureTipDiv").css({
            display: 'block',
            left: mousePositionPix.x + 24,
            top: mousePositionPix.y - 20
        });
    }
    $("#measureTipDiv").html('总长: <strong>' + event.measure.toFixed(2) + '</strong>' + ' ' + event.units + '<br>左键单击增加点，双击结束');
    //获取一段量算结果
    if (geometry.components[0].x == geometry.components[1].x && geometry.components[0].y == geometry.components[1].y) {
        //添加起点
        measureFeature = new SuperMap.Feature.Vector(measurePoint, null, stylePoint);
        //将添加的点要素的id保存起来，用于后面的清除
        featuresDistanceId.push(measureFeature.id);
        measureVL.addFeatures(measureFeature);
        var startDiv = "<div style='user-select:none;position: absolute;font-size: 12px; font-family: Arial; white-space: nowrap; height: 17px; background-image: url(./images/measureDis_box_bg.gif);'>" +
            "<div style='position: relative; display: inline; height: 17px; line-height: 140%; padding: 0px 2px; white-space: nowrap;'>起点</div>" +
            "<div style='position: absolute; top: 0px; left: -2px; background-image: url(./images/measureDis_box_l.gif); width: 2px; height: 17px;'></div>" +
            "<div style='position: absolute; top: 0px; right: -2px; background-image: url(./images/measureDis_box_r.gif); width: 2px; height: 17px;'></div>" +
            "</div>";
        var popup = new SuperMap.Popup(
            'measureResultPopup',
            new SuperMap.LonLat(geometry.components[0].x, geometry.components[0].y),
            new SuperMap.Size(30, 18),
            startDiv,
            false
        );
        popup.backgroundColor = 'none';
        map.addPopup(popup);
        popups.push(popup);
    }
    if (preGeoLen > 1 && preGeoLen < geometry.components.length) {
        //添加量算过程中的点
        measureFeature = new SuperMap.Feature.Vector(measurePoint, null, stylePoint);
        //将添加的点要素的id保存起来，用于后面的清除
        featuresDistanceId.push(measureFeature.id);
        measureVL.addFeatures(measureFeature);
        //使用Popup显示量算结果
        var resultDiv = "<div style='position: absolute; z-index: 300; font-size: 12px; font-family: Arial; white-space: nowrap; height: 17px; background-image: url(./images/measureDis_box_bg.gif);'>" +
            "<div style='position: relative; display: inline; height: 17px; line-height: 140%; padding: 0px 2px; white-space: nowrap;'><strong>" +
            event.measure.toFixed(2) + "</strong>" + " " + event.units +
            "</div>" +
            "<div style='position: absolute; top: 0px; left: -2px; background-image: url(./images/measureDis_box_l.gif); width: 2px; height: 17px;'></div>" +
            "<div style='position: absolute; top: 0px; right: -2px; background-image: url(./images/measureDis_box_r.gif); width: 2px; height: 17px;'></div>" +
            "</div>";
        var popup = new SuperMap.Popup(
            'measureResultPopup',
            new SuperMap.LonLat(mousePositionGeo.x, mousePositionGeo.y),
            new SuperMap.Size(80, 18),
            resultDiv,
            false
        );
        popup.backgroundColor = 'none';
        map.addPopup(popup);
        //将popup保存起来，用于后面清除popup
        popups.push(popup);
    }
    preGeoLen = geometry.components.length;
}

function handleMeasureCirclePartial(event) {

    //移除鼠标监听移动事件
    // map.events.un({
    //     "mousemove": tipMeasureCircle
    // });
    //获取传入参数 event 的 geometry 信息
    var geometry = event.geometry;
    var measureCircle = new SuperMap.Geometry.Polygon(geometry.components);
    //获取实时量算结果
    var mousePositionGeo = geometry.components[0].components[geometry.components[0].components.length - 2]; //显示临时量算结果的DIV 
    var mousePositionPix = map.getPixelFromLonLat(new SuperMap.LonLat(mousePositionGeo.x, mousePositionGeo.y));
    if (!$("#measureTipDiv")[0]) {
        var tipDiv = $('<div>');
        tipDiv.attr('id', 'measureTipDiv');
        tipDiv.css({
            'font-size': '13px',
            'background-color': '#FFFFFF',
            'border': '1px solid rgb(247,85,100)',
            'padding': '2px',
            'white-space': 'nowrap',
            'font-family': 'Arial',
            'position': 'absolute',
            'z-index': '2000',
            'left': mousePositionPix.x + '24px',
            'top': mousePositionPix.y - '10px'
        });
        $("#measureTipDiv").html('总面积: <strong>' + event.measure.toFixed(2) + '</strong>' + ' ' + event.units + '<br>左键单击增加点，双击结束');
        $('#map').children(".smMapViewport").append(tipDiv);
    } else {
        $("#measureTipDiv").css({
            display: 'block',
            left: mousePositionPix.x + 24,
            top: mousePositionPix.y - 20
        });
    }
    $("#measureTipDiv").html('总面积: <strong>' + event.measure.toFixed(2) + '</strong>' + ' ' + event.units + '<sup>2</sup><br>左键单击增加点，双击结束');
    if (preGeoLen > 1 && preGeoLen < geometry.components.area) {
        //添加量算过程中的点
        measureFeature = new SuperMap.Feature.Vector(measurePoint, null, stylePoint);
        //将添加的点要素的id保存起来，用于后面的清除
        featuresCircleId.push(measureFeature.id);
        measureVL.addFeatures(measureFeature);
        popup.backgroundColor = 'none';
        map.addPopup(popup);
        //将popup保存起来，用于后面清除popup
        popups.push(popup);
    }
    preGeoLen = geometry.components.area; // length;
}


function handleMeasureAreaPartial(event) {

    //移除鼠标监听移动事件
    // map.events.un({
    //     "mousemove": tipMeasure
    // });
    //获取传入参数 event 的 geometry 信息
    var geometry = event.geometry;
    var measureArea = new SuperMap.Geometry.Polygon(geometry.components);

    //获取实时量算结果
    var mousePositionGeo = geometry.components[0].components[geometry.components[0].components.length - 2]; //显示临时量算结果的DIV 
    var mousePositionPix = map.getPixelFromLonLat(new SuperMap.LonLat(mousePositionGeo.x, mousePositionGeo.y));

    if (!$("#measureTipDiv")[0]) {
        var tipDiv = $('<div>');
        tipDiv.attr('id', 'measureTipDiv');
        tipDiv.css({
            'font-size': '13px',
            'background-color': '#FFFFFF',
            'border': '1px solid rgb(247,85,100)',
            'padding': '2px',
            'white-space': 'nowrap',
            'font-family': 'Arial',
            'position': 'absolute',
            'z-index': '2000',
            'left': mousePositionPix.x + '24px',
            'top': mousePositionPix.y - '10px'
        });
        $("#measureTipDiv").html('总面积: <strong>' + event.measure.toFixed(2) + '</strong>' + ' ' + event.units + '<br>左键单击增加点，双击结束');
        $('#map').children(".smMapViewport").append(tipDiv);
    } else {
        $("#measureTipDiv").css({
            display: 'block',
            left: mousePositionPix.x + 24,
            top: mousePositionPix.y - 20
        });
    }
    $("#measureTipDiv").html('总面积: <strong>' + event.measure.toFixed(2) + '</strong>' + ' ' + event.units + '<sup>2</sup><br>左键单击增加点，双击结束');
    if (preGeoLen > 1 && preGeoLen < geometry.components.area) {
        //添加量算过程中的点
        measureFeature = new SuperMap.Feature.Vector(measurePoint, null, stylePoint);
        //将添加的点要素的id保存起来，用于后面的清除
        featuresAreaId.push(measureFeature.id);
        measureVL.addFeatures(measureFeature);
        popup.backgroundColor = 'none';
        map.addPopup(popup);
        //将popup保存起来，用于后面清除popup
        popups.push(popup);
    }
    preGeoLen = geometry.components.area; // length; 
}





//清除量算结果
function clearMeasureDistanceResult(event) {
    //获取要清除的是哪次量算结果
    var clearIndex = event.target.id.substring(19);
    console.log(event)
    //根据feature的id获取该次量算绘制的点和线
    var measurefeatures = [];
    for (var i = 0; i < measureMapDistance.get(clearIndex).length; i++) {
        measurefeatures.push(measureVL.getFeatureById(measureMapDistance.get(clearIndex)[i]));
    }

    measureVL.removeFeatures(measurefeatures);
    //清除该次量算添加的popup
    for (var i = 0; i < popupDistanceMap.get(clearIndex).length; i++) {
        map.removePopup(popupDistanceMap.get(clearIndex)[i]);
    }
}
//清除量算结果
function clearMeasureCircleResult(event) {
    //获取要清除的是哪次量算结果
    var clearIndex = event.target.id.substring(19);
    //根据feature的id获取该次量算绘制的点和线
    var measurefeatures = [];
    for (var i = 0; i < measureMapCircle.get(clearIndex).length; i++) {
        measurefeatures.push(measureVL.getFeatureById(measureMapCircle.get(clearIndex)[i]));
    }
    measureVL.removeFeatures(measurefeatures);
    //清除该次量算添加的popup
    for (var i = 0; i < popupCircleMap.get(clearIndex).length; i++) {
        map.removePopup(popupCircleMap.get(clearIndex)[i]);
    }
}
//清除量算结果
function clearMeasureAreaResult(event) {
    //获取要清除的是哪次量算结果
    var clearIndex = event.target.id.substring(19);
    //根据feature的id获取该次量算绘制的点和线
    var measurefeatures = [];
    for (var i = 0; i < measureMapArea.get(clearIndex).length; i++) {
        measurefeatures.push(measureVL.getFeatureById(measureMapArea.get(clearIndex)[i]));
    }
    measureVL.removeFeatures(measurefeatures);
    //清除该次量算添加的popup
    for (var i = 0; i < popupAreaMap.get(clearIndex).length; i++) {
        map.removePopup(popupAreaMap.get(clearIndex)[i]);
    }
}








/* 清除全部结果 */
function clearAllMeasureCircleResult() {
    for (var k = 0; k < measureCircleCounts; k++) {
        var measurefeatures = [];
        for (var i = 0; i < measureMapCircle.get(k).length; i++) {
            if (measureVL.getFeatureById(measureMapCircle.get(k)[i])) {
                measurefeatures.push(measureVL.getFeatureById(measureMapCircle.get(k)[i]));
            }
        }
        for (var i = 0; i < popupCircleMap.get(k).length; i++) {
            map.removePopup(popupCircleMap.get(k)[i]);
        }
        measureVL.removeFeatures(measurefeatures);
    }
    measureCircleCounts = 0;
}

function clearAllMeasureDistanceResult() {
    for (var k = 0; k < measureDistanceCounts; k++) {
        var measurefeatures = [];
        for (var i = 0; i < measureMapDistance.get(k).length; i++) {
            if (measureVL.getFeatureById(measureMapDistance.get(k)[i])) {
                measurefeatures.push(measureVL.getFeatureById(measureMapDistance.get(k)[i]));
            }
        }
        for (var i = 0; i < popupDistanceMap.get(k).length; i++) {
            map.removePopup(popupDistanceMap.get(k)[i]);
        }
        measureVL.removeFeatures(measurefeatures);
    }
    measureDistanceCounts = 0;
}

function clearAllMeasureAreaResult() {
    for (var k = 0; k < measureAreaCounts; k++) {
        var measurefeatures = [];
        for (var i = 0; i < measureMapArea.get(k).length; i++) {
            if (measureVL.getFeatureById(measureMapArea.get(k)[i])) {
                measurefeatures.push(measureVL.getFeatureById(measureMapArea.get(k)[i]));
            }
        }
        for (var i = 0; i < popupAreaMap.get(k).length; i++) {
            map.removePopup(popupAreaMap.get(k)[i]);
        }
        measureVL.removeFeatures(measurefeatures);
    }
    measureAreaCounts = 0;
}