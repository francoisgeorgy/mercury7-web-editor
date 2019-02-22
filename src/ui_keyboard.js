import {fromEvent} from "rxjs";
import {distinctUntilChanged, groupBy, map, merge, mergeAll} from "rxjs/operators";
import {log} from "./debug";
import {animateCC} from "./animate_cc";
import {handleUserAction, showDefaultPanel, updateControl, updateModelAndUI} from "./ui";
import {sendPC, updateDevice} from "./midi_out";
import DEVICE from "./model";
import {displayPreset, presetDec, presetInc, setPresetNumber} from "./ui_presets";
import {init, randomize} from "./presets";
import {tapDown, tapRelease, updateBypassSwitch} from "./ui_switches";
import {SYNTH_MODES, WAVESHAPES} from "./model/constants";
import {closeAppPreferencesPanel} from "./ui_app_prefs";
import {closeSettingsPanel} from "./ui_global_settings";


function toggleBypass() {
    const c = DEVICE.control[DEVICE.control_id.bypass];
    const v = DEVICE.getControlValue(c) === 0 ? 127 : 0;
    updateDevice(c.cc_type, c.cc_number, v);
    updateBypassSwitch(v);
}

function selectSquarewave() {
    const c = DEVICE.control[DEVICE.control_id.synth_waveshape];
    updateDevice(c.cc_type, c.cc_number, WAVESHAPES.square);
    updateControl(c.cc_type, c.cc_number, WAVESHAPES.square);
}

function selectSawtooth() {
    const c = DEVICE.control[DEVICE.control_id.synth_waveshape];
    updateDevice(c.cc_type, c.cc_number, WAVESHAPES.sawtooth);
    updateControl(c.cc_type, c.cc_number, WAVESHAPES.sawtooth);
}

function selectDry() {
    const c = DEVICE.control[DEVICE.control_id.synth_mode];
    updateDevice(c.cc_type, c.cc_number, SYNTH_MODES.dry);
    updateControl(c.cc_type, c.cc_number, SYNTH_MODES.dry);
}

function selectMono() {
    const c = DEVICE.control[DEVICE.control_id.synth_mode];
    updateDevice(c.cc_type, c.cc_number, SYNTH_MODES.mono);
    updateControl(c.cc_type, c.cc_number, SYNTH_MODES.mono);
}

function selectPoly() {
    const c = DEVICE.control[DEVICE.control_id.synth_mode];
    updateDevice(c.cc_type, c.cc_number, SYNTH_MODES.poly);
    updateControl(c.cc_type, c.cc_number, SYNTH_MODES.poly);
}

function selectArp() {
    const c = DEVICE.control[DEVICE.control_id.synth_mode];
    updateDevice(c.cc_type, c.cc_number, SYNTH_MODES.arp);
    updateControl(c.cc_type, c.cc_number, SYNTH_MODES.arp);
}

/**
 * https://codepen.io/fgeorgy/pen/NyRgxV?editors=1010
 */
export function setupKeyboard() {

    let keyDowns = fromEvent(document, "keydown");
    let keyUps = fromEvent(document, "keyup");

    let keyPresses = keyDowns.pipe(
        merge(keyUps),
        groupBy(e => e.keyCode),
        map(group => group.pipe(distinctUntilChanged(null, e => e.type))),
        mergeAll()
    );

    keyPresses.subscribe(function(e) {
        if (e.type === "keydown") {
            keyDown(e.keyCode, e.altKey, e.shiftKey);
        } else if (e.type === "keyup") {
            keyUp(e.keyCode, e.altKey, e.shiftKey);
        }
    });

    log("keyboard set up");
}

function animateFromTo(cc, from, to) {
    animateCC(cc, from, to, function (v) {
        updateModelAndUI("cc", cc, v);
        updateDevice("cc", cc, v);
    });
}

function animateTo(cc, to) {
    animateFromTo(cc, DEVICE.getControlValue(DEVICE.getControl(cc)), to);
    // animateCC(cc, DEVICE.getControlValue(DEVICE.getControl(cc)), to, function (v) {
    //     dispatch("cc", cc, v);
    //     updateDevice("cc", cc, v);
    // });
}

