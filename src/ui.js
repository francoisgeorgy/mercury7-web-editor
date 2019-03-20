import MODEL from "./model";
import {updatePresetSelector, setPresetDirty, setupPresetSelectors} from "./ui_presets";
import {knobs, setupKnobs} from "./ui_knobs";
import {
    setupMomentarySwitches,
    setupSwitches, tapDown, tapRelease,
    updateBypassSwitch,
    updateMomentaryStompswitch,
    updateOptionSwitch, updateSwellSwitch
} from "./ui_switches";
import {fullUpdateDevice, savePreset, sendPC, updateDevice} from "./midi_out";
import {VERSION} from "./constants";
import {setCommunicationStatus} from "./ui_messages";
import {setupKeyboard} from "./ui_keyboard";
import {init, randomize} from "./presets";
import {loadPresetFromFile, readFile} from "./read_file";
import {openCreditsDialog, printPreset} from "./ui_dialogs";
import {openMidiWindow} from "./ui_midi_window";
import {initZoom, zoomIn, zoomOut} from "./ui_zoom";
import {preferences} from "./preferences";
import {toggleUrlAutomation, updateUrl} from "./url";
import {setupGlobalSettings, openGlobalSettingsPanel} from "./ui_global_settings";
import "webpack-jquery-ui/effects";
import {setupAppPreferences, openAppPreferencesPanel} from "./ui_app_prefs";
import {log, TRACE, warn} from "./debug";
import {downloadLastSysEx} from "./download";
import {openHelpPanel, setupHelpPanel} from "./ui_help";
import {setupExp, updateExpSlider} from "./ui_exp";
import {inExpMode} from "./ui_exp";

/**
 * Handles a change made by the user in the UI.
 */
export function handleUserAction(control_type, control_number, value) {
    log(`handleUserAction(${control_type}, ${control_number}, ${value})`);
    const n = parseInt(control_number, 10);
    if (control_type === 'pc') {
        sendPC(n);
    } else {
        if (n !== MODEL.control_id.exp_pedal) {
            setPresetDirty();
        }
        updateDevice(control_type, n, value, inExpMode());
    }
}

/**
 *
 * @param control_type "cc" or "nrpn"
 * @param control_number
 * @param value
 * @param mappedValue
 */
export function updateControl(control_type, control_number, value, mappedValue) {

    //FIXME: no need for control_type

    log(`updateControl(${control_type}, ${control_number}, ${value}, ${mappedValue})`);

    if (mappedValue === undefined) {
        mappedValue = value;
    }

    const id = control_type + "-" + control_number;

    if (knobs.hasOwnProperty(id)) {
        knobs[id].value = value;        //TODO: doesn't the knob update its value itself?
    } else {

        //TODO: check that control_number is always an int and not a string
        const num = parseInt(control_number, 10);

        if (/*control_type === "cc" &&*/ num === 4) {    //TODO: replace this hack with better code
            updateExpSlider(value);                                                     //FIXME: use MODEL control_id values instead of magic number
            return;
        }

        if (/*control_type === "cc" &&*/ num === 14) {    //TODO: replace this hack with better code
            updateBypassSwitch(value);
            return;
        }

        if (/*control_type === "cc" &&*/ num === 28) {    //TODO: replace this hack with better code
            updateSwellSwitch(value);
            return;
        }

        let c = $(`#${id}`);

        if (c.length) { // jQuery trick to check if element was found
            warn("updateControl: unsupported control (1): ", control_type, num, value);
        } else {
            c = $(`#${id}-${mappedValue}`);
            if (c.length) {
                if (c.is(".bt")) {
                    log(`updateControl(${control_type}, ${num}, ${value}) .bt`);
                    updateOptionSwitch(id + "-" + mappedValue, mappedValue);
                // } else if (c.is(".sw")) {
                //     //TODO: handle .sw controls
                } else if (c.is(".swm")) {
                    log(`updateControl(${control_type}, ${num}, ${value}) .swm`);
                    updateMomentaryStompswitch(`${id}-${mappedValue}`, mappedValue);
                    // if (mappedValue !== 0) {
                    //     log("will call updateMomentaryStompswitch in 200ms");
                        setTimeout(() => updateMomentaryStompswitch(`${id}-${mappedValue}`, 0), 200);
                    // }
                } else {
                    warn("updateControl: unsupported control (2): ", control_type, num, value);
                }
            } else {
                log(`no control for ${id}-${mappedValue}`);
            }
        }

    }
}

/**
 * Set value of the controls (input and select) from the MODEL values
 */
