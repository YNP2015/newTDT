var startPointName, destPointName;
$("#s-road").click(function () {
    roadClick();
});
$(".startP").keydown(function (event) {
    if (event.keyCode == 13) {
        roadClick();
    }
});
$(".endP").keydown(function (event) {
    if (event.keyCode == 13) {
        roadClick();
    }
});

function roadClick() {
    startPointName = $(".searchRoadPane .startP").val();
    destPointName = $(".searchRoadPane .endP").val();
    if (startPointName == "" && destPointName == "") {
        $(".errorPane").fadeIn();
        $(".errorPane .bottom").text("请输入起点和终点！");
        return;
    } else if (startPointName == "") {
        $(".errorPane").fadeIn();
        $(".errorPane .bottom").text("请输入起点！");
        return;
    } else if (destPointName == "") {
        $(".errorPane").fadeIn();
        $(".errorPane .bottom").text("请输入终点！");
        return;
    } else {
        startPointNameAndDestPointNameFromPopup = true;
        queryRoad();
    }
}

var poiDatasetAtDatasource = "湖南省POI@HNPOI";
function queryRoad() {
    var queryParamStartPoint, queryParamDestPoint, queryBySQLParams, queryBySQLService;
    queryParamStartPoint = new SuperMap.REST.FilterParameter({
        name: poiDatasetAtDatasource,
        fields: ["SmX", "SmY"],
        expectCount: 1,
        attributeFilter: "NAME Like " + "'%" + startPointName + "%'"
    });
    queryParamDestPoint = new SuperMap.REST.FilterParameter({
        name: poiDatasetAtDatasource,
        fields: ["SmX", "SmY"],
        expectCount: 1,
        attributeFilter: "NAME Like " + "'%" + destPointName + "%'"
    });
    queryBySQLParams = new SuperMap.REST.QueryBySQLParameters({
        queryParams: [queryParamStartPoint, queryParamDestPoint],
        queryOption: SuperMap.REST.QueryOption.ATTRIBUTE
    });
    queryBySQLService = new SuperMap.REST.QueryBySQLService(urlHNPOI, {
        eventListeners: {
            "processCompleted": processCompletedQueryRoadByInput,
            "processFailed": processFailedQueryRoadByInput
        }
    });
    queryBySQLService.processAsync(queryBySQLParams);
}

function processCompletedQueryRoadByInput(queryEventArgs) {
    if (queryEventArgs.result.recordsets[0].features.length == 0 || queryEventArgs.result.recordsets[1].features.length == 0) {
        $(".errorPane").fadeIn();
        $(".errorPane .bottom").text("未查询到相应结果，请重新输入起点或终点！");
        return;
    }
    var startPointSmX, startPointSmY, destPointSmX, destPointSmY;

    var i, j, fieldInfos = [],
        result = queryEventArgs.result,
        feature, features = [];
    if (result && result.recordsets) {
        startPointSmX = result.recordsets[0].features[0].attributes["SmX"];
        startPointSmY = result.recordsets[0].features[0].attributes["SmY"];
        destPointSmX = result.recordsets[1].features[0].attributes["SmX"];
        destPointSmY = result.recordsets[1].features[0].attributes["SmY"];

        //添加起点和终点的marker
        var size = new SuperMap.Size(25, 40);
        var offset = new SuperMap.Pixel(-(size.w / 2), -size.h);
        var imgIconStart = "../public/images/mark/start.png";
        var imgIconEnd = "../public/images/mark/end.png";

        var markerStartIcon = new SuperMap.Icon(imgIconStart, size, offset);
        var markerEndIcon = new SuperMap.Icon(imgIconEnd, size, offset);
        markerStart = new SuperMap.Marker(new SuperMap.LonLat(startPointSmX, startPointSmY), markerStartIcon);
        markerEnd = new SuperMap.Marker(new SuperMap.LonLat(destPointSmX, destPointSmY), markerEndIcon)
        markerLayer.addMarker(markerStart);
        markerLayer.addMarker(markerEnd);
        nodeArray = [];

        var startPoint = new SuperMap.Geometry.Point(parseFloat(startPointSmX), parseFloat(startPointSmY));
        var destPoint = new SuperMap.Geometry.Point(parseFloat(destPointSmX), parseFloat(destPointSmY));
        nodeArray.push(startPoint);
        nodeArray.push(destPoint);
        findPath();
    }
}

function processFailedQueryRoadByInput() {
    return;
}