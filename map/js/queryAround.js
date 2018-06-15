/* 周边查询的函数 */

var globalPolygon;
var dis;
var min_radius = 0.005; //500m
var max_radius = 0.05; //5000m
var circle_resizing = false; //移动标记
var searchAroundGlobalCenterX, searchAroundGlobalCenterY, searchAroundGlobalQueryDis;
var circleStyle = {
    strokeColor: "#316fba",
    fillColor: "#4785d5",
    strokeWidth: 2,
    strokeOpacity: 0.8,
    fillOpacity: 0.4
};

function queryAround(x, y, xmlx, keyword) {
    dragCircleLayer.removeAllFeatures(); //清空dragCircleLayer
    dis = 0.01; //设置第一次查询的默认值
    queryByDistance(x, y, xmlx, dis, keyword); //初始半径距离查询
    setDrag(x, y, xmlx, keyword); //拖动选择半径
}


/* 距离查询 */
function queryByDistance(X, Y, Xmlx, queryDis, keyword) {
    $(".poiMsg").hide();
    searchAroundGlobalCenterX = X;
    searchAroundGlobalCenterY = Y;
    searchAroundGlobalQueryDis = queryDis;
    currentPage = 0;
    tenFeatursList = [];
    isAroudSearchOpen = true;
    //直接清除掉地图上的popup
    map.removeAllPopup();
    //地图定位至当前查询范围
    var centerPoint = new SuperMap.Geometry.Point(X, Y);
    var polygon = SuperMap.Geometry.Polygon.createRegularPolygon(centerPoint, queryDis, 50, 270);
    map.zoomToExtent(polygon.getBounds());
    var sql;
    if (queryAroundByClick) {
        sql = "TYPENAME1='" + Xmlx + "'";
    } else {
        sql = "NAME like '%" + keyword + "%'";
    }
    currentSQl = sql;
    queryAroundPOI(sql, 0);
}


/* 拖动选择半径 */
function setDrag(X, Y, xmlx, keyword) {
    globalx = X, globaly = Y;
    vectorLayer.removeAllFeatures();
    var centerPoint = new SuperMap.Geometry.Point(X, Y);
    //显示初始圆
    dis = 0.01;
    var polygon = SuperMap.Geometry.Polygon.createRegularPolygon(centerPoint, dis, 50, 270);
    dragCircleLayer.addFeatures(new SuperMap.Feature.Vector(polygon, circleStyle));

    //显示初始拖动按钮
    var dragButtonLonlat = new SuperMap.LonLat(X + dis, Y);
    var pixe = map.getPixelFromLonLat(dragButtonLonlat);
    $("#dragButton").css({
        top: (pixe.y + 20) + "px",
        left: (pixe.x - 13) + "px"
    });
    $("#distance").val(dis.toFixed(5) * 100000 + "米");
    $("#dragButton").show();

    $('#dragButton').mousedown(
        function (event) {
            //鼠标按下时，获取圆心的屏幕坐标
            var centerPixelX = event.pageX - map.getPixelFromLonLat(new SuperMap.LonLat(X, Y)).x;
            var centerPixelY = map.getPixelFromLonLat(new SuperMap.LonLat(X, Y)).y;
            circle_resizing = true;

            $('#map').mousemove(
                function (event) {
                    //取消浏览器的默认拖动事件
                    event.preventDefault();
                    event.stopPropagation();
                    var oX = event.pageX;
                    var eventPixel = new SuperMap.Pixel(oX, centerPixelY); //拖动时的鼠标屏幕坐标
                    dis = map.getLonLatFromPixel(eventPixel).lon - X; //拖动时的半径
                    /*start*/
                    if (dis < min_radius) {
                        dis = min_radius;
                        $("#distance").val(dis.toFixed(5) * 100000 + "米");
                        return;
                    }

                    if (dis > max_radius) {
                        dis = max_radius;
                        $("#distance").val(dis.toFixed(5) * 100000 + "米");
                        return;
                    }
                    /*end*/
                    var obj = $('#dragButton');
                    //控制拖动按钮向左不能超过圆心
                    if (event.pageX > map.getPixelFromLonLat(new SuperMap.LonLat(X, Y)).x) {
                        obj.css({
                            'left': oX - 12,
                            'top': centerPixelY + 18
                        }); //拖动按钮的位置随鼠标移动改变  
                        $("#distance").val(dis.toFixed(5) * 100000 + "米"); //显示半径文本框中的半径值
                        //实时画圆
                        globalPolygon = SuperMap.Geometry.Polygon.createRegularPolygon(centerPoint, dis, 50, 270);
                        vectorLayer.removeAllFeatures();
                        dragCircleLayer.removeAllFeatures();
                        dragCircleLayer.addFeatures(new SuperMap.Feature.Vector(globalPolygon, circleStyle));
                    }
                }
            ).mouseup(
                function (event) {
                    //移除鼠标拖动方法
                    $('#map').unbind("mousemove");
                    /*start*/
                    circle_resizing = false;
                    if (dis < min_radius) dis = min_radius;
                    if (dis > max_radius) dis = max_radius;
                    /*end*/
                    //鼠标释放后dragbutton位置bug修改
                    var pixcel = map.getPixelFromLonLat(new SuperMap.LonLat(X + dis, Y));
                    //根据当前半径进行距离查询
                    keyword = keywordSearchAround;
                    queryByDistance(X, Y, xmlx, dis, keyword);
                    //移除鼠标抬起方法
                    $('#map').unbind("mouseup");
                }
            );
        }
    );
}

function queryAroundPOI(sql, start) {
    cityName = $(".mapPot span").text();
    if (cityName == "湖南省" || cityName == "长沙市" || cityName == "株洲市" || cityName == "湘潭市" || cityName == "衡阳市" || cityName == "邵阳市" || cityName == "岳阳市" || cityName == "常德市" || cityName == "张家界市" || cityName == "益阳市" || cityName == "郴州市" || cityName == "永州市" || cityName == "怀化市" || cityName == "娄底市" || cityName == "湘西州") {
        queryDatasetName = cityName + "POI@HNPOI";
    } else {
        queryDatasetName = cityName + "@HNPOI";
    }
    startRecord = start;
    var queryByDistanceParams;
    if (queryAroundByClick) {
        /*类型查询*/
        queryByDistanceParams = new SuperMap.REST.QueryByDistanceParameters({
            queryParams: new Array(new SuperMap.REST.FilterParameter({
                name: queryDatasetName,
                orderBy: "IMPORTANCE DESC",
                attributeFilter: sql

            })),
            returnContent: true,
            distance: searchAroundGlobalQueryDis,
            geometry: new SuperMap.Geometry.Point(searchAroundGlobalCenterX, searchAroundGlobalCenterY)
        });
    } else {
        /*SQL查询*/
        queryByDistanceParams = new SuperMap.REST.QueryByDistanceParameters({
            queryParams: new Array(new SuperMap.REST.FilterParameter({
                name: queryDatasetName,
                attributeFilter: sql
            })),
            returnContent: true,
            distance: searchAroundGlobalQueryDis,
            geometry: new SuperMap.Geometry.Point(searchAroundGlobalCenterX, searchAroundGlobalCenterY)
        });
    }
    queryByDistanceParams.startRecord = startRecord;
    queryByDistanceParams.expectCount = expectCount;
    var queryByDistanceService = new SuperMap.REST.QueryByDistanceService(urlHNPOI);
    queryByDistanceService.events.on({
        "processCompleted": processCompletedPOI,
        "processFailed": processFailedPOI
    });

    queryByDistanceService.processAsync(queryByDistanceParams);
    isAroudSearchOpen = true;
}