import {log} from "./debug";
import {closeGlobalSettingsPanel} from "./ui_global_settings";
import {hideDefaultPanel, showDefaultPanel} from "./ui";
import {saveSettings, preferences, SETTINGS_UPDATE_URL} from "./preferences";
import * as WebMidi from "webmidi";
import {updateSelectDeviceList} from "./ui_selects";
import {startBookmarkAutomation, stopBookmarkAutomation} from "./url";
import {closeHelpPanel} from "./ui_help";

const CONTAINER = "#app-preferences";

function displayCurrentPreferences() {
    // noinspection JSUnresolvedFunction
    const port_in = preferences.input_device_id ? WebMidi.getInputById(preferences.input_device_id) : null;
    // noinspection JSUnresolvedFunction
    const port_out = preferences.output_device_id ? WebMidi.getOutputById(preferences.output_device_id) : null;
    $("#settings_midi_channel").text(preferences.midi_channel);
    $("#settings_input_device").text(port_in ? port_in.name : "-");
    $("#settings_output_device").text(port_out ? port_out.name : "-");
    $("#update_URL").val(preferences.update_URL);
    $("#init_from_bookmark").val(preferences.init_from_bookmark);
    $("#settings_zoom_level").val(preferences.zoom_level);
}

export function openAppPreferencesPanel() {
    hideDefaultPanel();
    closeGlobalSettingsPanel();
    closeHelpPanel();
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
        saveSettings({midi_channel: 1});
        $("#midi-channel").val(preferences.midi_channel);
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

    $("#init_from_bookmark").on("change", function() {
        // noinspection JSUnresolvedVariable
        saveSettings({init_from_bookmark: parseInt(event.target.value, 10)});
    });

    $("#update_URL").on("change", function() {
        // noinspection JSUnresolvedVariable
        const v = parseInt(event.target.value, 10);
        saveSettings({update_URL: v});
        if (v === SETTINGS_UPDATE_URL.every_second) {
            startBookmarkAutomation();
        } else {
            stopBookmarkAutomation();
        }
    });

    $("#settings_zoom_level").on("change", function() {
        // noinspection JSUnresolvedVariable
        const v = parseInt(event.target.value, 10);
        saveSettings({zoom_level: v});
    });

    return true;
}
