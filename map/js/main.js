/* 关于登录的 */
function login() {
    var userInfoUrl = "/TDTHN/services/userinfo.json"
    $.get(userInfoUrl, function (result) {
        if (result.id == -1) {
            $("#login").bind("click", gotoLogin);
            $("#sign").bind("click", gotoRegister);
        } else {
            if (typeof top.setuserinfo === "function")
                top.setuserinfo(result);
            if (typeof top.loaduser === "function") {
                top.loaduser(result);
            } else {
                var userHtml = "";
                userHtml += "<ul>";
                userHtml += "<li><a href='#' onclick='getoInfo()'>我的信息</a></li>";
                if (result.roles && result.roles.indexOf("admin") >= 0) {
                    userHtml += "<li><a href='#' onclick='gotoManager()'>后台管理</a></li>";
                }
                userHtml += "<li><a href='#' onclick='gotoPassword()'>修改密码</a></li>";
                userHtml += "<li><a href='#' onclick='logout()'>注销</a></li>";
                userHtml += "</ul>";
                $(".personMsg").html(userHtml);
            }
        }
    })

}

function getoInfo() {
    top.location.href = "/TDTHN/portal/user/userinfo.html";
}

function gotoPassword() {
    top.location.href = "/TDTHN/password.html";
}

function logout() {
    var logoutUrl = "/TDTHN/logout";
    top.location.href = logoutUrl;
}

function gotoManager() {
    top.location.href = "/TDTHN/portal/manager/index.html";
}

function loginBack() {
    top.location.href = "/TDTHN/portal/index.html";
}

function gotoBack() {
    history.go(-1);
}

function gotoLogin() {
    var loginUrl = "/TDTHN/services/login?url=" + top.location.href;;
    top.location.href = loginUrl;
}

function gotoRegister() {
    var registerUrl = "/TDTHN/services/register";
    top.location.href = registerUrl;
}

//点击矢量按钮切换
function showVec() {
    if (isRollingScreenOpen) { //当卷帘打开的时候，点击切换底图功能失效
        return;
    } else {
        $(".elementWrap").fadeOut();
        /* 关闭所有多时相图层 */
        closeAllTimeLayers();
        curType = "vec";
        //getZoomNum(); //该方法写在 map.js  中
        layerGJImg.setVisibility(0);
        layerGJCia.setVisibility(0);
        layerGJVec.setVisibility(1);
        layerGJCva.setVisibility(1);
        layerVec.setVisibility(0);
        layerCva.setVisibility(0);
        layerImg.setVisibility(0);
        layerCia.setVisibility(0);

    }
}

//点击影像按钮切换
function showImg() {
    if (isRollingScreenOpen) {
        return;
    } else {
        curType = "img";
        //getZoomNum();
        layerGJImg.setVisibility(1);
        layerGJCia.setVisibility(1);
        layerGJVec.setVisibility(0);
        layerGJCva.setVisibility(0);
        layerVec.setVisibility(0);
        layerCva.setVisibility(0);
        layerImg.setVisibility(0);
        layerCia.setVisibility(0);
    }
}

//点击街景按钮切换
function showStreet() {
    $(".errorPane").fadeIn();
    $(".errorPane .bottom").text("暂无数据！");
}



//放大按钮
function zoomIn() {
    $("#rKey").css("visibility", "hidden");
    map.zoomIn();
}

//缩小按钮
function zoomOut() {
    $("#rKey").css("visibility", "hidden");
    map.zoomOut();
}

/* 显示湖南底图 */
var ditu = 1; //设置变量值为1的时候，标记为国家地图
function showHNmap() {
    if (ditu == 1) {
        var zoom = map.getZoom();
        if (zoom <= 5) {
            $(".errorPane").fadeIn();
            $(".errorPane .bottom").text("当前级别无湖南节点底图！");
        } else {
            if (curType == "vec") {
                layerGJVec.setVisibility(0);
                layerGJCva.setVisibility(0);
                layerImg.setVisibility(0);
                layerCia.setVisibility(0);
                layerVec.setVisibility(1);
                layerCva.setVisibility(1);
            } else if (curType == "img") {
                layerVec.setVisibility(0);
                layerCva.setVisibility(0);
                layerGJImg.setVisibility(0);
                layerGJCia.setVisibility(0);
                layerImg.setVisibility(1);
                layerCia.setVisibility(1);
            }
        }
        ditu = 2;
        $("#mapPos .tip").html("国家底图");
    } else {
        if (curType == "vec") {
            layerGJVec.setVisibility(1);
            layerGJCva.setVisibility(1);
            layerGJImg.setVisibility(0);
            layerGJCia.setVisibility(0);
            layerVec.setVisibility(0);
            layerCva.setVisibility(0);
        } else if (curType == "img") {
            layerGJVec.setVisibility(0);
            layerGJCva.setVisibility(0);
            layerGJImg.setVisibility(1);
            layerGJCia.setVisibility(1);
            layerImg.setVisibility(0);
            layerCia.setVisibility(0);
        }
        ditu = 1;
        $("#mapPos .tip").html("湖南底图");
    }
}


/* 市点击调整地图范围 */
function zoomToProvincesCities(x1, y1, x2, y2, city) {
    cityName = city
    $(".mapPot span").text(city);
    var bounds = new SuperMap.Bounds(x1, y1, x2, y2);
    map.zoomToExtent(bounds, false);
}

