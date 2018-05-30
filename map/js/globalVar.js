/**
 *
这个文件放全局变量 
 */



var map,
    urlVec = "http://222.247.40.204:8091/iserver/services/map-tdt/rest/maps/vec", //矢量服务
    urlImg = "http://222.247.40.204:8091/iserver/services/map-tdt/rest/maps/img", //影像服务
    urlCva = "http://222.247.40.204:8091/iserver/services/map-tdt/rest/maps/cva", //矢量注记服务
    urlCia = "http://222.247.40.204:8091/iserver/services/map-tdt/rest/maps/cia", //影像注记服务
    urlRoudNet = "http://222.247.40.204:8091/iserver/services/transportationAnalyst-HNNET/rest/networkanalyst/HNNET@HNNET", //路网
    urlHNPOI = "http://222.247.40.204:8091/iserver/services/map-HNPOI/rest/maps/HNPOI", //poi
    restLayerResolutions = [
        0.703125, //0    
        0.3515625, //1
        0.17578125, //2
        0.087890625, //3
        0.0439453125, //4
        0.02197265625, //5
        0.010986328125, //6
        0.0054931640625, //7
        0.00274658203125, //8
        0.001373291015625, //9
        0.0006866455078125, //10
        0.00034332275390625, //11
        0.000171661376953125, //12
        0.0000858306884765625, //13
        0.00004291534423828125, //14
        0.000021457672119140625, //15
        0.0000107288360595703125, //16
        0.00000536441802978515625, //17
        0.000002682209014892578125 //18
        //0.0000013411045074462890625
    ],
    vectorLayer, drawPoint, markerLayer, measureVL,
    cityName = "湖南省", //当前城市名
    currentSQl, currentPage = 0,
    totalNumb, //poi查询结果总数
    globalCurBounds, //当前地图可视范围
    pageSize = 10, //分页插件每页显示数量
    startRecord = 0,
    isAllSearching, //是否为全局搜索
    isAroudSearchOpen = false, //周边POI查询是否开启
    tenFeatursList = [],
    expectCount = 100;
//保存量算结果，方便换单位是显示数据
var distanceMeasureValueArray = {
    centimeter: 0.0,
    meter: 0.0,
    kilometer: 0.0
};
var areaMeasureValueArray = {
    centimeter: 0.0,
    meter: 0.0,
    kilometer: 0.0,
    squarecentimeter: 0.0,
    squaremeter: 0.0,
    squarekilometer: 0.0
};
var circleMeasureValueArray = {
    centimeter: 0.0,
    meter: 0.0,
    kilometer: 0.0,
    squarecentimeter: 0.0,
    squaremeter: 0.0,
    squarekilometer: 0.0
}

/* 这部分变量是关于路径分析的 */
var startChooise, endChooise, imgIcon, markerStart, markerEnd, markerMid, pathTime, startPointSM, destPointSM, nodeArray = [],
    pathListIndex = 0,
    routeCompsIndex = 0,
    style = {
        strokeColor: "#304DBE",
        strokeWidth: 3,
        pointerEvents: "visiblePainted",
        fill: false
    },
    roadStyle = {
        strokeDashstyle: "solid",
        strokeWidth: 3,
        strokeColor: "#f75564",
        strokeOpacity: 1
    },
    start = document.getElementById("setStart"),
    end = document.getElementById("setEnd");