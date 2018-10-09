var yearSets = {}
var years = []
var timeNum = 2017;

var currentYear = '2017年';
var lastYear = '2017'
$("#yearSilder").ionRangeSlider({
    "type": "single",
    "grid": true,
    grid_snap: true,
    "values": ['2017年'],
    onFinish: function (data) {
        currentYear = data.from_value.toString()
        valueOutput(data.from_value)
    }
});

function getImgResult() {
    var lon = map.getCenter();
    var zoom = map.getZoom()
    $.ajax({
        url: "http://222.247.40.204:5656/Jk/services/yx/getyxbypoint",
        type: "post",
        data: {
            "lon": lon.lon,
            "lat": lon.lat,
            "lev": zoom + 1
        },
        dataType: "json",
        success: function (result) {
            yearSets = {}
            years = []
            if (result.length <= 0) {
                startSlider(['2017年']);
            }
            for (var i = 0; i < result.length; i++) {
                var year = result[i].year
                if (result[i].name.indexOf("0.5米") != -1) {
                    year += "年(0.5米)"
                } else if (result[i].name.indexOf("1米") != -1) {
                    year += "年(1米)"
                } else {
                    year += "年"
                }
                years.push(year)
                yearSets[year] = {
                    name: result[i].name,
                    year: year,
                    url: result[i].url
                }
                console.log(yearSets)
            }
            startSlider(years);
        }
    })
}


/* 启动滑块功能 */
function startSlider(current) {

    var slider = $("#yearSilder").data("ionRangeSlider");
    if (current.length == 1) {
        slider.update({
            values: [current[0], current[0]],
            from: current.length,
            disable: true
        });
        currentYear = slider.result.from_value.toString()
        valueOutput(slider.result.from_value)
    } else {
        var fromValue = current.length
        if (current.indexOf(currentYear) != -1) {
            fromValue = current.indexOf(currentYear)
        } else {

            valueOutput(current[current.length - 1])
        }
        slider.update({
            values: current,
            from: fromValue,
            disable: false
        });
    }
    // Call sliders update method with any params
}

function valueOutput(year) {
    showYearLayers(year);
    timeNum = year;
}

function showYearLayers(year) {
    var slayer = map.getLayersByName("多时相")
    if (slayer && slayer.length > 0) {
        slayer.forEach(function (layer) {
            map.removeLayer(layer)
            layer.destroy()
        });
    }
    if (year == '2017年') {
        return
    }
    if (yearSets.length <= 0) {
        return
    }
    console.log(year)
    var Ylayer = new SuperMap.Layer.TiledDynamicRESTLayer("多时相", yearSets[year].url, {
        transparent: true,
        cacheEnabled: true
    }, {
        resolutions: restLayerResolutions
    })
    Ylayer.events.on({
        "layerInitialized": function (layer) {
            map.addLayer(layer)
            map.setLayerIndex(layerCia, 99) //影像注记设置高得多显示index    
        }
    });
}