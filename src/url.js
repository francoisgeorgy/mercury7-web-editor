import {log, TRACE} from "./debug";
import MODEL from "./model";
import * as Utils from "./utils";
import {updateUI} from "./ui";
import {fullUpdateDevice} from "./midi_out";
import {toHexString} from "./utils";
import {preferences, SETTINGS_UPDATE_URL} from "./preferences";
import {appendErrorMessage, appendMessage} from "./ui_messages";
import {SYSEX_PRESET} from "./model/sysex";
import {resetExp} from "./ui_exp";

export function setTitle(title = null) {
    let t;
    if (title) {
        t = title;
    } else {
        const now = new Date();
        t = now.getUTCFullYear() + "-" +
            ("0" + (now.getUTCMonth() + 1)).slice(-2) + "-" +
            ("0" + now.getUTCDate()).slice(-2) + "-" +
            ("0" + now.getUTCHours()).slice(-2) + "h" +
            ("0" + now.getUTCMinutes()).slice(-2) + "m" +
            ("0" + now.getUTCSeconds()).slice(-2) + "s";
    }
    document.title = `Mercury7 Editor (${t})`;
}

/**
 * return true if a hash representing a valid sysex is present
 */
export function hashSysexPresent() {
    log(`hashSysexPresent: ${window.location.hash}`);
    const s = window.location.hash.substring(1);
    if (s) {
        log("hashSysexPresent: sysex hash present");               //TODO: check that the hash is a sysex hex string
        const valid = MODEL.validate(Utils.fromHexString(s));
        if (valid.type === SYSEX_PRESET) {
            log("hashSysexPresent: hash if a valid sysex");
            return true;
        }
    }
    return false;
}

/**
 *
 * @param updateConnectedDevice
 * @returns {boolean} true if we found a valid hash to initialize from
 */
export function initFromBookmark(updateConnectedDevice = true) {
    log(`initFromBookmark(${updateConnectedDevice})`);
    if (hashSysexPresent()) {
        const s = window.location.hash.substring(1);
        const valid = MODEL.setValuesFromSysEx(Utils.fromHexString(s));
        if (valid.type === SYSEX_PRESET) {
            log("initFromBookmark: sysex loaded in device");
            resetExp();
            updateUI();
            appendMessage("Initialization from the bookmark.");
            if (updateConnectedDevice) fullUpdateDevice();
            return true;
        } else {
            log("initFromBookmark: hash value is not a preset sysex");
            appendErrorMessage(valid.message);
        }
    }
    return false;
}

let hashUpdatedByAutomation = false;

export function updateBookmark(window_title = null) {
    // log("updateBookmark()");
    // window.location.href.split("?")[0] is the current URL without the query-string if any
    // return window.location.href.replace("#", "").split("?")[0] + "?" + URL_PARAM_SYSEX + "=" + toHexString(MODEL.getSysEx());
    // window.location.hash = "" + URL_PARAM_SYSEX + "=" + toHexString(MODEL.getSysEx())
    const h = toHexString(MODEL.getPreset());
    if (h !== window.location.hash.substring(1)) {      // update hash only when it changes
        log(`updateBookmark: set hash to ${h}`);
        hashUpdatedByAutomation = true;
        window.location.hash = h;   // this will trigger a window.onhashchange event
        setTitle(window_title);
    }
}

let automationHandler = null;

export function startBookmarkAutomation(force = false) {
    if (force || (preferences.update_URL === SETTINGS_UPDATE_URL.every_second)) {
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
    if (!hashUpdatedByAutomation) {
        // the hash has been modified by the user using the browser history; stop the automation.
        stopBookmarkAutomation();
        initFromBookmark();
    }
    hashUpdatedByAutomation = false;
}

export function setupBookmarkSupport() {
    window.onhashchange = locationHashChanged;
/*
    window.onpopstate = function(event) {
        log("popstate: " + document.location, event);
    };
*/
}
