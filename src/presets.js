import {log} from "./debug";
import MODEL from "./model";
import {setPresetDirty} from "./ui_presets";
import {updateUI} from "./ui";
import {fullUpdateDevice} from "./midi_out";
import {clearError, setStatus} from "./ui_messages";
import {updateBookmark} from "./url";
import {preferences, SETTINGS_UPDATE_URL} from "./preferences";
import {resetExp} from "./ui_sliders";

export function init() {
    log("init()");
    MODEL.init();
    resetExp();
    updateUI();
    setPresetDirty();   // must be done after updateUI()
    fullUpdateDevice(false, true);
    clearError();
    if ((preferences.update_URL & SETTINGS_UPDATE_URL.on_init) ||
        (preferences.update_URL & SETTINGS_UPDATE_URL.on_randomize_and_init)) {
        updateBookmark("init");
    }
    setStatus("Mercury7 set to 'init' configuration.");
    return false;   // disable the normal href behavior when called from an onclick event
}

export function randomize() {
    log("randomize");
    MODEL.randomize();
    resetExp();
    updateUI();
    setPresetDirty();   // must be done after updateUI()
    fullUpdateDevice(true, true);    // true == update only updated values (values which have been marked as changed)
    clearError();
    if ((preferences.update_URL & SETTINGS_UPDATE_URL.on_randomize) ||
        (preferences.update_URL & SETTINGS_UPDATE_URL.on_randomize_and_init)) {
        updateBookmark();
    }
    setStatus("Mercury7 randomized.");
    return false;   // disable the normal href behavior when called from an onclick event
}
