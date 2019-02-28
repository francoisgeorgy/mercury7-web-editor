import {log, TRACE} from "./debug";
import MODEL from "./model";
import * as Utils from "./utils";
import {updateUI} from "./ui";
import {fullUpdateDevice} from "./midi_out";
import {toHexString} from "./utils";
import {saveSettings, settings, SETTINGS_UPDATE_URL} from "./settings";
import {appendErrorMessage} from "./ui_messages";

let ignoreNextHashChange = false;

export function updateBookmark() {
    log("updateBookmark()");
    // window.location.href.split("?")[0] is the current URL without the query-string if any
    // return window.location.href.replace("#", "").split("?")[0] + "?" + URL_PARAM_SYSEX + "=" + toHexString(MODEL.getSysEx());
    // window.location.hash = "" + URL_PARAM_SYSEX + "=" + toHexString(MODEL.getSysEx())
    const h = toHexString(MODEL.getSysEx());
    log(`updateBookmark: set hash to ${h}`);
    ignoreNextHashChange = true;
    window.location.hash = h;
}

export function initFromBookmark(updateConnectedDevice = true) {
    log(`initFromHash: ${window.location.hash}`);
    // let s = Utils.getParameterByName(URL_PARAM_SYSEX);
    const s = window.location.hash.substring(1);
    if (s) {
        log("sysex hash present");               //TODO: check that the hash is a sysex hex string
        const valid = MODEL.setValuesFromSysEx(Utils.fromHexString(s));
        if (valid.error) {
            log("unable to set value from hash");
            appendErrorMessage(valid.message);
        } else {
            log("sysex loaded in device");
            updateUI();
            if (updateConnectedDevice) fullUpdateDevice();
        }
    }
}

let automationHandler = null;

export function startBookmarkAutomation(force = false) {
    if (force || (settings.update_URL === SETTINGS_UPDATE_URL.every_second)) {
        log("startBookmarkAutomation");
        if (automationHandler) {
            // clear existing before re-starting
            clearInterval(automationHandler);
        }
        automationHandler = setInterval(updateBookmark, 500);
        $("#url-auto-toggle").addClass("running");
    }
}

export function stopBookmarkAutomation() {
    if (automationHandler) {
        log("stopBookmarkAutomation");
        clearInterval(automationHandler);
        automationHandler = null;
    }
    $("#url-auto-toggle").removeClass("running");
}

export function toggleBookmarkAutomation() {
    log("toggleBookmarkAutomation");
    if (automationHandler) {
        stopBookmarkAutomation();
    } else {
        startBookmarkAutomation(true);
    }
}

export function locationHashChanged(e) {
    if (TRACE) {
        const a = e.oldURL.substring(e.oldURL.indexOf('#')+1);
        const b = e.newURL.substring(e.newURL.indexOf('#')+1);
        console.log(`locationHashChanged from ${a} to ${b}`);
    }
    if (!ignoreNextHashChange) initFromBookmark();
    ignoreNextHashChange = false;
}

export function setupBookmarkSupport() {
    window.onhashchange = locationHashChanged;
}
