/* 关于多时相 */
var dynamicTileUrl = "http://222.247.40.204:8091//iserver/services/map-other/rest/maps/yxscjtb";
var dynamicLayer = "yxscjtb@other";
var urlObjects = [];
var urlObjectsTemp = [];
var urlObjectsMap = new HashMapSlider();
var urlObjectsUnique = [];
var yearsAsc = [];
var multidateYears = [];
var multidateYearsUrl = [];


function getMultidateUrls() {
    multidateYears = [];
    multidateYearsUrl = [];
    var url = "../public/timeLayer.json"
    $.ajax({
        type: 'get',
        url: url,
        success: function (data) {
            for (i = 0; i < data.datas.length; i++) {
                var dataobj = {}; // 获得json中图层的详细信息
                dataobj.name = data.datas[i].name.trim();
                dataobj.layername = "layername" + i;
                dataobj.year = data.datas[i].year.trim();
                dataobj.url = data.datas[i].url.trim();
                if (data.datas[i].year != 9999) {
                    urlObjects.push(dataobj);
                    if (multidateYears.indexOf(dataobj.year) == -1) {
                        multidateYears.push(dataobj.year);
                        multidateYearsUrl.push(dataobj.url);
                    }
                }
            }
        }
    });
}

function queryDynamicTileExtentBySQL() {
    var queryParam, queryParams, queryService;
    var sql = "SmID > -1";
    queryParam = new SuperMap.REST.FilterParameter({
        name: dynamicLayer,
        attributeFilter: sql
    });
    queryParams = new SuperMap.REST.QueryBySQLParameters({
        queryParams: [queryParam]
    });
    queryService = new SuperMap.REST.QueryBySQLService(dynamicTileUrl, {
        eventListeners: {
            "processCompleted": processCompletedDynamicTileExtent,
            "processFailed": processFailedDynamicTileExtent
        }
    });
    queryService.processAsync(queryParams);
}

function processCompletedDynamicTileExtent(queryEventArgs) {
    var result = queryEventArgs.result;
    var recordsets = result.recordsets;
    var features = recordsets[0].features;
    var format = new SuperMap.Format.GeoJSON();
    for (var i = 0; i < features.length; i++) {
        var multiPolygonGeojson = JSON.parse(format.write(features[i], false));
        var multiPolygonProperties = multiPolygonGeojson.properties;
        var multiPolygonGeom = multiPolygonGeojson.geometry;
        if (multiPolygonGeom.type === 'MultiPolygon') {
            for (var j = 0; j < multiPolygonGeom.coordinates.length; j++) {
                var polygonGeojson = {
                    'type': 'Polygon',
                    'coordinates': multiPolygonGeom.coordinates[j],
                    'properties': multiPolygonProperties
                };
                dynamicLayersArr.push(polygonGeojson);
            }
        }
    }
    $(".errorPane").hide();
    startTimelineSlider(); //该方法在文件 tools.js 中
}

function processFailedDynamicTileExtent(e) {
    $(".errorPane").fadeIn();
    var a = e.error.errorMsg;
    $(".errorPane .bottom").text(a);
}





var currentA = []; //获取有哪些年份的影像图层
var currentB = [];
var currentC = [];
var currentD = [];
var currentAZoomLevel = []; //每个年份影像图到的级别

function getCurrentSlider() {
    currentA = [];
    currentB = [];
    currentC = [];
    currentD = [];
    currentAZoomLevel = [];
    for (var i = 0; i < dynamicLayersArr.length; i++) {
        var centerpoint = turf.point([map.getCenter().lon, map.getCenter().lat]);
        var isContain = turf.booleanContains(dynamicLayersArr[i], centerpoint);
        if (isContain) {
            currentA.push(dynamicLayersArr[i].properties["NAME"].trim());
            //currentAZoomLevel.push(dynamicLayersArr[i].properties["层级"].trim());
        }
    }
    for (var y = 0; y < currentA.length; y++) {
        if (currentA[y].indexOf("0.5") == -1 && currentA[y].indexOf("1米") == -1) {
            currentB.push(currentA[y]);
        }
    }
    for (var x = 0; x < currentB.length; x++) {
        var val = currentB[x].split("年")[0];
        if (val == "2008-2012") {
            val = "2012";
        }
        if (val == "2012-2014") {
            val = "2014";
        }
        currentC.push(val);
    }
    for (var z = 0; z < currentC.length; z++) {
        var val = parseInt(currentC[z]);
        currentD.push(val);
    }
    currentD = currentD.sort();
    var Dlength = currentD.length - 1;
    console.log(currentD.length);
    $("output").html(currentD[Dlength]);
    console.log(currentD);
    startSlider();
}


/* 启动滑块功能 */
function startSlider() {
    var selector = '[data-rangeslider]';
    $(document).on('input', selector, function (e) {
        valueOutput(e.target);
    });
    $(selector).rangeslider({
        polyfill: false
    });
     var attributes = {
         max: currentD.length
     };
     $("#js-example-change-attributes input").attr(attributes).rangeslider('update', true);
}

function valueOutput(element) {
    var value = element.value;
    var output = element.parentNode.getElementsByTagName('output')[0];
    var a = value - 1;
    output.innerHTML = currentD[a];
}