function keyDown(code, alt, shift) {

    if (code === 48) {   // 0
        setPresetNumber(10);
        sendPC(10);
        displayPreset();
        return;
    }

    if ((code >= 49) && (code <= 57)) {   // 1..9
        let pc = code - 48;
        setPresetNumber(code - 48);
        sendPC(pc);
        displayPreset();
        return;
    }

    switch (code) {
        case 18:                // ALT
            $(".header-shortcut").removeClass("hidden");
            break;
        case 67:                // C
            animateTo(DEVICE.control_id.pitch, shift ? 63 : 0);
            // animateCC(DEVICE.control_id.pitch, DEVICE.getControlValue(DEVICE.getControl(DEVICE.control_id.pitch)), shift ? 63 : 0, animate_callback);
            break;
        case 86:                // V
            animateTo(DEVICE.control_id.pitch, shift ? 63 : 127);
            // animateCC(DEVICE.control_id.pitch, DEVICE.getControlValue(DEVICE.getControl(DEVICE.control_id.pitch)), shift ? 63 : 127);
            break;
        case 70:                // F
            animateTo(DEVICE.control_id.filter, shift ? 63 : 0);
            break;
        case 71:                // G
            animateTo(DEVICE.control_id.filter, shift ? 63 : 127);
            break;
        case 72:                // H
            animateTo(DEVICE.control_id.filter_bandwidth, shift ? 63 : 0);
            break;
        case 74:                // J
            animateTo(DEVICE.control_id.filter_bandwidth, shift ? 63 : 127);
            break;
        case 75:                // K    delay level
            animateTo(DEVICE.control_id.delay_level, shift ? 63 : 0);
            break;
        case 76:                // L    delay level
            animateTo(DEVICE.control_id.delay_level, shift ? 63 : 127);
            break;
        case 89:                // Y    min mix
            animateTo(DEVICE.control_id.mix, shift ? 63 : 0);
            break;
        case 88:                // X    max mix
            animateTo(DEVICE.control_id.mix, shift ? 63 : 127);
            break;
        case 8:                 // DEL  min sustain
            animateTo(DEVICE.control_id.sustain, 0);
            break;
        case 66:                // B    min sustain
            animateTo(DEVICE.control_id.sustain, shift ? 63 : 0);
            break;
        case 78:                // N    max sustain
            animateTo(DEVICE.control_id.sustain, shift ? 63 : 127);
            break;
        case 84:                // T            tap
            tapDown("cc-28-127");
            break;
        case 90:                // Z
            animateTo(DEVICE.control_id.ring_modulation, shift ? 63 : 0);
            break;
        case 85:                // U
            animateTo(DEVICE.control_id.ring_modulation, shift ? 63 : 127);
            break;
        case 32:                // SPACE
            toggleBypass();
            break;
        case 109:               // num keypad "-"
            animateTo(DEVICE.control_id.modulation, shift ? 63 : 0);
            break;
        case 107:               // num keypad "+"
            animateTo(DEVICE.control_id.modulation, shift ? 63 : 127);
            break;
        case 79:                   // O
            const v = DEVICE.getControlValue(DEVICE.getControl(DEVICE.control_id.portamento));
            animateFromTo(DEVICE.control_id.portamento, v, shift ? 63 : (v < 63 ? 127 : 0));
            break;
        case 82:                // R Randomize
            randomize();
            break;
        case 77:                // M Mono
            selectMono();
            break;
        case 80:                // P Poly
            selectPoly();
            break;
        case 65:                // A ARP
            selectArp();
            break;
        case 68:                // D Dry
            selectDry();
            break;
        case 73:                // I Init
            init();
            break;
        case 81:                // Q Squarewave
            selectSquarewave();
            break;
        case 87:                // W Sawtooth wave
            selectSawtooth();
            break;
        case 38:                // Up arrow
        case 39:                // Right arrow
            presetInc(handleUserAction);
            break;
        case 40:                // Down arrow
        case 37:                // Left arrow
            presetDec(handleUserAction);
            break;
    }
}

// noinspection JSUnusedLocalSymbols
function keyUp(code, alt, shift) {
    switch (code) {
        case 18:                // ALT
            $(".header-shortcut").addClass("hidden");
            break;
        case 27:                // close all opened panel with ESC key
            closeAppPreferencesPanel();
            closeSettingsPanel();
            showDefaultPanel();
            break;
        case 84:                // T            tap
            tapRelease("cc-28-127");
            break;
    }
}
