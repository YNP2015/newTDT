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

/* 点击搜索按钮之后的功能 */
function poiClick() {
    if ($(".poiSearch").val() == "") {
        $(".errorPane").fadeIn();
        $(".errorPane .bottom").text("请输入搜索内容！");
        return;
    } else {
        isAllSearching = true; //标识为全局搜索
        var keyword = $(".poiSearch").val();
        var sql = "RNAME like '%" + keyword + "%'";
        queryPOI(sql, 0);
    }
}


function queryPOI(sql, start) {
    currentSQl = sql;
    startRecord = start;
    var queryParam, queryParams, queryService, queryDatasetName = "湖南省POI@HNPOI";
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
        //当前视域查询
    } else {
        //当前视域查询&&普通查询
        globalCurBounds = map.getExtent();
        var curBounds = globalCurBounds;
        queryParams = new SuperMap.REST.QueryByBoundsParameters({
            queryParams: [queryParam],
            bounds: curBounds
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
    $(".resultPane").fadeIn();
    $(".resultPane .resultCont").css("bottom", "30px"); //显示分页按钮后，将结果面板距离底部的距离调大
    $("#Pagination").show(); //显示分页按钮
    var result = queryEventArgs.result;
    if (result && result.recordsets) {
        features = [];
        featuresAll = [];
        totalNumb = queryEventArgs.result.totalCount; //查询结果总数
        /* 这段代码将查询结果总数显示出来（还没写） */


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
    var selectFeature = new SuperMap.Control.SelectFeature(vectorLayer, {
        onSelect: onVectorLayerFeatureSelect, //该方法在 searchResultClickEvebts.js中
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

        var poiname = featureTemp.attributes['RNAME'];
        var addr = "";
        if (featureTemp.attributes["ADDRESS"] == ' ') {
            addr = "地址：" + "暂缺";
        } else {
            addr = "地址：" + featureTemp.attributes['ADDRESS'];
        }
        var tel = "";
        if (featureTemp.attributes["TELEPHONE"] == ' ') {
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

