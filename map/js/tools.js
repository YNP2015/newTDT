/* 全图 */
function allMap() {
    $(".downtown").fadeOut();
    $(".citySel .county").fadeOut();
    $(".citySel .close").fadeOut();
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
    if (measureMapDistance != 0) clearAllMeasureDistanceResult();
    if (measureMapArea != 0) clearAllMeasureAreaResult();
    if (measureMapCircle != 0) clearAllMeasureCircleResult();
    $(".poiSearch").val("");
    $("#seeInput").val("");
    $(".startP").val("");
    $(".endP").val("");
    $("#dragButton").hide();
}


/* 量算 */
function measuresAll() {
    $(".bookmarkPane").hide();
    if (seeSearchShow) { //根据实际情况调整具体位置
        $(".tool_measure").css("top", "320px");
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
        if(lineMeasureState){
            $(this).removeClass("selT");
        }
        lineMeasure(); //线  该方法在文件measure.js中
    } else if (index == 1) {
        if(polygonMeasureState){
            $(this).removeClass("selT");
        }
        polygonMeasure(); //多边形 该方法在文件measure.js中
    } else if (index == 2) {
        if(circleMeasureState){
            $(this).removeClass("selT");
        }
        circleMeasure(); //圆 该方法在文件measure.js中
    } else { //关闭量算框
        $(".tool_measure").hide();
        $(".tool_measure .top ul li").removeClass("selT");
        $(".tool_measure .content ul li").removeClass("selC");
        $(".tool_measure").css("top", "60px");
        if (seeSearchShow) {
            $(".seeSearch").css("top", "60px");
        }
        //移除鼠标监听移动事件
        map.events.un({
            "mousemove": tipMeasureCircle
        });
        //移除鼠标监听移动事件
        map.events.un({
            "mousemove": tipMeasure
        });
        $("#measureTipDiv").hide();
        //先释放控件,在清除绘画结果,不然会报错
        if (measureDistanceControl) measureDistanceControl.deactivate();
        if (measureAreaControl) measureAreaControl.deactivate();
        if (measureCircleControl) measureCircleControl.deactivate();
        if (measureMapDistance != 0) clearAllMeasureDistanceResult();
        if (measureMapArea != 0) clearAllMeasureAreaResult();
        if (measureMapCircle != 0) clearAllMeasureCircleResult();

        measureShow = false;
    }
});


