(function(){
Metoco.Slide = typeof Metoco.Slide === "undefined" ? {} : Metoco.Slide;
Metoco.Slide.Setting = {
    INTERVAL: 500,
    API_KEY: "AIzaSyDyoLbguLfL0WOMtomMH8RL7Rw9qIWIHJU",
    debug: true,
    imgSize: "450x450",
    line: "",
    startStation: "",
    endStation: "",
    isActualTime: true,
    stopDuration: 20000
};
Metoco.Slide.Status = {
    current: 0,
    currentStation: "",
    isMoving: false,
    intervalId: null
};
Metoco.Slide.Temp = {
    image: new Image()
};

// console.log(getTotalNecessaryTime(Metoco.Data.travelTime.Hibiya));

function getNecessaryTime(line, startStation, endStation) {
    // {"odpt:fromStation":"odpt.Station:TokyoMetro.Hanzomon.Shibuya","odpt:toStation":"odpt.Station:TokyoMetro.Hanzomon.OmoteSando","odpt:necessaryTime":2,"odpt:trainType":"odpt.TrainType:Local"}
    var i = 0,
        from = "odpt.Station:TokyoMetro." + line + "." + startStation,
        to = "odpt.Station:TokyoMetro." + line + "." + endStation,
        necessaryTime = 0;
    for (i = 0; i < Metoco.Data.travelTime[line].length; i++) {
        if (Metoco.Data.travelTime[line][i]["odpt:fromStation"] === from
            && Metoco.Data.travelTime[line][i]["odpt:toStation"] === to) {
            necessaryTime = Metoco.Data.travelTime[line][i]["odpt:necessaryTime"] - 0;
            necessaryTime = necessaryTime * 60 * 1000;
            necessaryTime -= Metoco.Slide.Setting.stopDuration;
            return necessaryTime;
        }
    }
    return null;
}

function getTotalNecessaryTime(line) {
    var i = 0,
    totalNecessaryTime = 0;
    for (i = 0; i < line.length/2; i++) {
        totalNecessaryTime += line[i]["odpt:necessaryTime"];
    }
    return totalNecessaryTime;
}

function getPoints(points) {
    var i = 0,
        result = [];
    for (i = 0; i < points.length; i++) {
        result[i] = [];
        result[i][0] = points[i][1];
        result[i][1] = points[i][0];
    }
    return result;
}

function reverseArray(array) {
    var i = 0,
        j = 0,
        result = [];
    for (i = 0; i < array.length; i++) {
        j = array.length - 1 - i;
        result[i] = array[j];
    }
    return result;
}

function getNextStation(line, stationName, isReverse) {
    var i = 0,
        indexedStations = [],
        currentStation = 0,
        nextStation = 0;
    for (station in Metoco.Data.stations[line]) {
        indexedStations[i] = station;
        if (station === stationName) {
            currentStation = i;
        }
        i++;
    }
    if (isReverse) {
        return indexedStations[currentStation-1];
    } else {
        return indexedStations[currentStation+1];
    }
}

// 画像を先読み
function loadImage(lat, lon, heading) {
    if (!Metoco.Slide.Setting.debug) {
        Metoco.Slide.Temp.image.src = "http://maps.googleapis.com/maps/api/streetview?size=" + Metoco.Slide.Setting.imgSize + "&location=" + lat + "," + lon + "&heading=" + heading + "&pitch=20&sensor=false&key=" + Metoco.Slide.Setting.API_KEY;
    }
}

// スライドの画像を表示
function putSlideImage(lat, lon, heading) {
    if (!Metoco.Slide.Setting.debug) {
        // http://maps.googleapis.com/maps/api/streetview?size=320x320&location=35.64352,139.69815&heading=48&pitch=20&sensor=false
        document.getElementById("slide").src = "http://maps.googleapis.com/maps/api/streetview?size=" + Metoco.Slide.Setting.imgSize + "&location=" + lat + "," + lon + "&heading=" + heading + "&pitch=20&sensor=false&key=" + Metoco.Slide.Setting.API_KEY;
    }
}

// 方角を取得
function getDegree(from, to) {
    var deg = Math.atan2(to[1]-from[1], to[0]-from[0]) * 180 / Math.PI;
    deg = -deg;
    deg = deg + 90;
    if (deg < 0) {
        deg = 360 + deg;
    }
    deg = Math.floor(deg);
    return deg;
}

Metoco.Slide.init = function(setting) {
    if (!setting) {
        setting = {};
    }
    Metoco.Slide.Setting.INTERVAL = setting.interval || 5000;
    Metoco.Slide.Setting.debug = setting.debug || false;
    Metoco.Slide.Setting.line = setting.line || "Ginza";
    Metoco.Slide.Setting.startStation = setting.startStation || "Asakusa";
    Metoco.Slide.Setting.endStation = setting.endStation || "Shibuya";
    Metoco.Slide.Setting.isActualTime = setting.isActualTime || false;
    Metoco.Slide.Setting.stopDuration = setting.stopDuration || 20000;
    Metoco.Slide.Status.current = 0;
    Metoco.Slide.Status.currentStation = Metoco.Slide.Setting.startStation;
    if (window.innerWidth > 500) {
        Metoco.Slide.Setting.imgSize = "640x640";
    }
};

function showPosition(from, to) {
    var position = document.getElementById("position");
    if (to === undefined) {
        position.innerHTML = Metoco.Data.stationName[from];
    } else {
        position.innerHTML = "<em>" + Metoco.Data.stationName[from] + "</em><span>&gt;</span><span>&gt;</span><span>&gt;</span><span>&gt;</span><span>&gt;</span><span>&gt;</span><em>" + Metoco.Data.stationName[to] + "</em>";
    }
}

Metoco.Slide.stop = function() {
    clearInterval(Metoco.Slide.Status.intervalId);
    Metoco.Slide.Status.intervalId = null;
    Metoco.Slide.Status.isMoving = false;
    document.getElementById("slide").src = "";
}

/**
 * ビューを開始
 * 路線、開始駅、終了駅などを取得してstartMovingに渡す
 */
Metoco.Slide.start = function() {
    var start = 0,
        end = 0,
        next = 0,
        nextStation = "",
        line = Metoco.Slide.Setting.line,
        isReverse = false,
        isStarted = false,
        points = [];

    points = Metoco.Data.linePoints[line];
    start = Metoco.Data.stations[line][Metoco.Slide.Status.currentStation].index;
    end = Metoco.Data.stations[line][Metoco.Slide.Setting.endStation].index;
    isReverse = start > end ? true : false;
    nextStation = getNextStation(line, Metoco.Slide.Status.currentStation, isReverse)
    next = Metoco.Data.stations[line][nextStation].index;

    putSlideImage(points[start][1], points[start][0], 0);

    if (isReverse) {
        start--;
    } else {
        start++;
    }

    // 画像が読み込まれたらスライドをスタート
    if (!Metoco.Slide.Setting.debug) {
        document.getElementById("slide").onload = function() {
            if (isStarted) {
                return;
            }
            isStarted = true;
            document.getElementById("slide").onload = function() {};
            startMoving(line, start);
        };
        setTimeout(function() {
            if (isStarted) {
                return;
            }
            isStarted = true;
            startMoving(line, start);
        }, 5000);
    } else {
        startMoving(line, start);
    }
};

/**
 * スライドを開始
 * @param {string} line 路線
 * @param {number} start 開始位置
 */
function startMoving(line, start) {
    var isReverse = false,
        interval = 0,
        next = 0,
        nextStation = "",
        end = Metoco.Data.stations[line][Metoco.Slide.Setting.endStation].index,
        points = [];

    // 既に開始済みならスキップ
    if (Metoco.Slide.Status.isMoving) {
        return;
    }
    Metoco.Slide.Status.isMoving = true;

    points = Metoco.Data.linePoints[line];
    isReverse = start > end ? true : false;
    Metoco.Slide.Status.current = start;
    nextStation = getNextStation(line, Metoco.Slide.Status.currentStation, isReverse);
    next = Metoco.Data.stations[line][nextStation].index;
    // console.log("next station: " + nextStation);
    showPosition(Metoco.Slide.Status.currentStation, nextStation);

    // 間隔を取得
    if (Metoco.Slide.Setting.isActualTime) {
        necessaryTime = getNecessaryTime(line, Metoco.Slide.Status.currentStation, nextStation);
        interval = Math.floor(necessaryTime / Math.abs(next - start));
        // console.log("interval: " + interval);
    } else {
        interval = Metoco.Slide.Setting.INTERVAL;
    }

    // インターバルをセット
    Metoco.Slide.Status.intervalId = setInterval(function() {
        var from,
            to,
            deg,
            necessaryTime = 0,
            interval = 0;

        // 起点、終点を取得
        from = points[Metoco.Slide.Status.current];
        if (isReverse) {
            to = points[Metoco.Slide.Status.current-1];
        } else {
            to = points[Metoco.Slide.Status.current+1];
        }
        if (typeof to === "undefined") {
            to = from;
        }

        // 方角を取得
        deg = getDegree(from, to);
        // console.log("degree: " + deg);
        // console.log("lat: " + from[1] + ", lon: " + from[0]);

        putSlideImage(points[Metoco.Slide.Status.current][1], points[Metoco.Slide.Status.current][0], deg);

        // 終点に到達した場合
        if (Metoco.Slide.Status.current === end) {
            Metoco.Slide.stop();
            // console.log("end");
            showPosition(Metoco.Slide.Status.currentStation);
            return;
        }
        // 次の駅に到着した場合
        if (Metoco.Slide.Status.current === next) {
            Metoco.Slide.Status.currentStation = nextStation;
            showPosition(Metoco.Slide.Status.currentStation);
            Metoco.Slide.stop();
            if (Metoco.Slide.Setting.isActualTime) {
                setTimeout(function() {
                    startMoving(line, Metoco.Slide.Status.current);
                }, Metoco.Slide.Setting.stopDuration);
            } else {
                startMoving(line, Metoco.Slide.Status.current);
            }
            // console.log("continue");
        }
        // 次の画像を準備
        if (isReverse) {
            Metoco.Slide.Status.current--;
            from = points[Metoco.Slide.Status.current];
            to = points[Metoco.Slide.Status.current-1];
        } else {
            Metoco.Slide.Status.current++;
            from = points[Metoco.Slide.Status.current];
            to = points[Metoco.Slide.Status.current+1];
        }
        if (typeof to === "undefined") {
            to = from;
        }
        deg = getDegree(from, to);
        loadImage(points[Metoco.Slide.Status.current][1], points[Metoco.Slide.Status.current][0], deg);
    }, interval);
}

})();
