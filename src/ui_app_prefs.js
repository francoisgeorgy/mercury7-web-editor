import {log} from "./debug";
import {closeSettingsPanel} from "./ui_global_settings";
import {hideDefaultPanel, showDefaultPanel} from "./ui";
import {saveSettings, settings, SETTINGS_UPDATE_URL} from "./settings";
import * as WebMidi from "webmidi";
import {updateSelectDeviceList} from "./ui_selects";
import {startBookmarkAutomation, stopBookmarkAutomation} from "./hash";
import {closeHelpPanel} from "./ui_help";

const CONTAINER = "#app-preferences";

function displayCurrentPreferences() {
    const port_in = settings.input_device_id ? WebMidi.getInputById(settings.input_device_id) : null;
    const port_out = settings.output_device_id ? WebMidi.getOutputById(settings.output_device_id) : null;
    $("#settings_midi_channel").text(settings.midi_channel);
    $("#settings_input_device").text(port_in ? port_in.name : "-");
    $("#settings_output_device").text(port_out ? port_out.name : "-");
    $("#update_URL").val(settings.update_URL);
    $("#init_from_bookmark").val(settings.init_from_bookmark);
    $("#settings_zoom_level").val(settings.zoom_level);
}

export function openAppPreferencesPanel() {
    hideDefaultPanel();
    closeSettingsPanel();
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
        saveSettings({midi_channel: "all"});
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

    $("#init_from_bookmark").on("change", function() {
        saveSettings({init_from_bookmark: parseInt(event.target.value, 10)});
    });

    $("#update_URL").on("change", function() {
        const v = parseInt(event.target.value, 10);
        saveSettings({update_URL: v});
        if (v === SETTINGS_UPDATE_URL.every_second) {
            startBookmarkAutomation();
        } else {
            stopBookmarkAutomation();
        }
    });

    $("#settings_zoom_level").on("change", function() {
        const v = parseInt(event.target.value, 10);
        saveSettings({zoom_level: v});
    });

    return true;
}
