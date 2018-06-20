/* 点击搜索按钮事件 */
$("#s-poi").click(function () {
    poiClick();
});
/* 搜索框回车事件 */
$(".poiSearch").keydown(function (event) {
    if (event.keyCode == 13) {
        poiClick();
    }
})

/* 视野内搜索按钮事件 */
$("#seePoi").click(function () {
    poiAroundClick();
});
$("#seeInput").keydown(function (event) {
    if (event.keyCode == 13) {
        poiAroundClick();
    }
})

/* 点击搜索按钮之后的功能 */
function poiClick() {
    isSkyPanoQuery = false;
    $(".poiMsg").hide();
    $(".resultPane").hide();
    if ($(".poiSearch").val() == "") {
        $(".errorPane").fadeIn();
        $(".errorPane .bottom").text("请输入搜索内容！");
        return;
    } else if ($(".poiSearch").val() == "天地图湖南") {
        $(".errorPane").fadeIn();
        $(".errorPane .bottom").text("欢迎使用新版湖南天地图在线地图！");
    } else {
        isAllSearching = true; //标识为全局搜索
        currentPage = 0;
        var keyword = $(".poiSearch").val();
        var sql = "RNAME like '%" + keyword + "%'";
        queryPOI(sql, 0);
    }
}

function poiAroundClick() {
    $(".poiMsg").hide();
    $(".resultPane").hide();
    if ($("#seeInput").val() == "") {
        $(".errorPane").fadeIn();
        $(".errorPane .bottom").text("请输入搜索内容！");
        return;
    } else if ($("#seeInput").val() == "天地图湖南") {
        $(".errorPane").fadeIn();
        $(".errorPane .bottom").text("欢迎使用新版湖南天地图在线地图！");
    } else {
        isAllSearching = false; //标识为视野内搜索
        currentPage = 0;
        var keyword = $("#seeInput").val();
        var sql = "RNAME like '%" + keyword + "%'";
        queryPOI(sql, 0);
    }
}

/* 点击地名分类直接查询 */
function queryByCategories(typename1) {
    isSkyPanoQuery = false;
    $(".menuPane").hide();
    isAllSearching = true;
    currentPage = 0;
    var sql = "TYPENAME1='" + typename1 + "'";
    isQueryByCatagoriesNotByES = true;
    queryPOI(sql, 0);
}

function queryByDetailCategories(typename2) {
    isSkyPanoQuery = false;
    $(".menuPane").hide();
    isAllSearching = false;
    globalCurBounds = map.getExtent();
    var sql = "TYPENAME2='" + typename2 + "'";
    currentPage = 0;
    queryPOI(sql, 0);
}



function queryPOI(sql, start) {
    infowinPoi = null;
    tenFeatursList = [];
    currentSQl = sql;
    startRecord = start;
    cityName = $(".mapPot span").text();
    if (cityName == "湖南省" || cityName == "长沙市" || cityName == "株洲市" || cityName == "湘潭市" || cityName == "衡阳市" || cityName == "邵阳市" || cityName == "岳阳市" || cityName == "常德市" || cityName == "张家界市" || cityName == "益阳市" || cityName == "郴州市" || cityName == "永州市" || cityName == "怀化市" || cityName == "娄底市" || cityName == "湘西州") {
        queryDatasetName = cityName + "POI@HNPOI";
    } else {
        queryDatasetName = cityName + "@HNPOI";
    }
    var queryParam, queryParams, queryService;
    queryParam = new SuperMap.REST.FilterParameter({
        name: queryDatasetName,
        fields: ["SmID", "SmX", "SmY", "RNAME", "ADDRESS", "TYPENAME1", "TELEPHONE"],
        orderBy: "IMPORTANCE DESC",
        queryOption: SuperMap.REST.QueryOption.ATTRIBUTE,
        attributeFilter: sql
    });
    if (isAllSearching) {
        //全部视域&&普通查询
        queryParams = new SuperMap.REST.QueryBySQLParameters({
            queryParams: [queryParam]
        });
        queryService = new SuperMap.REST.QueryBySQLService(urlHNPOI, {
            eventListeners: {
                "processCompleted": processCompletedPOI,
                "processFailed": processFailedPOI
            }
        });
    } else {
        //当前视域查询&&普通查询
        globalCurBounds = map.getExtent();
        queryParams = new SuperMap.REST.QueryByBoundsParameters({
            queryParams: [queryParam],
            bounds: globalCurBounds
        });
        queryService = new SuperMap.REST.QueryByBoundsService(urlHNPOI, {
            eventListeners: {
                "processCompleted": processCompletedPOI,
                "processFailed": processFailedPOI
            }
        });
    }
    queryParams.startRecord = startRecord;
    queryParams.expectCount = expectCount;
    queryService.processAsync(queryParams);
}

