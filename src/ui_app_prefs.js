import {log} from "./debug";
import {closeSettingsPanel} from "./ui_global_settings";
import {hideDefaultPanel, showDefaultPanel} from "./ui";
import {saveSettings, settings} from "./settings";
import * as WebMidi from "webmidi";
import {updateSelectDeviceList} from "./ui_selects";

const CONTAINER = "#app-preferences";

function displayCurrentPreferences() {
    const port_in = settings.input_device_id ? WebMidi.getInputById(settings.input_device_id) : null;
    const port_out = settings.output_device_id ? WebMidi.getOutputById(settings.output_device_id) : null;
    $("#settings_midi_channel").text(settings.midi_channel);
    $("#settings_input_device").text(port_in ? port_in.name : "-");
    $("#settings_output_device").text(port_out ? port_out.name : "-");
    $("#update_URL").val(settings.update_URL);
    $("#settings_zoom_level").val(settings.zoom_level);
}

export function openAppPreferencesPanel() {
    hideDefaultPanel();
    closeSettingsPanel();
    $(CONTAINER).removeClass("closed");
    displayCurrentPreferences();
    return false;
}

export function closeAppPreferencesPanel() {
    $(CONTAINER).addClass("closed");
    return false;
}

export function setupAppPreferences() {
    log("setupAppPreferences()");

    $(".close-app-prefs-panel").click(() => {
        closeAppPreferencesPanel();
        showDefaultPanel();
        displayCurrentPreferences();
    });

    $("#settings_clear_midi_channel").click(() => {
        saveSettings({midi_channel: "all"})
        $("#midi-channel").val(settings.midi_channel);
        displayCurrentPreferences();
    });

    $("#settings_clear_input_device").click(() => {
        saveSettings({input_device_id: null});
        updateSelectDeviceList();
        displayCurrentPreferences();
    });

    $("#settings_clear_output_device").click(() => {
        saveSettings({output_device_id: null});
        updateSelectDeviceList();
        displayCurrentPreferences();
    });

    $("#update_URL").on("change", function(e) {
        console.log(event.target.value);
        saveSettings({update_URL: parseInt(event.target.value, 10)});
    });

    $("#settings_zoom_level").on("change", function(e) {
        console.log(event.target.value);
        saveSettings({zoom_level: parseInt(event.target.value, 10)});
    });

    return true;
}
