import {log} from "./debug";
import MODEL from "./model";
import {getMidiOutputPort, sendPC} from "./midi_out";
import {getMidiInputPort} from "./midi_in";

/*
    .preset :
        .sel   : current preset number in MODEL
        .on    : communication with the pedal is ON
        .dirty : preset has been modified; does not correspond to the _saved_ preset any more.

    The .dirty flag is cleared when we receive a preset (via sysex) or when we load a preset file.
*/

export function setPresetClean() {
    log("setPresetClean()");
    $(".preset-id").removeClass("dirty");
    dirty_cache = false;
}

let dirty_cache = true;    // setPresetDirty is called each time a control is modified. This variable is used to minimize the DOM changes.

export function setPresetDirty() {
    if (!dirty_cache) {
        log("setPresetDirty()");
        $(".preset-id").removeClass("dirty");
        $(`#pc-${MODEL.getPresetNumber()}`).addClass("dirty");
        dirty_cache = true;
    }
}

/*
export function setPresetOutOfSync() {
    log("setPresetOutOfSync()");
    $(".preset-id").removeClass("sync");
}

export function setPresetInSync() {
    log("setPresetInSync()");
    $(".preset-id").removeClass("sync");
    $(`#pc-${MODEL.getPresetNumber()}`).addClass("sync");
}
*/

export function showPreset() {
    log("showPreset()");
    // $(".preset-id").removeClass("on dirty");
    // $(`#pc-${MODEL.getPresetNumber()}`).addClass("on");

    const n = MODEL.getPresetNumber();

    $(".preset-id").removeClass("on sel dirty");
    dirty_cache = false;    // because we removed .dirty

    $(`#pc-${n}`).addClass("sel");

    if (getMidiInputPort() && getMidiOutputPort()) {
        $(`#pc-${n}`).addClass("on");
    } else {
        $(".preset-id").removeClass("on");
    }
}

/**
 * Send PC to change preset and update the preset selectors in UI.
 * @param n
 */
export function presetSet(n) {
    log(`presetSet(${n})`);

    MODEL.setPresetNumber(n);

    showPreset();
    // setPresetDirty();

    sendPC(n);
    // setPresetOutOfSync();   // by default, dirty and out of sync
    // showPreset();
}

export function presetInc() {
    log("presetInc");
    presetSet((MODEL.getPresetNumber() % 16) + 1)
}

export function presetDec() {
    log("presetDec");
    const n = MODEL.getPresetNumber() - 1;
    presetSet(n < 1 ? 16 : n);
}

export function setupPresetSelectors() {
    $("div.preset-id").click(function() {
        log(`setupPresetSelectors: click on ${this.id}`);
        const c = this.id.split("-");
        const n = parseInt(c[1], 10);  //TODO: check if error
        presetSet(n);
    });
}
