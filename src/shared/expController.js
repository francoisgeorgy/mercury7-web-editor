import {log} from "@utils/debug";
import Slider from "svg-slider";
import MODEL from "@model";
import {control} from "@model";
import {knobs} from "@shared/knobs";
import {fullUpdateDevice, updateDevice} from "@midi/midiOut";
import {MIXER_SLIDER_SCHEME} from "@device/knobsTheme";
import {updateControls} from "@shared/controller";

export const sliders = {};

export function inExpMode() {
    return $("#exp-close-bt").is(".on");
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
        $(".header.exp").addClass("exp-mode");
    } else {
        $(".header.exp").removeClass("exp-mode");
    }

} // setupKnobs

export function expToe(showCopyButton = false) {
    $("#exp-close-bt").addClass("on");
    $("#cc-4-value").hide();
    if (showCopyButton) $("#exp-copy").show();
    updateExpSlider(127);
}

export function expHeel() {
    $("#exp-close-bt").removeClass("on");
    $("#exp-copy").hide();
    $("#cc-4-value").show();
    updateExpSlider(0);
}

export function toggleExpEditMode() {
    if (inExpMode()) {
        log("editExpValues: in EXP mode, switch to normal mode");
        expHeel();
        updateDevice("cc", MODEL.control_id.exp_pedal, 0);
        showExpValues(false);
        // appendMessage("You are now editing the normal values", true);
    } else {
        log("editExpValues: in normal mode, switch to EXP mode");
        expToe(true);
        updateDevice("cc", MODEL.control_id.exp_pedal, 127);
        showExpValues(true);
        // appendMessage("You are now editing the EXP (toe down) values", true);
    }
}

export function resetExp() {
    log("resetExp()");

    const cc = MODEL.control_id.exp_pedal;
    const v = MODEL.control[cc].init_value;

    MODEL.setControlValue("cc", 4, v);  // TODO: create a resetControl() method in the model
    const id = `cc-${cc}`;
    sliders[id].value = v;
    document.getElementById(`${id}-value`).innerText = MODEL.control[MODEL.control_id.exp_pedal].human(v);

    $("#exp-close-bt").removeClass("on");
    $("#exp-copy").hide();
    $("#cc-4-value").show();

    showExpValues(false);
}

export function updateExpSlider(value) {
    log("updateExpSlider");
    const cc = MODEL.control_id.exp_pedal;
    const id = `cc-${cc}`;
    sliders[id].value = value;
    document.getElementById(`${id}-value`).innerText = MODEL.control[cc].human(value);
}

export function setupExp(userActionCallback) {

    log("setupSlider()");

    const cc = MODEL.control_id.exp_pedal;
    const id = `cc-${cc}`;

    const slider_element = document.getElementById(id);
    sliders[id] = new Slider(slider_element, MIXER_SLIDER_SCHEME);

    slider_element.addEventListener("change", function(event) {
        userActionCallback("cc", cc, event.detail);
    });

    $("#exp-close-bt").click(toggleExpEditMode);

    $("#exp-copy")
        .mousedown(function() {
            this.classList.add("on");
            MODEL.copyFirstToSecondValues();
            fullUpdateDevice();
            MODEL.interpolateExpValues(MODEL.control[MODEL.control_id.exp_pedal].raw_value);
            updateControls(true);
            // appendMessage("EXP: toe-up values copied to toe-down.");
        })
        .mouseup(function() {
            this.classList.remove("on");
        });

    resetExp();
}
