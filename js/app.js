(function(){
Metoco.Location = {
    lat: "",
    lon: "",
    radius: 500,
    // radius: 2000,
    stations: [],
    station: "",
    lines: [],
    line: "",
    direction: "",
    drillDown: false,
    isActualTime: true,
    scene: ""
};

var trialCount = 0;
// getLocation();
$(function() {
    var array = ["img/bg1.jpg","img/bg2.jpg","img/bg3.jpg","img/bg4.jpg","img/bg5.jpg"];
    var l=array.length;
    var r=Math.floor(Math.random()*l);
    var imgurl = "url("+array[r]+")";
    $(".start").css({"background-image":imgurl});
});
/*
jQuery(function($) {
$('.start').bgSwitcher({
images: ['img/bg1.jpg', 'img/bg2.jpg', 'img/bg3.jpg', 'img/bg4.jpg', 'img/bg5.jpg'],
interval: 4000,
effect: "fade"
});
});
*/

function getLocation() {
    if (!navigator.geolocation) {
        Metoco.Location.drillDown = true;
        showAllLines();
        return;
    }
    showLoading();
    navigator.geolocation.getCurrentPosition(
        function(position) {
            Metoco.Location.lat = position.coords.latitude;
            Metoco.Location.lon = position.coords.longitude;
            getStation();
        },
        function() {
            hideMenu();
            Metoco.Location.drillDown = true;
            showAllLines();
            /*
            Metoco.Location.lat = "35.678156";
            Metoco.Location.lon = "139.705678";
            getStation();
            */
        }
    );
}

function getStation() {
    var xhr = Metoco.Util.createXHR();
    try {
    xhr.open("GET", "https://api.tokyometroapp.jp/api/v2/places?rdf:type=odpt:Station&lon=" + Metoco.Location.lon + "&lat=" + Metoco.Location.lat + "&radius=" + Metoco.Location.radius + "&acl:consumerKey=913f9f2f3c50040ce394a4429f9b7ccf2c27396bf213d69290b1ab2fb81523fd");
    } catch (e) {
        document.getElementById("loading").innerHTML = '<p>データの取得に失敗しました</p>';
        setTimeout(function() {
            Metoco.Location.drillDown = true;
            hideMenu();
            showAllLines();
        }, 1000);
        return;
    }
    xhr.send(null);
    trialCount++;
    xhr.onreadystatechange = function() {
        var res;
        if (xhr.readyState === 4) {
            if(xhr.status === 200) {
                res = JSON.parse(xhr.responseText);
                if (res.length === 0) {
                    Metoco.Location.radius += 100;
                    if (trialCount < 6) {
                        setTimeout(getStation, 1000);
                        // console.log(trialCount);
                    } else {
                        document.getElementById("loading").innerHTML = '<p>現在地の取得に失敗しました</p>';
                        setTimeout(function() {
                            Metoco.Location.drillDown = true;
                            hideMenu();
                            showAllLines();
                        }, 1000);
                    }
                    return;
                }
                hideMenu();
                showStation(res);
            } else {
                document.getElementById("loading").innerHTML = '<p>現在地の取得に失敗しました</p>';
                setTimeout(function() {
                    Metoco.Location.drillDown = true;
                    hideMenu();
                    showAllLines();
                }, 1000);
            }
        }
    };
}

function showLoading() {
    document.getElementById("start-btn").style.display = "none";
    document.getElementById("loading").style.display = "block";
    document.getElementById("loading").innerHTML = '<p class="loadingImg">現在地を取得しています...</p>';
}

function showMenu() {
    var array = ["img/bg1.jpg","img/bg2.jpg","img/bg3.jpg","img/bg4.jpg","img/bg5.jpg"],
        l = array.length,
        r = Math.floor(Math.random()*l),
        imgurl = "url("+array[r]+")";
    /*
    var html = "";
    html = '<ul>';
    html += '<li data-type="mode" data-value="realtime" class="mode">位置情報から乗車駅を選ぶ</li>';
    html += '<li data-type="mode" data-value="remote" class="mode">路線名から乗車駅を選ぶ</li>';
    html += '</ul>';
    */
    // document.getElementById("msg").innerHTML = "メトロの車窓から";
    // document.getElementById("location").innerHTML = html;
    // document.getElementById("location").style.display = "block";
    trialCount = 0;
    $(".start").css({"background-image":imgurl});
    resetSetting();
    document.getElementById("header").style.display = "none";
    document.getElementById("loading").style.display = "none";
    document.getElementById("btn-prev").style.display = "none";
    document.getElementById("logo").style.display = "block";
    document.getElementById("welcome").style.display = "block";
    document.getElementById("start-btn").style.display = "block";
    // $('.start').bgSwitcher("start");
    Metoco.Util.addClass(document.getElementById("wrapper"), "start");
}

function hideMenu() {
    document.getElementById("wrapper").style.backgroundImage = "";
    document.getElementById("header").style.display = "block";
    document.getElementById("loading").style.display = "none";
    document.getElementById("location").style.display = "block";
    document.getElementById("logo").style.display = "none";
    document.getElementById("welcome").style.display = "none";
    document.getElementById("start-btn").style.display = "none";
    document.getElementById("btn-back").innerHTML = '<a href="#" class="ui-btn" id="btnTop">スタート画面に戻る</a>';
    // $('.start').bgSwitcher("stop");
    Metoco.Util.removeClass(document.getElementById("wrapper"), "start");
}

function refreshBtnArea() {
    document.getElementById("btn-back").innerHTML = "";
}

function resetSetting() {
    Metoco.Location.lat = "";
    Metoco.Location.lon = "";
    Metoco.Location.stations = [];
    Metoco.Location.station = "";
    Metoco.Location.lines = [];
    Metoco.Location.line = "";
    Metoco.Location.direction = "";
    Metoco.Location.drillDown = false;
    Metoco.Location.isActualTime = true;
    Metoco.Location.scene = "";
}

function setScene(scene) {
    switch (scene) {
        case "line":
            document.getElementById("wrapper").setAttribute("data-title", "路線を選んでください");
            // document.getElementById("wrapper").dataset.title = "路線を選んでください";
            document.getElementById("msg").innerHTML = "路線を選んでください";
            Metoco.Location.scene = "line";
            break;
        case "station":
            document.getElementById("wrapper").setAttribute("data-title", "乗車駅を選んでください");
            // document.getElementById("wrapper").dataset.title = "乗車駅を選んでください";
            document.getElementById("msg").innerHTML = "乗車駅を選んでください";
            Metoco.Location.scene = "station";
            break;
        case "direction":
            document.getElementById("wrapper").setAttribute("data-title", "進行方向を選んでください");
            // document.getElementById("wrapper").dataset.title = "進行方向を選んでください";
            document.getElementById("msg").innerHTML = "進行方向を選んでください";
            Metoco.Location.scene = "direction";
            break;
        default:
            break;
    }
}

function showStation(res) {
    var i = 0,
        j = 0,
        isNew = true,
        station = "",
        html = "";
    for (i = 0; i < res.length; i++) {
        isNew = true;
        station = res[i]["owl:sameAs"].split(".")[3];
        for (j = 0; j < Metoco.Location.stations.length; j++) {
            // console.log("array: " + Metoco.Location.stations[j]);
            if (station === Metoco.Location.stations[j]) {
                isNew = false;
            }
        }
        // console.log("res: " + res[i]["dc:title"] + ", new: " + isNew);
        if (isNew) {
            Metoco.Location.stations.push(station);
            continue;
        }
    }
    // document.getElementById("location").innerHTML = Metoco.Location.stations;
    for (i = 0; i < Metoco.Location.stations.length; i++) {
        html += '<a data-type="station" data-value="' + Metoco.Location.stations[i] + '" class="list ui-btn">' + Metoco.Data.stationName[Metoco.Location.stations[i]] + '</a>';
    }
    document.getElementById("location").innerHTML = html;
    // document.getElementById("btn-back").innerHTML = '<a href="#" class="ui-btn" id="otherStation">その他の乗車駅を選ぶ</a>';
    document.getElementById("btn-back").innerHTML = '<a href="#" class="ui-btn" id="btnTop">スタート画面に戻る</a>';
    setScene("station");
}

function showLines(station, res) {
    var i = 0,
        j = 0,
        line = "",
        isNew = true,
        html = "";
    for (i = 0; i < res.length; i++) {
        isNew = true;
        if (res[i]["dc:title"] !== station) {
            continue;
        }
        for (j = 0; j < Metoco.Location.lines.length; j++) {
            if (res[i]["odpt:railway"] === Metoco.Location.lines[j]) {
                isNew = false;
            }
        }
        if (isNew) {
            line = res[i]["odpt:railway"].replace("odpt.Railway:TokyoMetro.", "");
            Metoco.Location.lines.push(line);
            continue;
        }
    }
    // document.getElementById("location").innerHTML = Metoco.Location.stations;
    html = '<ul>';
    for (i = 0; i < Metoco.Location.lines.length; i++) {
        html += '<li data-type="line" data-value="' + Metoco.Location.lines[i] + '" class="list close"><a href="#" class="ui-btn">' + Metoco.Data.lines[Metoco.Location.lines[i]] + '</a></li>';
    }
    html += '</ul>';
    document.getElementById("btn-prev").style.display = "block";
    document.getElementById("location").innerHTML = html;
    setScene("line");
}

function showAllLines() {
    var item,
        html = "";
    html = '<ul>';
    for (item in Metoco.Data.lines) {
        html += '<li data-type="line" data-value="' + item + '" class="list close"><a href="#" class="ui-btn">' + Metoco.Data.lines[item] + '</a></li>';
    }
    html += '</ul>';
    document.getElementById("location").innerHTML = html;
    setScene("line");
}

function showDirection(target, line) {
    var i = 0,
        a,
        ul,
        li,
        html = "",
        parent = target,
        terminal = "";
    // console.log("line: " + line);
    // remove existing elements
    hideDirection(target);
    // create elements
    /*
    li = document.createElement("li");
    li.setAttribute("class", "list child");
    target.parentNode.insertBefore(li, target.nextSibling);
    html = '<ul>';
    */
    if (Metoco.Util.getElementsByClassName(target, "direction", "a").length === 0) {
        if (!Metoco.Location.drillDown) {
            ul = document.createElement("ul");
            parent.appendChild(ul);
            parent = ul;
            li = document.createElement("li");
            /*
            li.setAttribute("data-type", "station");
            li.setAttribute("data-value", Metoco.Location.station);
            li.setAttribute("class", "stations");
            */
            li.dataset.type = "station";
            li.dataset.value = Metoco.Location.station;
            li.className = "stations";
            parent.appendChild(li);
            parent = li;
            // html += '<li data-type="station" data-value="' + Metoco.Location.Station + '" class="stations close"></li>';
        }
        for (i = 1; i >= 0; i--) {
            terminal = Metoco.Data.terminal[line][i];
            if (Metoco.Location.station === terminal) {
                continue;
            }
            a = document.createElement("a");
            a.setAttribute("class", "direction ui-btn");
            a.setAttribute("data-type", "direction");
            a.setAttribute("data-value", terminal);
            /*
            a.dataset.type = "direction";
            a.dataset.value = terminal;
            a.className = "direction ui-btn";
            */
            a.appendChild(document.createTextNode(Metoco.Data.stationName[terminal] + "方面に乗る"));
            parent.appendChild(a);
            // html += '<li data-type="direction" data-value="' + terminal + '" class="direction">' + Metoco.Data.stationName[terminal] + '方面に乗る' + '</li>';
            /*
            li = document.createElement("li");
            li.setAttribute("class", "direction");
            li.setAttribute("data-type", "direction");
            li.setAttribute("data-value", terminal);
            li.appendChild(document.createTextNode(Metoco.Data.stationName[terminal] + "方面に乗る"));
            target.parentNode.insertBefore(li, target.nextSibling);
            */
        }
        if (!Metoco.Location.drillDown) {
            parent = target;
        }
    }
    /*
    html += '</ul>';
    li.innerHTML = html;
    */
    parent.className = parent.className.replace("close", "open");
    setScene("direction");
}

function showAllStations(target, line) {
    var i = 0,
        item,
        li,
        html = "";
    // remove existing elements
    hideStations(target);
    // create elements
    li = document.createElement("li");
    // li.setAttribute("class", "list child");
    li.className = "list child";
    target.parentNode.insertBefore(li, target.nextSibling);
    html = '<ul class="' + Metoco.Location.line + '">';
    for (item in Metoco.Data.stations[line]) {
        // html += '<li data-type="station" data-value="' + item + '" class="stations close">' + Metoco.Data.stationName[item] + '</li>';
        html += '<li data-type="station" data-value="' + item + '" class="stations close"><a href="#" class="ui-btn">' + Metoco.Data.stationName[item] + '</a></li>';
    }
    html += '</ul>';
    li.innerHTML = html;
    target.className = target.className.replace("close", "open");
    document.getElementById("btn-prev").style.display = "block";
    setScene("station");
}

function hideDirection(target) {
    var i = 0,
        items = Metoco.Util.getElementsByClassName(target.parentNode, "stations", "li");

    if (!Metoco.Location.drillDown) {
        items = Metoco.Util.getElementsByClassName(target.parentNode, "list", "li");
        for(i = 0; i < items.length; i++) {
            items[i].className = items[i].className.replace("open", "close");
        }
        return;
    }
    for(i = 0; i < items.length; i++) {
        items[i].className = items[i].className.replace("open", "close");
    }
    items = Metoco.Util.getElementsByClassName(target.parentNode, "child", "li");
    for(i = 0; i < items.length; i++) {
        target.parentNode.removeChild(items[i]);
    }
}

function hideStations(target) {
    var i = 0,
        items = Metoco.Util.getElementsByClassName(target.parentNode, "list", "li");
    for(i = 0; i < items.length; i++) {
        items[i].className = items[i].className.replace("open", "close");
    }
    items = Metoco.Util.getElementsByClassName(target.parentNode, "child", "li");
    for(i = 0; i < items.length; i++) {
        target.parentNode.removeChild(items[i]);
    }
}

function onClickMode(target) {
    var mode = target.getAttribute("data-value");
    // var mode = $(target).data("value");
    if (mode === "realtime") {
        getLocation();
    } else {
        Metoco.Location.drillDown = true;
        // Metoco.Location.isActualTime = false;
        hideMenu();
        showAllLines();
    }
}

function onClickStation(target) {
    var xhr = Metoco.Util.createXHR(),
        station = Metoco.Data.stationName[target.getAttribute("data-value")];
        // station = Metoco.Data.stationName[$(target).data("value")];
    Metoco.Location.station = target.getAttribute("data-value");
    // Metoco.Location.station = $(target).data("value");
    // refreshBtnArea();
    if (target.className.match(/open/)) {
    // if ($(target).hasClass("open")) {
        hideDirection(target);
        setScene("station");
        return;
    }
    if (Metoco.Location.drillDown) {
        target.className = target.className.replace("close", "open");
        /*
        $(target).removeClass("close");
        $(target).addClass("open");
        */
        showDirection(target, Metoco.Location.line);
        return;
    }
    station = station.replace("<", "〈");
    station = station.replace(">", "〉");
    xhr.open("GET", "https://api.tokyometroapp.jp/api/v2/datapoints?rdf:type=odpt:Station&dc:title=" + encodeURI(station) + "&acl:consumerKey=913f9f2f3c50040ce394a4429f9b7ccf2c27396bf213d69290b1ab2fb81523fd");
    xhr.send(null);
    xhr.onreadystatechange = function() {
        var res;
        if (xhr.readyState === 4) {
            if(xhr.status === 200) {
                res = JSON.parse(xhr.responseText);
                showLines(station, res);
            } else {
            }
        }
    };
}

function onClickLine(target) {
    var line = target.getAttribute("data-value");
    // var line = $(target).data("value");
    Metoco.Location.line = line;
    if (target.className.match(/open/)) {
        if (Metoco.Location.drillDown) {
            document.getElementById("btn-prev").style.display = "none";
            hideStations(target);
            setScene("line");
        } else {
            hideStations(target);
            setScene("line");
        }
        return;
    }
    if (Metoco.Location.drillDown) {
        target.className = target.className.replace("close", "open");
        showAllStations(target, line);
        return;
    }
    target.className = target.className.replace("close", "open");
    showDirection(target, line);
    setScene("station");
}

function onClickDirection(target) {
    Metoco.Slide.init({
        debug: false,
        interval: 5000,
        line: Metoco.Location.line,
        startStation: Metoco.Location.station,
        endStation: Metoco.Location.direction,
        isActualTime: Metoco.Location.isActualTime
    });

    document.getElementById("btn-back").innerHTML = '<a href="#" class="ui-btn" id="btnStop">スタート画面に戻る</a>';
    document.getElementById("result").style.display = "block";
    document.getElementById("location").style.display = "none";
    document.getElementById("btn-prev").style.display = "none";
    document.getElementById("msg").style.display = "none";
    Metoco.Util.addClass(document.getElementById("result"), Metoco.Location.line);
    Metoco.Util.addClass(document.getElementById("wrapper"), "end");
    window.scrollTo(0, 0);
    Metoco.Slide.start();
}

// イベント登録
Metoco.Util.addEvent(document.getElementById("btn-back"), "click", function(e) {
    var ev = e || window.event,
        target = ev.target || ev.srcElement;
    Metoco.Util.preventDefault(ev);
    // switch (target.getAttribute("id")) {
    switch (target.id) {
        case "btnTop":
            document.getElementById("location").style.display = "none";
            showMenu();
            break;
        case "btnStop":
            Metoco.Slide.stop();
            document.getElementById("result").style.display = "none";
            document.getElementById("msg").style.display = "block";
            Metoco.Util.removeClass(document.getElementById("wrapper"), "end");
            showMenu();
            break;
        case "otherStation":
            Metoco.Location.drillDown = true;
            showAllLines();
            break;
        default:
            break;
    }
    refreshBtnArea();
    return false;
}, false);

Metoco.Util.addEvent(document.getElementById("btn-prev"), "click", function(e) {
    var ev = e || window.event,
        target;
    Metoco.Util.preventDefault(ev);
    Metoco.Util.stopPropagation(ev);
    if (Metoco.Location.drillDown) {
        if (Metoco.Location.scene === "station") {
            showAllLines();
            Metoco.Util.removeEvent("btn-prev", "click", false);
            document.getElementById("btn-prev").style.display = "none";
            setScene("line");
        } else {
            hideDirection(Metoco.Util.getElementsByClassName(document.getElementById("location"), "direction", "li")[0]);
            // console.log(Metoco.Util.getElementsByClassName(document.getElementById("location"), "stations open", "a"));
            hideDirection(Metoco.Util.getElementsByClassName(document.getElementById("location"), "stations open", "a")[0]);
            setScene("station");
        }
    } else {
        if (Metoco.Location.scene === "line") {
            Metoco.Location.lines = [];
            getLocation();
            document.getElementById("btn-prev").style.display = "none";
            setScene("station");
        } else {
            target = Metoco.Util.getElementsByClassName(document.getElementById("location"), "open", "li")[0];
            hideDirection(target);
            setScene("line");
        }
    }
}, false);

Metoco.Util.addEvent(document.getElementById("start-btn"), "click", function(e) {
    var ev = e || window.event,
        target = ev.target || ev.srcElement;
    Metoco.Util.preventDefault(ev);
    onClickMode(target);
}, false);

Metoco.Util.addEvent(document.getElementById("location"), "click", function(e) {
    var ev = e || window.event,
        target = ev.target || ev.srcElement;
    Metoco.Util.preventDefault(ev);
    Metoco.Util.stopPropagation(ev);

    // switch (target.parentNode.getAttribute("data-type")) {
    switch (target.parentNode.getAttribute("data-type")) {
        case "mode":
            onClickMode(target);
            break;
        case "station":
            if (target.getAttribute("data-type") === "direction") {
            // if ($(target).data("type") === "direction") {
                Metoco.Location.direction = target.getAttribute("data-value");
                // Metoco.Location.direction = $(target).data("value");
                onClickDirection(target.parentNode);
            } else {
                onClickStation(target.parentNode);
            }
            break;
        case "line":
            onClickLine(target.parentNode);
            break;
        case "direction":
            onClickDirection(target.parentNode);
            break;
        default:
            onClickStation(target);
            break;
    }
    /*
    console.log("data-type: " + ev.target.parentNode.getAttribute("data-type"));
    console.log("data-value: " + ev.target.parentNode.getAttribute("data-value"));
    console.log("innerHTML: " + ev.target.parentNode.innerHTML);
    */
}, false);

})();

