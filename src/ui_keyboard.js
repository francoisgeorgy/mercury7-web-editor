import {fromEvent} from "rxjs";
import {distinctUntilChanged, groupBy, map, merge, mergeAll} from "rxjs/operators";
import {log} from "./debug";
import {animateCC} from "./animate_cc";
import {updateControl, updateModelAndUI} from "./ui";
import {setAndSendPC, updateDevice} from "./midi_out";
import MODEL from "./model";
import {presetDec, presetInc, selectPreset} from "./ui_presets";
import {init, randomize} from "./presets";
import {updateBypassSwitch, updateSwellSwitch} from "./ui_switches";
import {switchKnobsDisplay} from "./ui_knobs";
import {showExpValues, toggleExpEditMode} from "./ui_exp";

let kb_enabled = true;

export function disableKeyboard() {
    kb_enabled = false;
}
export function enableKeyboard() {
    kb_enabled = true;
}

function toggleSwell() {
    const c = MODEL.control[MODEL.control_id.swell];
    const v = MODEL.getControlValue(c) === 0 ? 127 : 0;
    updateDevice(c.cc_type, c.cc_number, v);
    updateSwellSwitch(v);
}

function toggleBypass() {
    const c = MODEL.control[MODEL.control_id.bypass];
    const v = MODEL.getControlValue(c) === 0 ? 127 : 0;
    updateDevice(c.cc_type, c.cc_number, v);
    updateBypassSwitch(v);
}

function setExpMin() {
    const c = MODEL.control[MODEL.control_id.exp_pedal];
    updateDevice(c.cc_type, c.cc_number, 0);
    updateControl(c.cc_type, c.cc_number, 0);
}

function setExpMax() {
    const c = MODEL.control[MODEL.control_id.exp_pedal];
    updateDevice(c.cc_type, c.cc_number, 127);
    updateControl(c.cc_type, c.cc_number, 127);
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
            keyDown(e.keyCode, e.altKey, e.shiftKey, e.metaKey, e.ctrlKey);
        } else if (e.type === "keyup") {
            keyUp(e.keyCode);
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
    animateFromTo(cc, MODEL.getControlValue(MODEL.getControl(cc)), to);
}

function keyDown(code, alt, shift, meta, ctrl) {

    if (!kb_enabled) return;

    log("keyDown", code, alt, shift, meta);

    if (code === 48) {   // 0
        selectPreset(10);
        setAndSendPC(10);
        return;
    }

    if ((code >= 49) && (code <= 57)) {   // 1..9
        let pc;
        if (shift && code <= 54) {
            pc = code - 48 + 10;
        } else {
            pc = code - 48;
        }
        selectPreset(pc);
        setAndSendPC(pc);
        return;
    }

    switch (code) {
        case 9:                 // TAB
            log("TAB");
            toggleExpEditMode();
            break;
        case 16:                // Shift
            showExpValues(true);
            break;
        case 18:                // ALT
            $(".header-shortcut").removeClass("hidden");
            switchKnobsDisplay(true);
            break;
    }

    //FIXME: map to key's position, not key's value (in order to be isolated from the keyboard layout)

    if (!alt && !shift && !meta) {
        switch (code) {
            case 67:                // C
                // animateTo(MODEL.control_id.pitch, ctrl ? 63 : 0);
                // animateCC(MODEL.control_id.pitch, MODEL.getControlValue(MODEL.getControl(MODEL.control_id.pitch)), ctrl ? 63 : 0, animate_callback);
                break;
            case 86:                // V
                // animateTo(MODEL.control_id.pitch, ctrl ? 63 : 127);
                // animateCC(MODEL.control_id.pitch, MODEL.getControlValue(MODEL.getControl(MODEL.control_id.pitch)), ctrl ? 63 : 127);
                break;
            case 70:                // F
                // animateTo(MODEL.control_id.filter, ctrl ? 63 : 0);
                break;
            case 71:                // G
                // animateTo(MODEL.control_id.filter, ctrl ? 63 : 127);
                break;
            case 72:                // H
                // animateTo(MODEL.control_id.filter_bandwidth, ctrl ? 63 : 0);
                break;
            case 74:                // J
                // animateTo(MODEL.control_id.filter_bandwidth, ctrl ? 63 : 127);
                break;
            case 75:                // K    delay level
                // animateTo(MODEL.control_id.delay_level, ctrl ? 63 : 0);
                break;
            case 76:                // L    delay level
                // animateTo(MODEL.control_id.delay_level, ctrl ? 63 : 127);
                break;
            case 89:                // Y    min mix
                animateTo(MODEL.control_id.mix, ctrl ? 63 : 0);
                break;
            case 88:                // X    max mix
                animateTo(MODEL.control_id.mix, ctrl ? 63 : 127);
                break;
            case 8:                 // DEL  min sustain
                // animateTo(MODEL.control_id.sustain, 0);
                break;
            case 66:                // B    min sustain
                // animateTo(MODEL.control_id.sustain, ctrl ? 63 : 0);
                break;
            case 78:                // N    max sustain
                // animateTo(MODEL.control_id.sustain, ctrl ? 63 : 127);
                break;
            case 83:                // S    swell
                toggleSwell();
                break;
            case 90:                // Z
                // animateTo(MODEL.control_id.ring_modulation, ctrl ? 63 : 0);
                break;
            case 85:                // U
                // animateTo(MODEL.control_id.ring_modulation, ctrl ? 63 : 127);
                break;
            case 32:                // SPACE
                toggleBypass();
                break;
            case 109:               // num keypad "-"
                // animateTo(MODEL.control_id.modulation, ctrl ? 63 : 0);
                break;
            case 107:               // num keypad "+"
                // animateTo(MODEL.control_id.modulation, ctrl ? 63 : 127);
                break;
            case 79:                   // O
                // const v = MODEL.getControlValue(MODEL.getControl(MODEL.control_id.portamento));
                // animateFromTo(MODEL.control_id.portamento, v, ctrl ? 63 : (v < 63 ? 127 : 0));
                break;
            case 82:                // R Randomize
                randomize();
                break;
            case 77:                // M Mono
                // selectMono();
                break;
            case 80:                // P Poly
                // selectPoly();
                break;
            case 65:                // A ARP
                // selectArp();
                break;
            case 68:                // D Dry
                // selectDry();
                break;
            case 73:                // I Init
                init();
                break;
            case 81:                // Q Squarewave
                // selectSquarewave();
                break;
            case 87:                // W Sawtooth wave
                // selectSawtooth();
                break;
            case 33:                // PageUp
                setExpMax();
                break;
            case 34:                // PageDown
                setExpMin();
                break;
            case 38:                // Up arrow
                animateTo(MODEL.control_id.exp_pedal, ctrl ? 63 : 127);
                break;
            case 39:                // Right arrow
                presetInc();
                break;
            case 40:                // Down arrow
                animateTo(MODEL.control_id.exp_pedal, ctrl ? 63 : 0);
                break;
            case 37:                // Left arrow
                presetDec();
                break;
        }
    }
}

// noinspection JSUnusedLocalSymbols
function keyUp(code) {

    if (!kb_enabled) return;

    switch (code) {
        case 16:                // Shift
            showExpValues(false);
            break;
        case 18:                // ALT
            $(".header-shortcut").addClass("hidden");
            switchKnobsDisplay(false);
            break;
        case 27:                // close all opened panel with ESC key
            // closeAppPreferencesPanel();
            // closeGlobalSettingsPanel();
            // closeHelpPanel();
            // showDefaultPanel();
            break;
        // case 84:                // T            tap
        //     tapRelease("cc-28-127");
        //     break;
    }
}