/* 获取市区顺序序号并将对应地名显示 */
$(".downtown li").click(function () {
    $(".citySel .county").html('');
    var index = $(this).index() + 1;
    var url = "../public/city.json";
    $.ajax({
        type: "get",
        url: url,
        async: false,
        success: function (data) {
            obj = data[index];
            for (var i = 0; i < obj.length; i++) {
                var citys = "'" + obj[i].name + "'";
                var citysed = obj[i].name;
                var poi = obj[i].bounds;
                // $(".citySel .county").append(`<li onclick = "zoomToProvincesCities(${poi[0]}, ${poi[1]}, ${poi[2]}, ${poi[3]},'${citys}')">${citys}</li>`);
                $(".citySel .county").append('<li onclick = "zoomToProvincesCities(' + poi[0] + ' ,  ' + poi[1] + ',' + poi[2] + ',' + poi[3] + ',' + citys + ')">' + citysed + '</li>')
            }
        }
    });
});


/* 显示路径查询框 */
function showRoadSearch() {
    clearElements();
    $(".searchPane").fadeOut(300, function () {
        $(".searchRoadPane").fadeIn();
    });
}
/* 关闭历经查询框后显示搜索框 */
function showPoiSearch() {
    clearElements();
    $(".searchRoadPane").fadeOut(300, function () {
        $(".searchPane").fadeIn();
    });
}




/* 與地圖無關的功能 */
$(function () {
    /* 登录状态 */
    login();
    /* 点击菜单按钮显示菜单块 */
    $(".searchLeft").click(function () {
        $(".resultPane").fadeOut(300, function () {
            $(".poiMsg").hide();
            clearElements();
            closeInfoPoi();
            $(".menuPane").fadeIn();
        });
    });
    /* 当搜索框获得焦点 */
    $(".poiSearch").focus(function () {
        $(".menuPane").fadeOut();
    });
    /* 关闭错误弹出框 */
    $(".errorCont i").click(function () {
        $(".errorPane").fadeOut();
        $(".resultPane").fadeOut(); //关闭结果面板
    });
    /* 点击显示市选择栏 */
    var downtownShow = false;
    $(".mapPot").click(function () {
        if (downtownShow) {
            $(".downtown").fadeOut();
            $(".county").fadeOut();
            downtownShow = false;
            $(".citySel .close").fadeOut();
        } else {
            $(".downtown").fadeIn();
            $(".citySel .close").fadeIn();
            downtownShow = true;
        }
    });
    $(".citySel .close").click(function () {
        $(".downtown").fadeOut();
        $(".county").fadeOut();
        downtownShow = false;
        $(".citySel .close").fadeOut();
    });
    $(".downtown>li").click(function () {
        $(".citySel .county").fadeIn();
    });

    /* 关闭poi详细信息弹出框显示poi搜索列表 */
    $(".poiMsg .return").click(function () {
        $(".poiMsg").fadeOut(300, function () {
            closeInfoPoi();
            $(".resultPane").fadeIn();
        });
    });
    /* 点击从这里出发&到这里去执行的功能 */
    $(".routeCont .go").click(function () {
        closeInfoPoi();
        var place = $(".poiMsg .name span").html();
        $(".poiMsg").fadeOut(300, function () {
            showRoadSearch();
            $(".searchRoadPane .startP").val(place);
        });
    });
    $(".routeCont .come").click(function () {
        closeInfoPoi();
        var place = $(".poiMsg .name span").html();
        $(".poiMsg").fadeOut(300, function () {
            showRoadSearch();
            $(".searchRoadPane .endP").val(place);
        });
    });
    /* 3秒后隐藏底图提示框 */
    setTimeout(function () {
        $("#changeMsg").fadeOut();
    }, 3000);
    /* 此处写自动补全功能 */
    $(".startP").on("input", function (e) {
        var key = this.value
        var city = cityName == "湖南省" ? "" : cityName
        $.ajax({
            url: "http://222.247.40.204:4000/search",
            data: {
                key: key,
                size: 5,
                city: city
            },
            success: function (res) {
                var result = JSON.parse(res.result)
                $('.autocompleter-list').html("")
                for (var i = 0; i < result.length; i++) {
                    var value = result[i]
                    $('.autocompleter-list').append('<li data-label="Wisteria" class="autocompleter-item"><i>' + value.name + '</i><span>' + value.city + '</span><span>' + value.district + '</span></li>')
                }
                $('.autocompleter-item').each(function(e,a){
                    $(a).click(function(){
                        $(".startP").val(result[e].name)
                        $('.autocompleter-list').html("")
                    })
                })
            },
            error: function (error) {
                console.log(error)
            }
        })
    })
    $(".endP").on("input", function (e) {
        var key = this.value
        var city = cityName == "湖南省" ? "" : cityName
        $.ajax({
            url: "http://222.247.40.204:4000/search",
            data: {
                key: key,
                size: 5,
                city: city
            },
            success: function (res) {
                var result = JSON.parse(res.result)
                $('.autocompleter-list').html("")
                for (var i = 0; i < result.length; i++) {
                    var value = result[i]
                    $('.autocompleter-list').append('<li data-label="Wisteria" class="autocompleter-item"><i>' + value.name + '</i><span>' + value.city + '</span><span>' + value.district + '</span></li>')
                }
                $('.autocompleter-item').each(function(e,a){
                    $(a).click(function(){
                        $(".endP").val(result[e].name)
                        $('.autocompleter-list').html("")
                    })
                })
            },
            error: function (error) {
                console.log(error)
            }
        })
    })
})