export function updateControls(onlyTwoValuesControls = false) {
    if (TRACE) console.groupCollapsed(`updateControls(${onlyTwoValuesControls})`);
    for (let i=0; i < MODEL.control.length; i++) {
        if (typeof MODEL.control[i] === "undefined") continue;
        const c = MODEL.control[i];
        if (onlyTwoValuesControls) {    // if onlyTwoValuesControls then only update two-values controls
            if (c.two_values) {
                log(`updateControls: update two_values ${i}`);
                updateControl(c.cc_type, i, MODEL.getControlValueInter(c), MODEL.getMappedControlValueExp(c));
            }
        } else {
            updateControl(c.cc_type, i, MODEL.getControlValue(c), MODEL.getMappedControlValue(c));
        }
    }
    if (TRACE) console.groupEnd();
} // updateControls()

/**
 * Update the UI from the MODEL controls values.
 */
export function updateUI() {
    updatePresetSelector();
    updateControls();
    log("updateUI done");
}

/**
 * Update MODEL and associated on-screen control from CC value.
 *
 * @param control_type
 * @param control_number
 * @param value
 */
export function updateModelAndUI(control_type, control_number, value) {

    //FIXME: no need for control_type

    log("updateModelAndUI", control_type, control_number, value);

    control_type = control_type.toLowerCase();
    if (control_type !== "cc") {
        warn(`updateModelAndUI: unsupported control type: ${control_type}`);
        return;
    }

    const num = parseInt(control_number, 10);

    if (MODEL.control[num]) {

        // update the model:
        MODEL.setControlValue(control_type, num, value);

        // update the UI:
        updateControl(control_type, num, value);

        if (num === MODEL.control_id.exp_pedal) {
            MODEL.interpolateExpValues(value);
            updateControls(true);
        }

        setPresetDirty();

    } else {
        log(`the MODEL does not support this control: ${num}`)
    }
}

function reloadWithSysexParam() {
    updateUrl();
    return false;   // disable the normal href behavior when called from an onclick event
}

function setupSelects(channelSelectionCallback, inputSelectionCallback, outputSelectionCallback) {
    const c = $("#midi-channel");
    c.change((event) => channelSelectionCallback(event.target.value));
    c.val(preferences.midi_channel);
    $("#midi-input-device").change((event) => inputSelectionCallback(event.target.value));
    $("#midi-output-device").change((event) => outputSelectionCallback(event.target.value));
}

function setupControlsHelp() {
    $(".header.infos").hover(
        function() {
            if (!preferences.display_infos) return;
            const cc = parseInt($(this).attr("data-infos"), 10);
            if (!Number.isInteger(cc)) {
                log(`setupControlsHelp: invalid CC: ${cc}`);
                return;
            }
            log(cc);
            $("#control-infos").html("<b>" + MODEL.control[cc].name + "</b> : " + MODEL.control[cc].infos.replace("\n", "<br />"));
            // $("#control-infos").text(MODEL.control[cc].name + " : " + MODEL.control[cc].infos);
        },
        function() {
            if (!preferences.display_infos) return;
            $("#control-infos").text("");
        }
    );
}

function setupMenu() {
    log("setupMenu()");
    $("#menu-randomize").click(randomize);
    $("#menu-init").click(init);
    // $("#menu-read").click(() => requestPreset());       //TODO: create function
    $("#menu-send").click(() => {fullUpdateDevice(); return false});
    $("#menu-save").click(savePreset);
    $("#menu-get-url").click(reloadWithSysexParam);
    $("#menu-print-preset").click(printPreset);
    $("#menu-load-preset").click(loadPresetFromFile);
    $("#menu-download-sysex").click(downloadLastSysEx);
    $("#menu-midi").click(openMidiWindow);
    $("#menu-global").click(openGlobalSettingsPanel);
    $("#menu-prefs").click(openAppPreferencesPanel);
    $("#menu-help").click(openHelpPanel);
    $("#menu-about").click(openCreditsDialog);
    $("#menu-zoom-in").click(zoomIn);
    $("#menu-zoom-out").click(zoomOut);
    $("#url-auto-toggle").click(toggleUrlAutomation);
    $("#preset-file").change(readFile);     // in load-preset-dialog
}

/**
 * Initial setup of the UI.
 * Does a MODEL.init() too, but only the virtual MODEL; does not send any CC to the connected device.
 */
export function setupUI(channelSelectionCallback, inputSelectionCallback, outputSelectionCallback) {
    if (TRACE) console.groupCollapsed("setupUI");

    $("span.version").text(VERSION);

    initZoom(preferences.zoom_level);

    setCommunicationStatus(false);
    setupPresetSelectors(handleUserAction);
    setupKnobs(handleUserAction);
    setupSwitches(handleUserAction);
    setupMomentarySwitches(tapDown, tapRelease);
    setupExp(handleUserAction);
    setupGlobalSettings();
    setupAppPreferences();
    setupHelpPanel();
    setupControlsHelp();
    setupMenu();
    setupSelects(channelSelectionCallback, inputSelectionCallback, outputSelectionCallback);
    setupKeyboard();

    if (TRACE) console.groupEnd();
}

export function showDefaultPanel() {
    $("#main").removeClass("settings-view").addClass("main-default");
}

export function hideDefaultPanel() {
    $("#main").removeClass("main-default").addClass("settings-view");
}
