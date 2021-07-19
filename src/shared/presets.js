import {log} from "@utils/debug";
import MODEL from "@model";
import {fullUpdateDevice, setAndSendPC} from "@midi/midiOut";
import {markAllLibraryPresetsAsUnselected, setLibraryPresetDirty} from "@shared/preset_library";
import {resetExp} from "@shared/expController";
import {updateControls} from "@shared/controller";

/*
    .preset :
        .sel   : current preset number in MODEL
        .on    : communication with the pedal is ON
        .dirty : preset has been modified; does not correspond to the _saved_ preset any more.

    The .dirty flag is cleared when we receive a preset (via sysex) or when we load a preset file.
*/

let dirty_cache = true;    // setPresetDirty is called each time a control is modified. This variable is used to minimize the DOM changes.

/*
export function isPresetClean() {
    return !dirty_cache;
}
*/

/**
 * Remove all flags and highlight color from the preset selectors.
 */
export function resetPresetSelectors() {
    log("resetPresetSelectors()");
    $(".preset-id").removeClass("dirty on sel");
    dirty_cache = false;
}

/**
 * Remove any dirty indicator from the preset selectors
 */
export function setPresetSelectorClean() {
    log("setPresetClean()");
    $(".preset-id").removeClass("dirty");
    dirty_cache = false;
}

/**
 * Show the dirty indicator on the current preset selector
 */
export function setPresetSelectorDirty(force = false) {
    log("setPresetDirty()");
    if (!dirty_cache || force) {
        log("setPresetDirty()", MODEL.getPresetNumber());
        $(".preset-id").removeClass("dirty");
        $(`#pc-${MODEL.getPresetNumber()}`).addClass("dirty");
        dirty_cache = true;
    }
}

/**
 * Update the preset selector to show the current pedal's preset.
 * Highlight the preset selector if the communication is up with the pedal.
 */
export function updatePresetSelector() {
    log("updatePresetSelector()");
    resetPresetSelectors();
    const n = MODEL.getPresetNumber();
    if (n) {
        const e = $(`#pc-${n}`);
        e.addClass("sel");
    }
    // unselect any library select:
    markAllLibraryPresetsAsUnselected();
}

/**
 * Send PC to change preset and update the preset selectors in UI.
 * @param n
 */
export function selectPreset(n) {
    log(`presetSet(${n})`);
    MODEL.setPresetNumber(n);
    updatePresetSelector();
    setAndSendPC(n);
}

export function presetInc() {
    log("presetInc");
    const pc = (MODEL.getPresetNumber() % 16) + 1;
    selectPreset(pc)
    // setAndSendPC(pc);
}

export function presetDec() {
    log("presetDec");
    const n = MODEL.getPresetNumber() - 1;
    const pc = n < 1 ? 16 : n;
    selectPreset(pc);
    // setAndSendPC(pc);
}

export function setupPresetSelectors() {
    $("div.preset-id").click(function() {
        log(`setupPresetSelectors: click on ${this.id}`);
        const c = this.id.split("-");
        const n = parseInt(c[1], 10);  //TODO: check if error
        selectPreset(n);
        // setAndSendPC(n);
    });
}

export function init() {
    log("init()");
    MODEL.init();
    resetExp();
    // updateUI();
    // updatePresetSelector();
    updateControls();
    setPresetSelectorDirty();   // must be done after updateUI()
    setLibraryPresetDirty();
    fullUpdateDevice();
    // if ((preferences.update_URL & SETTINGS_UPDATE_URL.on_init) ||
    //     (preferences.update_URL & SETTINGS_UPDATE_URL.on_randomize_init_load)) {
    //     updateUrl("init");
    // }
    return false;   // disable the normal href behavior when called from an onclick event
}

export function randomize() {
    log("randomize");
    MODEL.randomize();
    resetExp();
    // updateUI();
    // updatePresetSelector();
    updateControls();
    setPresetSelectorDirty();   // must be done after updateUI()
    setLibraryPresetDirty();
    fullUpdateDevice();
    // if ((preferences.update_URL & SETTINGS_UPDATE_URL.on_randomize) ||
    //     (preferences.update_URL & SETTINGS_UPDATE_URL.on_randomize_init_load)) {
    //     updateUrl();
    // }
    return false;   // disable the normal href behavior when called from an onclick event
}