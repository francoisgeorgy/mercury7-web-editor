import * as Utils from "@utils";
import MODEL from "@model";
import {URL_PARAM_SYSEX} from "@shared/url";

export function printPreset() {
    let url = "print.html?" + URL_PARAM_SYSEX + "=" + encodeURIComponent(Utils.toHexString(MODEL.getPreset()));
    window.open(url, "_blank", "width=800,height=480,top=200,left=200,location,resizable,scrollbars,status");
    return false;   // disable the normal href behavior when called from an onclick event
}
