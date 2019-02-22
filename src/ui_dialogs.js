import * as lity from "lity";
import {log} from "./debug";
import {URL_PARAM_SYSEX} from "./constants";
import * as Utils from "./utils";
import DEVICE from "./model";

let dialogLightbox = null;

export function openHelpDialog() {
    dialogLightbox = lity("#help-dialog");
    return false;   // disable the normal href behavior
}

export function openCreditsDialog() {
    dialogLightbox = lity("#credits-dialog");
    return false;   // disable the normal href behavior
}

export function printPreset() {
    log("printPreset");
    // let url = "print.html?" + URL_PARAM_SYSEX + "=" + encodeURIComponent(LZString.compressToBase64(Utils.toHexString(DEVICE.getSysEx())));
    let url = "print.html?" + URL_PARAM_SYSEX + "=" + encodeURIComponent(Utils.toHexString(DEVICE.getSysEx()));
    window.open(url, "_blank", "width=600,height=500,top=100,left=200,location,resizable,scrollbars,status");
    return false;   // disable the normal href behavior
}
