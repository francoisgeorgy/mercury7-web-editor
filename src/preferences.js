import store from "storejs";
import MODEL from "./model";

const LOCAL_STORAGE_KEY = MODEL.name.toLowerCase() + ".preferences";

export const SETTINGS_UPDATE_URL = {
    manually: 0,
    on_randomize: 1,
    on_init: 2,
    on_randomize_and_init: 4,
    every_second: 8             // TODO: change to a open value
};

export let preferences = {
    midi_channel: 1,
    input_device_id: null,      // web midi port ID
    output_device_id: null,     // web midi port ID
    theme: "",                  // empty means default theme,
    zoom_level: 1,
    update_URL: SETTINGS_UPDATE_URL.on_randomize_and_init,
    init_from_bookmark: 0       // if 0 (NO), the app will init from the device and ignore the bookmark.
                                // if 1 (YES), the app will init from the bookmark's sysex and update the device;
};

export function loadPreferences() {
    const s = store.get(LOCAL_STORAGE_KEY);
    if (s) preferences = Object.assign(preferences, preferences, JSON.parse(s));
    if (!Number.isInteger(preferences.midi_channel)) {
        // because we changed the format of midi_channel a few version ago
        preferences.midi_channel = 1;
    }
}

export function savePreferences(options = {}) {
    Object.assign(preferences, preferences, options);
    store(LOCAL_STORAGE_KEY, JSON.stringify(preferences));
}