/* 视野内查询显示和隐藏 */
function showSeeSearch() {
    $(".bookmarkPane").hide();
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
    tenFeatursList = [];
    isSkyPanoQuery = true;
    var queryParam, queryParams, queryService;
    queryParam = new SuperMap.REST.FilterParameter({
        name: skyPanoDatasetAtDatasource,
        attributeFilter: "SMID < 20"
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

/* 标记 */
var size = new SuperMap.Size(25, 25);
var offset = new SuperMap.Pixel(-30, -30);
var icon = new SuperMap.Icon("images/icon10.png", size);
//记录标记使用的状态
var signState = false;
//地图标注的提示框跟随鼠标移动
$(document).mousemove(function (e) {
    $('#tip')[0].style.left = e.clientX + 'px';
    $('#tip')[0].style.top = e.clientY + 'px';
})

function setSign() {
    if (!signState) {
        signState = true
        $('#tip').show()
        map.events.register('click', map, eventLinstener)
    } else {
        map.events.unregister('click', map, eventLinstener)
        $('#tip').hide()
    }
}

function eventLinstener(e) {
    var pixel = new SuperMap.Pixel(e.clientX, e.clientY)
    var lonlat = map.getLonLatFromPixel(pixel)
    var marker = new SuperMap.Marker(lonlat, icon);
    markerLayer.addMarker(marker)
    map.events.unregister('click', map, eventLinstener)
    $('#tip').hide()
    signState = false
}
//定位
function locate() {
    var x = $('#cLng').val()
    var y = $('#cLat').val()
    var marker = new SuperMap.Marker(new SuperMap.LonLat(x, y), icon);
    map.setCenter(new SuperMap.LonLat(x, y), 11);
    markerLayer.addMarker(marker)
}


//载入标记
(function () {
    var bookmarks = localStorage.getItem("MapBookmarks")
    var signs = localStorage.getItem("SignMarkers")
    if (bookmarks) {
        var bookmarksJSON = JSON.parse(bookmarks)
        for (let index = 0; index < bookmarksJSON.length; index++) {
            var bookmark = bookmarksJSON[index];
            var booksDiv = '<a onclick="bookmarksClick(\'' + bookmark.name + '\')">' + bookmark.name + '<i class="fa fa-close" onclick="removeBookmark(\'' + bookmark.name + '\')"></i></a>';
            $('#bookmarksList').append(booksDiv);
        }
    }
    if (signs) {
        var signsJSON = JSON.parse(signs)
        signsJSON.forEach(sign => {
            var marker = new SuperMap.Marker(new SuperMap.LonLat(sign.x, sign.y))
            marker.events.on({
                "click": function (e) {
                    console.log(e)
                    $('#signName').attr('value', sign.title)
                    $('#signContent').attr('value', sign.content)
                    $('#setSign').show()
                }
            })
            signMarkerLayer.addMarker(marker)
        });
    }
})()

/* 书签 */
function showBookMark() {
    $(".tool_measure").hide();
    seeSearchShow = false;
    $(".seeSearch").hide();
    measureShow = false;
    $(".bookmarkPane").fadeIn();
}
$(".bookmarkPane h6 i").click(function () {
    $(".bookmarkPane").fadeOut();
});
/* 添加书签 */
$("#addBookMark").click(function () {
    var key = $(".bookMarkName").val();
    if (key == '') {
        $(".errorPane").fadeIn();
        $(".errorPane .bottom").text("请输入有效书签名！");
    } else {
        /* 这里写添加书签的具体方法 */
        bookmarks(key)
    }
});

//新增书签
//书签保存到本地的localStorage
function bookmarks(name) {
    var center = map.getCenter()
    var zoom = map.getZoom()
    var bookmarksName = name
    var data = {
        center: center,
        zoom: zoom
    }
    var bookmarks = localStorage.getItem("MapBookmarks")

    if (bookmarks) {
        var bookmarksJSON = JSON.parse(bookmarks)
        //不增加重复的书签
        for (let index = 0; index < bookmarksJSON.length; index++) {
            var b = bookmarksJSON[index];
            if (b.name === bookmarksName) {
                bookmarksJSON[index].data = data
                localStorage.setItem('MapBookmarks', JSON.stringify(bookmarksJSON))
                return
            }
        }
        bookmarksJSON.push({
            name: bookmarksName,
            data: data
        })
        localStorage.setItem('MapBookmarks', JSON.stringify(bookmarksJSON))
    } else {
        localStorage.setItem('MapBookmarks', JSON.stringify([{
            name: bookmarksName,
            data: data
        }]))
    }
    $('#bookmarksList').append('<a onclick="bookmarksClick(\'' + name + '\')">' + name + '<i class="fa fa-close" onclick="removeBookmark(\'' + name + '\')"></i></a>')
}

/* 删除书签 */
//删除书签
function removeBookmark(bookmarkName) {
    var marks = JSON.parse(localStorage.getItem('MapBookmarks'))
    $('#bookmarksList').html("") //清除已有的书签span
    for (let index = 0; index < marks.length; index++) {
        const mark = marks[index];
        if (mark.name == bookmarkName) {
            marks.splice(index, 1);
            localStorage.setItem('MapBookmarks', JSON.stringify(marks))
        } else {
            //将没有删除的书签span重新加入
            $('#bookmarksList').append('<a onclick="bookmarksClick(\'' + mark.name + '\')">' + mark.name + '<i onclick="removeBookmark(\'' + mark.name + '\')"></i></a>')
        }
    }
}

//点击书签
function bookmarksClick(bookmarksName) {
    if (localStorage.getItem('MapBookmarks')) {
        var marks = JSON.parse(localStorage.getItem('MapBookmarks'))
        for (let index = 0; index < marks.length; index++) {
            const mark = marks[index];
            if (mark.name == bookmarksName) {
                map.setCenter(new SuperMap.LonLat(mark.data.center.lon, mark.data.center.lat), mark.data.zoom)
                return;
            }
        }
    }
}

/* 返回首页 */
function returnToHome() {
    window.location.href = "../index.html";
}
/* 虚拟现实 */
function hrefToVR() {
    window.location.href = "../VR/index.html";
}

var dynamicLayersArr = [1, 2, 3];
/* 多时相显示进度条 */
function showTimelineSlider() {
	var zoom = map.getZoom();
	if(zoom<=13){
		map.zoomTo(14);
	}
    if (isRollingScreenOpen) {
        return;
    } else {
        curType = "img";
        layerGJImg.setVisibility(0);
        layerGJCia.setVisibility(0);
        layerGJVec.setVisibility(0);
        layerGJCva.setVisibility(0);
        layerVec.setVisibility(0);
        layerCva.setVisibility(0);
        layerImg.setVisibility(1);
        layerCia.setVisibility(1);
    }
    if (dynamicLayersArr.length == 0) {
        $(".errorPane").fadeIn();
        $(".errorPane .top .fa").hide();
        $(".errorPane .bottom").text("初次点击，正在获取数据，请稍后!");
        queryDynamicTileExtentBySQL(); //该方法在文件 timeLayers.js 中
    } else {
        startTimelineSlider();
    }
}


/* 启动滑块功能 */
function startTimelineSlider() {
    $(".bookmarkPane").hide();
    $(".tool_measure").hide();
    $(".seeSearch").hide();
    measureShow = false;
    seeSearchShow = false;
    $(".elementWrap").fadeIn();
    // getCurrentSlider(); //该方法在文件  timeLayers.js 中
    getImgResult();
    map.events.register("moveend", null, getImgResult); //该方法在文件  timeNewLayers.js 中

}

/* 关闭多时相滑块框 */
$(".elementWrap .elementClose").click(function () {
    /* 关闭所有多时相图层 */
    closeAllTimeLayers();
});

function closeAllTimeLayers() {
    map.events.unregister("moveend", null, getImgResult);
    $(".elementWrap").hide();
	//关闭多时相回复注记图层,恢复check状态
	layerCia.setVisibility(1);
    $("#switch").prop("checked", true);
    var slayer = map.getLayersByName("多时相")
    if (slayer && slayer.length > 0) {
        slayer.forEach(layer => {
            map.removeLayer(layer)
            layer.destroy()
        });
    }
}

//多时相里的注记开关
$('#switch').on('change',function(e){
    if(this.checked){
        layerCia.setVisibility(1)
    }else{
        layerCia.setVisibility(0)
    }
})