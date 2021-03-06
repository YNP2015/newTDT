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
    signMarkerLayer = new SuperMap.Layer.Markers("书签标记图层");
    drawPoint = new SuperMap.Control.DrawFeature(vectorLayer, SuperMap.Handler.Point);
    drawPoint.events.on({
        "featureadded": drawCompleted
    });
    map = new SuperMap.Map("map", {
        controls: [
            new SuperMap.Control.ScaleLine(),
			new SuperMap.Control.MousePosition({
                numDigits: 2,
                prefix: "经度:",
                separator: "&nbsp&nbsp&nbsp&nbsp纬度:"
            }),
            //new SuperMap.Control.LayerSwitcher(),  //图层控制器
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
    //getMultidateUrls(); // 关于多时相初始化相关信息获取，该方法在文件 timeLayers.js  中
}


function addLayerVec() {
    map.addLayers([layerGJVec, layerGJCva]);
    layerImg.events.on({
        "layerInitialized": addLayer
    });
}

//添加图层函数
function addLayer() {
    map.addLayers([layerGJImg, layerGJCia, layerVec, layerCva, layerImg, layerCia, markerLayer, measureVL, dragCircleLayer, vectorLayer]);
    map.setCenter(new SuperMap.LonLat(112.977818, 28.116027), 10);
    /* 关闭所有多时相图层 */
    layerGJImg.setVisibility(0);
    layerGJCia.setVisibility(0);
    layerVec.setVisibility(0);
    layerCva.setVisibility(0);
    layerImg.setVisibility(0);
    layerCia.setVisibility(0);
    /* 初始化获取地图级别 */
    getZoomNum();
    /* 当地图级别变化时 */
    map.events.register("zoomend", null, getZoomNum);
    /* 点击地图 */
    map.events.register("click", null, mapClick);
    /* 地图移动的时候 */
    map.events.on({
        "move": mapMove
    });
		/* 地址栏分析  */
    function GetQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = encodeURI(window.location.search).substr(1).match(reg);
        if (r != null) {
            return unescape(r[2]);
        } else {
            return null;
        }
    }
    var keyVal = GetQueryString("key");
    var key = decodeURI(keyVal);
    if (key != "null") {
        $(".poiSearch").val(key);
        $('#s-poi').trigger('click');
    } else {
        return;
    }
}



function mapClick() {
    $(".menuPane").fadeOut(); //菜单块消失
    $('.autocompleter-list').html("") //搜索提示框清空
}

//获取地图级别以及切换底图
function getZoomNum() {
    var startExtent = map.getZoom() + 1,
        zoom = map.getZoom();
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


function mapMove() {
    //在拖动地图的过程中，使拖动按钮随着地图移动
    if ($('#dragButton').is(":visible")) {
        var pixcel = map.getPixelFromLonLat(new SuperMap.LonLat(globalx + dis, globaly));
        $("#dragButton").css({
            top: pixcel.y + "px",
            left: (pixcel.x - 13) + "px"
        });
    }
}