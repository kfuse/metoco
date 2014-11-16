// Set Global
Metoco = typeof Metoco === "undefined" ? {} : Metoco;
Metoco.Util = typeof Metoco.Util === "undefined" ? {} : Metoco.Util;

/**
 * 汎用的な関数
 * @class Util
 */
Metoco.Util = {
    /**
     * XMLHttpRequestオブジェクトを作成する
     * @method createXHR
     * @return {object} XMLHttpRequestオブジェクト
     */
    createXHR: function() {
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            try {
                return new ActiveXObject("MSXML2.XMLHTTP.6.0");
            } catch (e1) {
                try {
                    return new ActiveXObject("MSXML2.XMLHTTP.3.0");
                } catch (e2) {
                    try {
                        return new ActiveXObject("MSXML2.XMLHTTP");
                    } catch (e3) {
                        return null;
                    }
                }
            }
        } else {
            return null;
        }
    },
    /**
     * イベントをキャンセルする
     * @name preventDefault
     * @static
     * @param {Object} e イベントオブジェクト
     */
    preventDefault: function (e) {
        var eo = e || window.event;
        if (eo.preventDefault) {
            eo.preventDefault();
        } else {
            eo.returnValue = false;
        }
    },
    /**
     * イベントの伝播をキャンセルする
     * @name stopPropagation
     * @static
     * @param {Object} e イベントオブジェクト
     */
    stopPropagation: function (e) {
        var eo = e || window.event;
        if (eo.stopPropagation) {
            eo.stopPropagation();
        } else { 
            eo.cancelBubble = false;
        }
    },
    /**
     * イベントを追加する
     * @name addEvent
     * @param {Object} el イベントを付加させるオブジェクト
     * @param {String} type イベントタイプ
     * @param {Function} fn イベント実行時のコールバック関数
     */
    addEvent: function (elm, type, fn) {
        if (elm) {
            if (elm.attachEvent) {
                elm.attachEvent("on" + type, fn);
            } else if (elm.addEventListener) {
                elm.addEventListener(type, fn, false);
            } else {
                elm["on" + type] = fn;
            }
        }
    },
    /**
     * イベントを削除する
     * @name removeEvent
     * @static
     * @param {Object} el イベントを削除するオブジェクト
     * @param {String} type イベントタイプ
     * @param {Function} fn イベント実行時のコールバック関数
     */
    removeEvent: function (el, type, fn) {
        if (el) {
            if (el.detachEvent) {
                el.detachEvent("on" + type, fn);
            } else if (el.removeEventListener) {
                el.removeEventListener(type, fn, false);
            } else {
                el["on" + type] = null;
            }
        }
    },
    /**
     * 指定したクラス名を追加する
     * @name addClass
     * @static
     * @param {Object} el 
     * @param {String} className 
     */ 
    addClass: function (el, className) {
        if (el) {
            if (!el.className.match(className)) {
                el.className += ' ' + className;
            }
        }
    },
    /**
     * 指定したクラス名を削除する
     * @name removeClass
     * @static
     * @param {Object} el The CSS selector string or DOM node
     * @param {String} className The class name.
     */ 
    removeClass: function (el, className) {
        if (el) {
            el.className = el.className.replace(className, '').replace(/^\s+|\s+$/g, "");
        }
    },
    /**
     * 指定したクラス名に適合する要素の配列を返す
     * @name getElementsByClassName
     * @param {Object} el クラスを取得する要素
     * @param {string} searchClass 検索するクラス
     * @param {string} tag クラスの取得対象の要素種別
     * @return {array} returnArr searchClass名を持つ配列
     */
    getElementsByClassName: function (el, searchClass, tag) {
        if (el) {
            var returnArr = [], els, pattern, i;
            if (typeof document.getElementsByClassName === "function") {
                returnArr = el.getElementsByClassName(searchClass, tag);
            } else { 
                tag = tag || '*';
                els = el.getElementsByTagName(tag);
                pattern = new RegExp('(^|\\s)' + searchClass + '(\\s|$)');
                for (i = 0; i < els.length; i = i + 1) {
                    if (pattern.test(els[i].className)) {
                        returnArr.push(els[i]);
                    }
                }
            }
            return returnArr;
        }
    }
};