function processCompletedPOI(queryEventArgs) {
    markerLayer.clearMarkers();
    var result = queryEventArgs.result;
    if (result && result.recordsets) {
        features = [];
        featuresAll = [];
        totalNumb = queryEventArgs.result.totalCount; //查询结果总数
        var recordsets = result.recordsets;
        if (recordsets[0].features) {
            featuresAll = recordsets[0].features;
        }
        var startNum = currentPage * pageSize;
        var n = startNum - startRecord;
        var showFeatures = [];
        for (var i = 0; i < pageSize && n + i < featuresAll.length; i++) {
            showFeatures.push(featuresAll[n + i]);
        }

        showQueryResult(showFeatures); //列表结果以及地图结果
    }
    if (totalNumb == 0 && !isAroudSearchOpen) {
        $(".errorPane").fadeIn();
        $(".errorPane .bottom").text("无查询结果！");
        return;
    }
    $(".resultPane").fadeIn();
    $(".resultPane .resultCont").css("bottom", "30px"); //显示分页按钮后，将结果面板距离底部的距离调大
    $("#Pagination").show(); //显示分页按钮
    var selectFeature = new SuperMap.Control.SelectFeature(vectorLayer, {
        onSelect: poiPointSelect,
        onUnselect: onVectorLayerFeatureUnselect,
        repeat: true
    });
    map.addControl(selectFeature);
    selectFeature.activate();
    // 创建分页
    $("#Pagination").pagination(totalNumb, {
        num_edge_entries: 1, //边缘页数
        num_display_entries: 3, //主体页数
        callback: pageselectCallback, //点击分页按钮之后执行的方法
        prev_text: "&lt;",
        next_text: "&gt;",
        prev_show_always: false,
        next_show_always: false,
        items_per_page: pageSize, //每页显示10项
        current_page: currentPage
    });
}

function processFailedPOI(e) {
    alert(e.error.errorMsg);
}

function showQueryResult(features) { //显示搜索结果
    vectorLayer.removeAllFeatures();
    var resultContent = "<p>在<i>" + cityName + "</i>共搜索到<i>" + totalNumb + "</i>条结果</p><ul class='poiList'>";
    var currentTabCount = 0;
    for (var i = 0; i < features.length; i++) {
        var featureTemp = features[i];
        var a = i + 1;
        featureTemp.style = {
            cursor: "pointer",
            externalGraphic: "../public/images/mark/points/pointone_" + a + ".png",
            graphicWidth: 21,
            graphicHeight: 33,
            name: "site"
        };
        tenFeatursList.push(features[i]);
        currentTabCount++;
        var smx = featureTemp.geometry.x;
        var smy = featureTemp.geometry.y;
        var poiname;
        if (isSkyPanoQuery) {
            poiname = featureTemp.attributes['NAME'];
        } else {
            poiname = featureTemp.attributes['RNAME'];
        }
        var addr = "";
        if (featureTemp.attributes["ADDRESS"] == ' ' || featureTemp.attributes["ADDRESS"] == undefined) {
            addr = "地址：" + "暂缺";
        } else {
            addr = "地址：" + featureTemp.attributes['ADDRESS'];
        }
        var tel = "";
        if (featureTemp.attributes["TELEPHONE"] == ' ' || featureTemp.attributes["TELEPHONE"] == undefined) {
            tel = "电话：" + "暂缺";
        } else {
            tel = "电话：" + featureTemp.attributes['TELEPHONE'];
        }
        resultContent += "<li style='cursor:pointer;' onclick='clickSearchResultPanel(" + smx + "," + smy + "," + i + ")'" +
            " data-index='3' data-searchindex='2' class='search-item base-item'map-on-click='poiitem' map-on-mouseenter='poiitem' map-on-mouseleave='poiitem'data-stat-code='poisearch.item.item;poisearch.all.item;poisearch.all.topitem'>" +
            "<div class='Pname'>" +
            "<a href='javascript:void(0);' class='n-blue' data-index='3' data-dd='3' data-stat-code='poisearch.all.title'>" + poiname + "</a></div>" +
            "<div class='Paddr'><span class='n-grey' title='" + addr + "'>" + addr + "</span></div><div class='Ptel'>" + tel + "</div>" +
            "</li>";
    }
    resultContent += "</ul>";
    $("#mCSB_1_container").html(resultContent);
    vectorLayer.addFeatures(features);
}

