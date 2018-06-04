function init() {
    /* 自定义鼠标右键（判断是否支持） */
    var broz = SuperMap.Util.getBrowser();
    if (broz.device === 'android' || broz.device === 'apple') {
        alert('您的设备不支持，请使用pc或其他设备');
        return;
    }
    vectorLayer = new SuperMap.Layer.Vector("Vector Layer");
    measureVL = new SuperMap.Layer.Vector("measureVectorlayer"); //量算图层
    markerLayer = new SuperMap.Layer.Markers("Markers");
    drawPoint = new SuperMap.Control.DrawFeature(vectorLayer, SuperMap.Handler.Point);
    drawPoint.events.on({
        "featureadded": drawCompleted
    });
    map = new SuperMap.Map("map", {
        controls: [
            new SuperMap.Control.ScaleLine(),
            new SuperMap.Control.Navigation({
                dragPanOptions: {
                    enableKinetic: true
                }
            }), drawPoint
        ],
        allOverlays: true,
        //监听，隐藏右键菜单
        eventListeners: {
            "movestart": function () {
                $("#rKey").css("visibility", "hidden");
            },
            "click": function () {
                $("#rKey").css("visibility", "hidden");
            }
        }
    });
    attribution = new SuperMap.Control.Attribution();
    layerVec = new SuperMap.Layer.TiledDynamicRESTLayer("天地图矢量", urlVec, {
        transparent: true,
        cacheEnabled: true
    }, {
        resolutions: restLayerResolutions
    });
    layerCva = new SuperMap.Layer.TiledDynamicRESTLayer("天地图矢量注记", urlCva, {
        transparent: true,
        cacheEnabled: true
    }, {
        resolutions: restLayerResolutions
    });
    layerCia = new SuperMap.Layer.TiledDynamicRESTLayer("天地图影像注记", urlCia, {
        transparent: true,
        cacheEnabled: true
    }, {
        resolutions: restLayerResolutions
    });
    layerImg = new SuperMap.Layer.TiledDynamicRESTLayer("天地图影像", urlImg, {
        transparent: true,
        cacheEnabled: true
    }, {
        resolutions: restLayerResolutions
    });
    layerVec.events.on({
        "layerInitialized": addLayerVec
    });
    map.events.register("mousedown");
}


function addLayerVec() {
    map.addLayers([layer1, layer2, layer3, layer4, assistLayer20, layerVec, layerCva]);
    layerImg.events.on({
        "layerInitialized": addLayer
    });
}

//添加图层函数
function addLayer() {
    map.addLayers([layerImg, layerCia, vectorLayer, markerLayer, measureVL]);
    layerImg.setVisibility(false);
    map.setCenter(new SuperMap.LonLat(112.977818, 28.116027), 10);
    /* 初始化获取地图级别 */
    getZoomNum();
    /* 当地图级别变化时 */
    map.events.register("zoomend", null, getZoomNum);
    /* 点击地图 */
    map.events.register("click", null, mapClick);
}



function mapClick() {
    $(".menuPane").fadeOut(); //菜单块消失
}

//获取地图级别以及切换底图
function getZoomNum() {
    var startExtent = map.getZoom() + 1,
        zoom = map.getZoom();
    $("#mapNum").text(startExtent);
    /* 底图控制 */
    if (!isRollingScreenOpen) { //卷帘关闭
        map.setLayerIndex(layerVec, 5);
        map.setLayerIndex(layerCva, 6);
        map.setLayerIndex(layerImg, 7);
        map.setLayerIndex(layerCia, 8);
        if (curType == "vec") { //当底图为矢量时候
            layer1.setVisibility(1);
            layer2.setVisibility(1);
            layer3.setVisibility(0);
            layer4.setVisibility(0);
            layerImg.setVisibility(0);
            layerCia.setVisibility(0);
            if (zoom <= 6) {
                layerVec.setVisibility(0);
                layerCva.setVisibility(0);
            } else {
                layer1.setVisibility(0);
                layer2.setVisibility(0);
                layerVec.setVisibility(1);
                layerCva.setVisibility(1);
            }
        } else { //当底图不是矢量的时候
            layer1.setVisibility(0);
            layer2.setVisibility(0);
            layer3.setVisibility(1);
            layer4.setVisibility(1);
            layerVec.setVisibility(0);
            layerCva.setVisibility(0);
            if (zoom <= 6) {
                layerImg.setVisibility(0);
                layerCia.setVisibility(0);
            } else {
                layer3.setVisibility(0);
                layer4.setVisibility(0);
                layerImg.setVisibility(1);
                layerCia.setVisibility(1);
            }
        }
    } else { //卷帘开启
        if (zoom <= 6) {
            layer1.setVisibility(1);
            layer2.setVisibility(1);
            layer3.setVisibility(1);
            layer4.setVisibility(1);
            if (zoom >= 5 && zoom <= 6) {
                layerVec.setVisibility(1);
                layerCva.setVisibility(1);
                layerImg.setVisibility(1);
                layerCia.setVisibility(1);
            } else {
                layerVec.setVisibility(0);
                layerCva.setVisibility(0);
                layerImg.setVisibility(0);
                layerCia.setVisibility(0);
            }
        } else {
            layer1.setVisibility(0);
            layer2.setVisibility(0);
            layer3.setVisibility(0);
            layer4.setVisibility(0);
            layerVec.setVisibility(1);
            layerCva.setVisibility(1);
            layerImg.setVisibility(1);
            layerCia.setVisibility(1);
        }
    }
}

/* 鼠标右键 */
//创建EventUtil对象
var EventUtil = {
    addHandler: function (element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + type, handler);
        }
    },
    getEvent: function (event) {
        return event ? event : window.event;
    },
    //取消事件的默认行为
    preventDefault: function (event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },
    stopPropagation: function (event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    }
};
EventUtil.addHandler(window, "load", function (event) {
    var mapDiv = document.getElementById("map");
    EventUtil.addHandler(mapDiv, "contextmenu", function (event) {
        event = EventUtil.getEvent(event);
        EventUtil.preventDefault(event);
        var left = event.clientX + "px";
        var top = event.clientY + "px";
        $("#rKey").css("left", left);
        $("#rKey").css("top", top);
        $("#rKey").css("visibility", "visible");
    });
    EventUtil.addHandler(rKey, "contextmenu", function (event) {
        event = EventUtil.getEvent(event);
        EventUtil.preventDefault(event);
        $("#rKey").css("visibility", "visible");
    });
});