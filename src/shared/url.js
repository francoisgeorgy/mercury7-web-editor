import * as Utils from "@utils";
import {preferences} from "@shared/preferences";
import {initSize} from "@shared/windowSize";
import store from "storejs";

export const URL_PARAM_SYSEX = "sysex";     // name of sysex parameter in the query-string
export const URL_PARAM_SIZE = "size";       //
export const URL_PARAM_MARGINS = "m";        //
export const URL_PARAM_BG = "bg";           // body background-color
export const URL_PARAM_CLEAR_STORAGE = "deletedata";           // clear local storage

export function handleUrlParameters() {

    const s = Utils.getParameterByName(URL_PARAM_SIZE);
    if (s) {
        let z = preferences.zoom_level;
        switch (s.toUpperCase()) {
            case "0" :
            case "S" :
            case "SMALL" :
                z = 0; break;
            case "1" :
            case "M" :
            case "NORMAL" :
            case "DEFAULT" :
                z = 1; break;
            case "2" :
            case "L" :
            case "LARGE" :
            case "BIG" :
                z = 2; break;
        }
        if (z !== preferences.zoom_level) {
            initSize(z);
        }
    }

    const margins = Utils.getParameterByName(URL_PARAM_MARGINS);
    if (margins) {
        $("#wrapper").css("margin", margins);
    }

    const bg = Utils.getParameterByName(URL_PARAM_BG);
    if (bg) {
        //TODO: check bg validity
        $("body").css("background-color", bg);
    }

    const cs = Utils.getParameterByName(URL_PARAM_CLEAR_STORAGE);
    if (cs) {
        store.clear();
        alert("All local storage used by the Editor has been deleted.");
    }

}
