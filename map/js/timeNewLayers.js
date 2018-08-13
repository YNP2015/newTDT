var timeLayerName = [];
var timeLayerYear = [];
var timeLayerUrl = [];
var timeNum = 2017;


function getImgResult() {

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
            timeLayerName = [];
            timeLayerYear = [];
            timeLayerUrl = [];
            for (var i = 0; i < result.length; i++) {
                if (result[i].name.search("0.5米") == -1 && result[i].name.search("1米") == -1) {
                    timeLayerName.push(result[i].name);
                    timeLayerYear.push(result[i].year);
                    timeLayerUrl.push(result[i].url);
                }
            }
            // console.log(timeLayerYear);
            startSlider(timeLayerYear);
            $(".elementWrap p span").text(timeLayerYear);
        }
    })
}


/* 启动滑块功能 */
function startSlider(current) {
    var selector = '[data-rangeslider]';
    $(document).on('input', selector, function (e) {
        valueOutput(e.target);
    });
    $(selector).rangeslider({
        polyfill: false
    });
    var attributes = {
        max: current.length,
    };
    $(selector).attr(attributes).rangeslider('update', true);
    var value = current.length;
    for (var a = 0; a < value; a++) {
        if (timeLayerYear[a] == timeNum) {
            value = a + 1;
        }else{
            value = current.length;
        }
    }
    $(selector).val(value).change();
}

function valueOutput(element) {
    var value = element.value; //当前滑动条的位置 从1开始计数
    var output = element.parentNode.getElementsByTagName('output')[0];
    var a = value - 1; //滑动条对应数组位置
    output.innerHTML = timeLayerYear[a];
    showYearLayers(timeLayerYear[a]);
    timeNum = output.innerHTML;
}

function showYearLayers(a) {
    var x = map.getCenter().lat;
    var y = map.getCenter().lon;
    map.setCenter(new SuperMap.LonLat(y, x), 14);
    if (a == "2012") {
        layer2012.setVisibility(1);
        layer2013.setVisibility(0);
        layer2014.setVisibility(0);
        layer2015.setVisibility(0);
        layer2016.setVisibility(0);
        layer2017.setVisibility(0);
    } else if (a == "2013") {
        layer2012.setVisibility(0);
        layer2013.setVisibility(1);
        layer2014.setVisibility(0);
        layer2015.setVisibility(0);
        layer2016.setVisibility(0);
        layer2017.setVisibility(0);
    } else if (a == "2014") {
        layer2012.setVisibility(0);
        layer2013.setVisibility(0);
        layer2014.setVisibility(1);
        layer2015.setVisibility(0);
        layer2016.setVisibility(0);
        layer2017.setVisibility(0);
    } else if (a == "2015") {
        layer2012.setVisibility(0);
        layer2013.setVisibility(0);
        layer2014.setVisibility(0);
        layer2015.setVisibility(1);
        layer2016.setVisibility(0);
        layer2017.setVisibility(0);
    } else if (a == "2016") {
        layer2012.setVisibility(0);
        layer2013.setVisibility(0);
        layer2014.setVisibility(0);
        layer2015.setVisibility(0);
        layer2016.setVisibility(1);
        layer2017.setVisibility(0);
    } else if (a == "2017") {
        layer2012.setVisibility(0);
        layer2013.setVisibility(0);
        layer2014.setVisibility(0);
        layer2015.setVisibility(0);
        layer2016.setVisibility(0);
        layer2017.setVisibility(1);
    } else {
        $(".errorPane").fadeIn();
        $(".errorPane .bottom").text("数据出错！");
        return;
    }
}