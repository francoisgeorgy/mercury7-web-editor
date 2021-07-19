import {log} from "./debug";
import MODEL from "./model";
import {setPresetSelectorDirty} from "./ui_presets";
import {updateControls} from "./ui";
import {fullUpdateDevice} from "./midi_out";
import {appendMessage} from "./ui_messages";
import {resetExp} from "./ui_exp";
import {setLibraryPresetDirty} from "./preset_library";

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
    appendMessage(`${MODEL.name} set to 'init' configuration.`);
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
    appendMessage(`${MODEL.name} randomized.`);
    return false;   // disable the normal href behavior when called from an onclick event
}
