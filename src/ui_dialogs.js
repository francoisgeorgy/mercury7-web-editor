import * as lity from "lity";
import {log} from "./debug";
import {URL_PARAM_SYSEX} from "./constants";
import * as Utils from "./utils";
import MODEL from "./model";

let dialogLightbox = null;

export function openCreditsDialog() {
    dialogLightbox = lity("#credits-dialog");
    return false;   // disable the normal href behavior when called from an onclick event
}

export function printPreset() {
    log("printPreset");
    // let url = "print.html?" + URL_PARAM_SYSEX + "=" + encodeURIComponent(LZString.compressToBase64(Utils.toHexString(MODEL.getSysEx())));
    let url = "print.html?" + URL_PARAM_SYSEX + "=" + encodeURIComponent(Utils.toHexString(MODEL.getPreset()));
    window.open(url, "_blank", "width=700,height=500,top=100,left=200,location,resizable,scrollbars,status");
    return false;   // disable the normal href behavior when called from an onclick event
}
