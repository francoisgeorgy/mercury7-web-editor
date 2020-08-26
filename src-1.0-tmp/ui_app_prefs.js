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
    // noinspection JSUnresolvedFunction
    const port_in2 = preferences.input2_device_id ? WebMidi.getInputById(preferences.input2_device_id) : null;
    $("#prefs_midi_channel").text(preferences.midi_channel);
    $("#prefs_input_device").text(port_in ? port_in.name : "-");
    $("#prefs_output_device").text(port_out ? port_out.name : "-");
    $("#prefs_input2_channel").text(preferences.input2_channel);
    $("#prefs_input2_device").text(port_in2 ? port_in2.name : "-");
    $("#update_URL").val(preferences.update_URL);
    $("#init_from_URL").val(preferences.init_from_URL);
    $("#prefs_zoom_level").val(preferences.zoom_level);
}

export function showMidiInput2() {
    $("#midi-in2-led").show();
    $("#midi-in2").show();
}

export function hideMidiInput2() {
    $("#midi-in2-led").hide();
    $("#midi-in2").hide();
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

export function toggleAppPreferencesPanel() {
    if ($(CONTAINER).is(".closed")) {
        openAppPreferencesPanel();
    } else {
        closeAppPreferencesPanel();
        showDefaultPanel();
        displayCurrentPreferences();
    }
    return false;
}

export function setupAppPreferences(input2SelectionCallback) {
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

/*
TODO: app prefs clear input2 channel

    $("#prefs_clear_input2_channel").click(() => {
        savePreferences({input2_channel: 1});
        $("#midi-input2-channel").val(preferences.input2_channel);
        displayCurrentPreferences();
    });
*/

/*
TODO: TODO: app prefs clear input2 device

    $("#prefs_clear_input2_device").click(() => {
        savePreferences({input2_device_id: null});
        updateSelectDeviceList();
        displayCurrentPreferences();
    });
*/

    $(`#enable-midi-in2-${preferences.enable_midi_in2}`).prop('checked', true);

    $("input[name='enable-midi-in2']").on("change", function(){
        const v = parseInt($("input[name='enable-midi-in2']:checked").val());
        savePreferences({enable_midi_in2: v});
        if (v) {
            log("enable midi input2");
            showMidiInput2();
        } else {
            log("disable midi input2");
            // //FIXME: code to disconnected input2 is the same here and in main.js. This code must be moved in a dedicated file.
            // const p = getMidiInput2Port();
            // if (p) {
            //     log("enable-midi-in2: disconnectInput2Port()", p);
            //     p.removeListener();    // remove all listeners for all channels
            //     setMidiInput2Port(null);
            //     appendMessage(`Input 2 disconnected.`);
            // }
            savePreferences({input2_device_id: null});
            updateSelectDeviceList();
            hideMidiInput2();
        }
        input2SelectionCallback();
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
