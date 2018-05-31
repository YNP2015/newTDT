/* poi查询之后地图上坐标点的点击事件 */

function clickSearchResultPanel(smx, smy, num) {
    map.setCenter(new SuperMap.LonLat(smx, smy), 15);
    poiPointSelect(tenFeatursList[num]);
}

function poiPointSelect(selectFeature) {
    console.log(selectFeature);
    var poiName, poiContent;
    if ((selectFeature.attributes["TYPENAME1"] || selectFeature.attributes["TYPENAME1"] == "") && selectFeature.attributes["SkyPanoID"] == undefined) {
        poiName = selectFeature.attributes["RNAME"];
    }else{

    }
}

function onVectorLayerFeatureUnselect() {
    map.removeAllPopup();
}