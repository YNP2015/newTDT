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
    dragCircleLayer.removeAllFeatures();
    startChooise = -1, endChooise = -1;
    start.onclick = function () { //恢复起点被再次点击的功能
        chooseStart("start");
    }
    Pend.onclick = function () { //恢复终点被再次点击的功能
        chooseStart("end");
    }
    clearAllMeasureAreaResult();
    clearAllMeasureDistanceResult();
    clearAllMeasureCircleResult();
    $(".poiSearch").val("");
    $(".startP").val("");
    $(".endP").val("");
    $("#dragButton").hide();
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
    isSkyPanoQuery = false;
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


/* 查看卷帘按钮点击特效 */
function showRollingScreen() {
    if (!isRollingScreenOpen) {
        isRollingScreenOpen = true;
        $(".toolsBar .juanlian").addClass("juanlianed");
        $(".toolsBar .juanlian .tip").text("关闭卷帘");
        $("#handle").css("display", "block");
        if (curType == "vec") { //如果当前图层是矢量，则需要把矢量图层放在影像图层的上面
            map.setLayerIndex(layerGJVec, 2);
            map.setLayerIndex(layerGJCva, 3);
            map.setLayerIndex(layerGJImg, 0);
            map.setLayerIndex(layerGJCia, 1);
            map.setLayerIndex(layerVec, 6);
            map.setLayerIndex(layerCva, 7);
            map.setLayerIndex(layerImg, 4);
            map.setLayerIndex(layerCia, 5);
        } else if (curType == "img") { //如果当前图层是影像，则需要把影像图层放在矢量图层的上面
            map.setLayerIndex(layerGJVec, 0);
            map.setLayerIndex(layerGJCva, 1);
            map.setLayerIndex(layerGJImg, 2);
            map.setLayerIndex(layerGJCia, 3);
            map.setLayerIndex(layerVec, 4);
            map.setLayerIndex(layerCva, 5);
            map.setLayerIndex(layerImg, 6);
            map.setLayerIndex(layerCia, 7);
        }
        //将所有的影像图层和矢量图层显示出来
        layerGJVec.setVisibility(1);
        layerGJCva.setVisibility(1);
        layerGJImg.setVisibility(1);
        layerGJCia.setVisibility(1);

        var mapwidth = map.size.w;
        var mapheight = map.size.h;
        var handle = document.getElementById("handle");
        //初始化卷帘的位置
        handle.style.left = mapwidth * 0.5 + "px";
        //handle.style.top=mapheight*0.5+"px";
        clip(mapwidth * 0.5);
        handleLeft = mapwidth * 0.5;
    } else {
        isRollingScreenOpen = false;
        $(".toolsBar .juanlian").removeClass("juanlianed");
        $(".toolsBar .juanlian .tip").text("查看卷帘");
        $("#handle").css("display", "none");
        //相当于卷帘拖动到最左边
        if (curType == "vec") {
            layerGJVec.div.style.clip = "";
            layerGJCva.div.style.clip = "";
            layerVec.div.style.clip = "";
            layerCva.div.style.clip = "";

            //隐藏掉影像图和影像标签图
            layerGJImg.setVisibility(false);
            layerGJCia.setVisibility(false);
            layerImg.setVisibility(false);
            layerCia.setVisibility(false);

        } else if (curType == "img") {
            layerGJImg.div.style.clip = "";
            layerGJCia.div.style.clip = "";
            layerImg.div.style.clip = "";
            layerCia.div.style.clip = "";

            //隐藏掉矢量图和矢量标签图
            layerGJVec.setVisibility(false);
            layerGJCva.setVisibility(false);
            layerVec.setVisibility(false);
            layerCva.setVisibility(false);
        }
    }
}

function clip(left) {
    var mapTop = "0px",
        mapRight = left + "px",
        mapButtom = map.size.h + "px",
        mapLeft = "0px",
        rect = "rect(" + mapTop + "," + mapRight + "," + mapButtom + "," + mapLeft + ")";
    map.layers[2].div.style.clip = rect;
    map.layers[3].div.style.clip = rect;
    if (curType == "vec") {
        layerVec.div.style.clip = rect;
        layerCva.div.style.clip = rect;
    } else if (curType == "img") {
        layerImg.div.style.clip = rect;
        layerCia.div.style.clip = rect;
    }
}

//拖动卷帘
function drag(e) {
    var objectDiv = document.getElementById("handle");
    //取消事件的默认行为
    e.preventDefault();
    if (document.all) { //鼠标捕获
        objectDiv.setCapture();
    }
    b = e.clientX - parseInt(objectDiv.style.left);
    handleLeft = b;
    //鼠标拖动
    document.onmousemove = function (d) {
        if (!d) d = event;
        c = (d.clientX - b);
        //使卷帘在地图内
        if (c > map.size.w - 7) {
            c = map.size.w - 7;
        }
        if (c < 0) {
            c = 0;
        }
        if (objectDiv) {
            objectDiv.style.left = c + "px";
            handleLeft = c;
            clip(c);
        }

    };
    //拖动完成后
    document.onmouseup = function () {
        if (document.all) {
            //释放鼠标捕获
            objectDiv.releaseCapture();
        }
        objectDiv = null;
    };
}



/* 空地一体 */
function showSkyPano() {
        currentPage = 0;
    startRecord = 0;
    isSkyPanoQuery = true;
    var queryParam, queryParams, queryService;
    queryParam = new SuperMap.REST.FilterParameter({
        name: skyPanoDatasetAtDatasource,
        attributeFilter: "SMID > -1"
    });
    queryParams = new SuperMap.REST.QueryBySQLParameters({
        queryParams: [queryParam]
    });
    queryService = new SuperMap.REST.QueryBySQLService(skyPanoUrl, {
        eventListeners: {
            "processCompleted": processCompletedPOI,
            "processFailed": processFailedPOI
        }
    });

    queryService.processAsync(queryParams);
}