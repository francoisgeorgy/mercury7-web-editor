import store from "storejs";
import {log} from "@utils/debug";
import {LOCAL_STORAGE_KEY_PREFERENCES} from "@device/model";

export const SETTINGS_UPDATE_URL = {
    manually: 0,
    on_randomize: 1,
    on_init: 2,
    on_randomize_init_load: 4,
    every_second: 8            // TODO: change to a open value
};

export let preferences = {
    midi_channel: 1,
    input_device_id: null,      // web midi port ID
    output_device_id: null,     // web midi port ID
    input2_channel: 0,
    input2_device_id: null,      // web midi port ID
    // enable_midi_in2: 0,
    theme: "",                  // empty means default theme,
    zoom_level: 1,
    update_URL: SETTINGS_UPDATE_URL.on_randomize_init_load,
    init_from_URL: 1,       // if 0 (NO), the app will init from the device and ignore the URL.
                            // if 1 (YES), the app will init from the URL's sysex and update the device.
    display_infos: 1,       // if 0 (NO), the controls' description is never displayed
                            // if 1 (YES), the controls' description is displayed when the mouse if over the control's name
    library_open: 0,        // 0 = close, 1 = open
    library_scroll: 0,      // 0 = off, 1 = on
    tooltips: 0
};

export function loadPreferences() {
    const s = store.get(LOCAL_STORAGE_KEY_PREFERENCES);
    if (s) preferences = Object.assign(preferences, preferences, JSON.parse(s));
    if (!Number.isInteger(preferences.midi_channel)) {
        // because we changed the format of midi_channel in v0.93
        preferences.midi_channel = 1;
    }
}

export function savePreferences(options = {}) {
    log('savePreferences', options);
    Object.assign(preferences, preferences, options);
    store(LOCAL_STORAGE_KEY_PREFERENCES, JSON.stringify(preferences));
}
