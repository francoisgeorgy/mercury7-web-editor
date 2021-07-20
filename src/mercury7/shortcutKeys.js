import {log} from "@utils/debug";
import {startAnimateCC} from "@shared/animateCC";
import {setAndSendPC, updateDevice} from "@midi/midiOut";
import MODEL from "@model";
import {init, presetDec, presetInc, randomize, selectPreset} from "@shared/presets";
import {updateBypassSwitch} from "@shared/switches";
import {displayRawValues} from "@shared/knobs";
import {expHeel, expToe, showExpValues, toggleExpEditMode} from "@shared/expController";
import {toggleLibrary, toggleScroll} from "@shared/preset_library";
import {updateControl, updateModelAndUI} from "@shared/controller";
import {kb_enabled} from "@shared/keyboardSupport";

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

function animateFromTo(cc, from, to) {
    startAnimateCC(cc, from, to, function (v) {
        updateModelAndUI("cc", cc, v);
        updateDevice("cc", cc, v);
    });
}

function animateTo(cc, to) {
    animateFromTo(cc, MODEL.getControlValue(MODEL.getControl(cc)), to);
}


// noinspection JSUnusedLocalSymbols
export function keyUp(code) {

    if (!kb_enabled) return;

    switch (code) {
        case 16:                // Shift
            showExpValues(false);
            expHeel();
            break;
        case 18:                // ALT
            // $(".header-shortcut").addClass("hidden");
            displayRawValues(false);
            break;
    }
}

export function keyDown(code, alt, shift, meta, ctrl) {

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
            expToe();
            break;
        case 18:                // ALT
            // $(".header-shortcut").removeClass("hidden");
            displayRawValues(true);
            break;
    }

    //FIXME: map to key's position, not key's value (in order to be isolated from the keyboard layout)

    if (!alt && !shift && !meta) {
        switch (code) {
            case 83:                // S    swell
                toggleSwell();
                break;
            case 32:                // SPACE
                toggleBypass();
                break;
            case 82:                // R Randomize
                randomize();
                break;
            case 73:                // I Init
                init();
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
            case 75:                // K
                toggleScroll();
                break;
            case 76:                // L
                toggleLibrary();
                break;
        }
    }
}
