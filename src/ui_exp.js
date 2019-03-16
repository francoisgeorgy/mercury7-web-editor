import {log} from "./debug";
import Slider from "svg-slider";
import MODEL from "./model";
import {control} from "./model/cc";
import {knobs} from "./ui_knobs";
import {fullUpdateDevice, updateDevice} from "./midi_out";
import {appendMessage} from "./ui_messages";
import {updateControls} from "./ui";

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
        $(".header.exp").addClass("lowercase");
    } else {
        $(".header.exp").removeClass("lowercase");
    }

} // setupKnobs

export function toggleExpEditMode() {

    log(`%ceditExpValues()`, "color: yellow; font-weight: bold");

    if (inExpMode()) {

        log("editExpValues: in EXP mode, switch to normal mode");

        $("#exp-close-bt").removeClass("on");
        $("#exp-copy").hide();
        $("#cc-4-value").show();

        updateDevice("cc", MODEL.control_id.exp_pedal, 0);

        showExpValues(false);
        appendMessage("You are now editing the normal values");

    } else {

        log("editExpValues: in normal mode, switch to EXP mode");

        $("#exp-close-bt").addClass("on");
        $("#cc-4-value").hide();
        $("#exp-copy").show();

        updateDevice("cc", MODEL.control_id.exp_pedal, 127);

        showExpValues(true);
        appendMessage("You are now editing the EXP (tow-down) values", true);

    }
}

export function resetExp() {
    log("resetExp()");

    const cc = MODEL.control_id.exp_pedal;
    const v = MODEL.control[cc].init_value;

    MODEL.setControlValue("cc", 4, v);  // TODO: create a resetControl() method in the model
    const id = `cc-${cc}`;
    sliders[id].value = v;
    const slider_value_element = document.getElementById(`${id}-value`);
    slider_value_element.innerText = MODEL.control[MODEL.control_id.exp_pedal].human(v);

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
    const slider_value_element = document.getElementById(`${id}-value`);
    slider_value_element.innerText = MODEL.control[cc].human(value);
}

export function setupExp(userActionCallback) {

    log("setupSlider()");

    const cc = MODEL.control_id.exp_pedal;
    const id = `cc-${cc}`;

    const mixer_slider_scheme = {
        palette: "dark",
        value_min: 0,
        value_max: 127,
        width: 40,
        markers_length: 44,
        markers_width: 2,
        markers_color: "#b3a1f1",      // --sw-color
        cursor_height: 12,
        cursor_width: 26,
        cursor_color: "#e8f1ff",
        track_color: "#e8f1ff",
        track_bg_color: "#333",
        format: v => MODEL.control[cc].human(v)
    };

    const slider_element = document.getElementById(id);
    sliders[id] = new Slider(slider_element, mixer_slider_scheme);

    slider_element.addEventListener("change", function(event) {
        userActionCallback("cc", cc, event.detail);
    });

    $("#exp-close-bt").click(toggleExpEditMode);

    $("#exp-copy").mousedown(function() {
        this.classList.add("on");
        MODEL.copyFirstToSecondValues();
        fullUpdateDevice();
        MODEL.interpolateExpValues(MODEL.control[MODEL.control_id.exp_pedal].raw_value);
        updateControls(true);
        appendMessage("EXP: toe-up values copied to toe-down.");
    });

    $("#exp-copy").mouseup(function() {
        this.classList.remove("on");
    });

    resetExp();
}
