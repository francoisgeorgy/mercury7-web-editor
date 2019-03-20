import {log} from "./debug";
import {closeGlobalSettingsPanel} from "./ui_global_settings";
import {hideDefaultPanel, showDefaultPanel} from "./ui";
import {savePreferences, preferences, SETTINGS_UPDATE_URL} from "./preferences";
import * as WebMidi from "webmidi";
import {updateSelectDeviceList} from "./ui_selects";
import {startUrlAutomation, stopUrlAutomation} from "./url";
import {closeHelpPanel} from "./ui_help";

const CONTAINER = "#app-preferences";

function displayCurrentPreferences() {
    // noinspection JSUnresolvedFunction
    const port_in = preferences.input_device_id ? WebMidi.getInputById(preferences.input_device_id) : null;
    // noinspection JSUnresolvedFunction
    const port_out = preferences.output_device_id ? WebMidi.getOutputById(preferences.output_device_id) : null;
    $("#prefs_midi_channel").text(preferences.midi_channel);
    $("#prefs_input_device").text(port_in ? port_in.name : "-");
    $("#prefs_output_device").text(port_out ? port_out.name : "-");
    $("#update_URL").val(preferences.update_URL);
    $("#init_from_URL").val(preferences.init_from_URL);
    $("#prefs_zoom_level").val(preferences.zoom_level);
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

    $("#prefs_clear_midi_channel").click(() => {
        savePreferences({midi_channel: 1});
        $("#midi-channel").val(preferences.midi_channel);
        displayCurrentPreferences();
    });

    $("#prefs_clear_input_device").click(() => {
        savePreferences({input_device_id: null});
        updateSelectDeviceList();
        displayCurrentPreferences();
    });

    $("#prefs_clear_output_device").click(() => {
        savePreferences({output_device_id: null});
        updateSelectDeviceList();
        displayCurrentPreferences();
    });

    $("#init_from_URL").on("change", function() {
        // noinspection JSUnresolvedVariable
        savePreferences({init_from_URL: parseInt(event.target.value, 10)}); //TODO: check validity of value
    });

    $("#update_URL").on("change", function() {
        // noinspection JSUnresolvedVariable
        const v = parseInt(event.target.value, 10);     //TODO: check validity of value
        savePreferences({update_URL: v});
        if (v === SETTINGS_UPDATE_URL.every_second) {
            startUrlAutomation();
        } else {
            stopUrlAutomation();
        }
    });

    $("#prefs_zoom_level").on("change", function() {
        // noinspection JSUnresolvedVariable
        const v = parseInt(event.target.value, 10);     //TODO: check validity of value
        savePreferences({zoom_level: v});
    });

    $(`#display_description-${preferences.display_infos}`).prop('checked', true);

    $("input[name='display_description']").on("change", function(){
        const v = $("input[name='display_description']:checked").val();
        savePreferences({display_infos: parseInt(v)})
    });

    return true;
}