function pageselectCallback(page_index, jq) { //点击分页按钮之后执行的方法
    map.removeAllPopup();
    var new_content = $("#hiddenresult div.result:eq(" + page_index + ")").clone();
    $("#mCSB_1_container").empty().append(new_content); //装载对应分页的内容
    currentPage = page_index;
    var startNum = currentPage * pageSize;
    var n = startNum - startRecord;
    if (n < expectCount && n >= 0) {
        var showFeatures = [];
        for (var i = 0; i < pageSize && n + i < featuresAll.length; i++) {
            showFeatures.push(featuresAll[n + i]);
        }
        showQueryResult(showFeatures);
    } else {
        var recordNum = parseInt(startNum / expectCount) * expectCount;
        queryPOI(currentSQl, recordNum);
    }
}



/* poi查询之后地图上poi列表的点击事件 */

function clickSearchResultPanel(smx, smy, num) {
    map.setCenter(new SuperMap.LonLat(smx, smy), 15);
    poiPointSelect(tenFeatursList[currentPage * 10 + num]);
}

function poiPointSelect(selectFeature) {
    var poiName, poiAddress, poiNum, poiContent;
    if ((selectFeature.attributes["TYPENAME1"] || selectFeature.attributes["TYPENAME1"] == "") && selectFeature.attributes["SkyPanoID"] == undefined) {
        poiName = selectFeature.attributes["RNAME"];
        poiAddress = selectFeature.attributes["ADDRESS"];
        poiNum = selectFeature.attributes["TELEPHONE"];
        if (poiAddress == ' ') {
            poiAddress = "暂缺";
        }
        if (poiNum == ' ') {
            poiNum = "暂缺";
        }
        poiContent = '<h3 class="poiName">' + poiName + '</h3>';
        var x = selectFeature.geometry.getBounds().getCenterLonLat().lon;
        var y = selectFeature.geometry.getBounds().getCenterLonLat().lat;
        selectFearturePopup = new SuperMap.Popup.FramedCloud(
            "poiSelected",
            new SuperMap.LonLat(x, y),
            null,
            poiContent,
            null,
            false,
            null,
            true
        );
        infowinPoi = selectFearturePopup;
        map.addPopup(selectFearturePopup);
        bindqueryAroundSearch(x, y, selectFeature);
        $(".resultPane").fadeOut(300, function () { //隐藏结果面板的同时显示POI点的详细信息
            $(".poiMsg").fadeIn();
            $(".poiMsg .name span").text(poiName);
            $(".poiMsg .addr span").text(poiAddress);
            $(".poiMsg .phone span").text(poiNum);
        });
    } else {
        $(".errorPane").fadeIn();
        $(".errorPane .bottom").text("查无资料！");
    }
}


function closeInfoPoi() {
    if (infowinPoi) {
        try {
            infowinPoi.hide();
            infowinPoi.destroy();
        } catch (e) {}
    }
}

function onVectorLayerFeatureUnselect() {
    map.removeAllPopup();
}


function bindqueryAroundSearch(x, y, feature) {
    var keyword = "";
    /* poi搜索结果中的周边搜索 */
    $(".poiMsg .areaCont .jiudian").click(function () {
        queryAroundByClick = true;
        queryAround(x, y, "08", keyword); //该方法在文件 queryAround.js 中
        $(".poiMsg").fadeOut();
    });
    $(".poiMsg .areaCont .canyin").click(function () {
        queryAroundByClick = true;
        queryAround(x, y, "01", keyword);
        $(".poiMsg").fadeOut();
    });
    $(".poiMsg .areaCont .yinhang").click(function () {
        queryAroundByClick = true;
        queryAround(x, y, "13", keyword);
        $(".poiMsg").fadeOut();
    });
}