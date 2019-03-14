import {log} from "./debug";
import MODEL from "./model";
import {sendPC} from "./midi_out";

export function setPresetClean() {
    $(".preset-id").removeClass("dirty");
}

export function setPresetDirty() {
    $(".preset-id").removeClass("dirty");
    $(`#pc-${MODEL.getPresetNumber()}`).addClass("dirty");
}

export function showPreset() {
    log("showPreset()");
    $(".preset-id").removeClass("on");
    $(`#pc-${MODEL.getPresetNumber()}`).addClass("on");
}

/**
 * Send PC to change preset in Mercury7 and update the preset selectors in UI.
 * @param n
 */
export function presetSet(n) {
    log(`presetSet(${n})`);
    MODEL.setPresetNumber(n);
    sendPC(n);
    // setPresetClean();
    showPreset();
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
