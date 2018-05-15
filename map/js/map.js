function init() {
    /* 自定义鼠标右键（判断是否支持） */
    var broz = SuperMap.Util.getBrowser();
    if (broz.device === 'android' || broz.device === 'apple') {
        alert('您的设备不支持，请使用pc或其他设备');
        return;
    }
    vectorLayer = new SuperMap.Layer.Vector("Vector Layer");
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
        maxResolution: 0.010986328125, //天地图湖南规则第一级
        minResolution: 0.0000107288360595703125,
        numZoomLevels: 11,
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
    map.addLayers([layerVec]);
    layerImg.events.on({
        "layerInitialized": addLayer
    });
}

//添加图层函数
function addLayer() {
    map.addLayers([layerImg, layerCva, vectorLayer, markerLayer]);
    layerImg.setVisibility(false);
    map.setCenter(new SuperMap.LonLat(112.977818, 28.116027), 3);
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

//获取地图级别
function getZoomNum() {
    var startExtent = map.getZoom() + 8;
    $("#mapNum").text(startExtent);
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