import store from "storejs";

const LOCAL_STORAGE_KEY = "mercury7.settings";

export const SETTINGS_UPDATE_URL = {
    manually: 0,
    on_randomize: 1,
    on_init: 2,
    on_randomize_and_init: 4
};

export let settings = {
    midi_channel: "all",
    input_device_id: null,      // web midi port ID
    output_device_id: null,     // web midi port ID
    theme: "",                  // empty means default theme,
    zoom_level: 1,
    update_URL: SETTINGS_UPDATE_URL.manually
};

export function loadSettings() {
    const s = store.get(LOCAL_STORAGE_KEY);
    if (s) settings = Object.assign(settings, settings, JSON.parse(s));

}

export function saveSettings(options = {}) {
    Object.assign(settings, settings, options);
    store(LOCAL_STORAGE_KEY, JSON.stringify(settings));
}
