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
    }
};
