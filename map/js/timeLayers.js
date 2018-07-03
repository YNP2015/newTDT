/* 关于多时相 */
var dynamicTileUrl = "http://222.247.40.204:8091//iserver/services/map-other/rest/maps/yxscjtb";
var dynamicLayer = "yxscjtb@other";
var urlObjects = [];
var urlObjectsTemp = [];
var urlObjectsMap = new HashMapSlider();
var urlObjectsUnique = [];
var yearsAsc = [];


function getMultidateUrls() {
    var url = "../public/timeLayer.json"
    $.ajax({
        type: 'get',
        url: url,
        success: function (data) {
            for (i = 0; i < data.datas.length; i++) {
                var dataobj = {};
                dataobj.name = data.datas[i].name.trim();
                dataobj.layername = "layername" + i;
                dataobj.year = data.datas[i].year.trim();
                dataobj.url = data.datas[i].url.trim();
                if (data.datas[i].year != 9999) {
                    urlObjects.push(dataobj);
                    if (multidateYears.indexOf(dataobj.year) == -1) {
                        multidateYears.push(dataobj.year);
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





var currentA = [];   //获取有哪些年份的影像图层
var currentAZoomLevel = [];  //每个年份影像图到的级别

function getCurrentSlider() {
    currentA = [];
    currentAZoomLevel = [];
    for (var i = 0; i < dynamicLayersArr.length; i++) {
        var centerpoint = turf.point([map.getCenter().lon, map.getCenter().lat]);
        var isContain = turf.booleanContains(dynamicLayersArr[i], centerpoint);
        if (isContain) {
            currentA.push(dynamicLayersArr[i].properties["NAME"].trim());
            currentAZoomLevel.push(dynamicLayersArr[i].properties["层级"].trim());
        }
    }
    console.log(currentA);
    console.log(currentAZoomLevel);
    /* 启动滑块功能 */
    var selector = '[data-rangeslider]';
    $(document).on('input', selector, function (e) {
        valueOutput(e.target);
    });
    $(selector).rangeslider({
        polyfill: false
    });
    $(document).on('click', '#js-example-destroy button[data-behaviour="initialize"]', function (e) {
        $('input[type="range"]', e.target.parentNode).rangeslider({
            polyfill: false
        });
    });
    var startYear = $("output").text();
    //fillDivSlider();
}

function valueOutput(element) {
    var value = element.value;
    var output = element.parentNode.getElementsByTagName('output')[0];
    if (value == 1) {
        output.innerHTML = 2012;
    } else if (value == 2) {
        output.innerHTML = 2014;
    } else if (value == 3) {
        output.innerHTML = 2016;
    } else if (value == 4) {
        output.innerHTML = 2017;
    } else {
        return;
    }
}


var sortBy = function (filed, rev, primer) {
    rev = (rev) ? -1 : 1;
    return function (a, b) {
        a = a[filed];
        b = b[filed];
        if (typeof (primer) != 'undefined') {
            a = primer(a);
            b = primer(b);
        }
        if (a < b) {
            return rev * -1;
        }
        if (a > b) {
            return rev * 1;
        }
        return 1;
    }
};

function fillDivSlider() {
    urlObjectsTemp = [];
    urlObjectsMap = new HashMapSlider();
    urlObjectsUnique = [];
    yearsAsc = [];

    for (var i = 0; i < urlObjects.length; i++) {
        if (currentA.indexOf(urlObjects[i].name) > -1) {
            var index = currentA.indexOf(urlObjects[i].name);
            var zoomlevel = currentAZoomLevel[index];
            urlObjects[i].zoomlevel = zoomlevel;
            urlObjectsTemp.push(urlObjects[i]);
        }
    }

    urlObjectsTemp.sort(sortBy('year', false, parseInt));

    urlObjectsTemp.forEach(function (o) {
        if (urlObjectsMap.containsKey(o.year) &&
            o.name.toString().indexOf("0.5") > 0) { //已经有了，如果有0.5米分辨率的那就过滤替换掉
            urlObjectsMap.set(o.year, o.url);
        } else { //直接加
            urlObjectsMap.put(o.year, o.url);
        }
    })

    for (var i = 0; i < urlObjectsTemp.length; i++) {
        if (urlObjectsTemp[i].url == urlObjectsMap.get(urlObjectsTemp[i].year)) {
            urlObjectsUnique.push(urlObjectsTemp[i]);
        }
    }
    urlObjectsUnique.sort(sortBy('year', false, parseInt));

    //获取年份
    yearsAsc = urlObjectsMap.keySet().sort(function (a, b) {
        return a - b;
    });

    //填充slider
    if (yearsAsc.length > 0) {
        equipSlider();
    }
}