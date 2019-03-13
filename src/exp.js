import {log} from "./debug";
import {control} from "./model/cc";
import {knobs} from "./ui_knobs";
import {updateDevice} from "./midi_out";
import MODEL from "./model";

let edit_exp_values = false;   // true when editing value2

export function inExpMode() {
    return edit_exp_values;
}

export function showExpValues(display_exp_values = false) {

    log(`showExpValues(${display_exp_values})`);

    for (let i = 0; i < control.length; i++) {

        const c = control[i];
        if (typeof c === "undefined") continue;
        if (!c.two_values) continue;

        const id = `${c.cc_type}-${c.cc_number}`;

        if (knobs[id]) {
            knobs[id].value = display_exp_values ? c.raw_value2 : c.raw_value;
        }
    }

    if (display_exp_values) {
        $(".header.exp").addClass("lowercase");
    } else {
        $(".header.exp").removeClass("lowercase");
    }

} // setupKnobs

export function editExpValues(enable = true, update_device = true) {

    log(`%ceditExpValues(${enable}, ${update_device})`, "color: yellow; font-weight: bold");

    edit_exp_values = enable;
    if (edit_exp_values) {
        $("#exp-close").addClass("exp-on");
        $("#exp-open").removeClass("exp-on");

        if (update_device) updateDevice("cc", MODEL.control_id.exp_pedal, 127);

        showExpValues(true);

    } else {
        $("#exp-close").removeClass("exp-on");
        if (update_device) updateDevice("cc", MODEL.control_id.exp_pedal, 0);

        showExpValues(false);
    }
}

function editNormalValues() {
    editExpValues(false);
}

export function toggleExpEditMode() {
    log("toggleExpEditMode()");
    if (edit_exp_values) {
        editNormalValues();
    } else {
        editExpValues();
    }
}

export function setupExp() {
    $("#exp-close").click(toggleExpEditMode);   // EXP slider "close"
    $("#exp-open").click(editNormalValues);     // EXP slider "open"
}
