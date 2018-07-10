var timeLayerName = [];
var timeLayerYear = [];
var timeLayerUrl = [];


function getImgResult() {
    timeLayerName = [];
    timeLayerYear = [];
    timeLayerUrl = [];
    var lon = map.getExtent();
    $.ajax({
        url: "http://222.247.40.204:5656/Jk/services/yx/getyx",
        type: "post",
        data: {
            "top": lon.top,
            "bottom": lon.bottom,
            "left": lon.left,
            "right": lon.right
        },
        dataType: "json",
        success: function (result) {
            for (var i = 0; i < result.length; i++) {
                if (result[i].name.search("0.5米") == -1 && result[i].name.search("1米") == -1) {
                    timeLayerName.push(result[i].name);
                    timeLayerYear.push(result[i].year);
                    timeLayerUrl.push(result[i].url);
                } 
            }
            console.log(timeLayerName);
            console.log(timeLayerYear);
            console.log(timeLayerUrl);
        }
    })
}