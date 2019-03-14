import {log} from "./debug";
import Slider from "svg-slider";
import MODEL from "./model";
import {editExpValues} from "./exp";

export const sliders = {};

export function resetExp() {
    log("resetExp()");

    const cc = MODEL.control_id.exp_pedal;
    const v = MODEL.control[cc].init_value;

    MODEL.setControlValue("cc", 4, v);  // TODO: create a resetControl() method in the model
    const id = `cc-${cc}`;
    sliders[id].value = v;
    const slider_value_element = document.getElementById(`${id}-value`);
    slider_value_element.innerText = MODEL.control[MODEL.control_id.exp_pedal].human(v);

    editExpValues(false, false);
    $("#exp-close").removeClass("exp-on");
    $("#exp-open").removeClass("exp-on");
}

export function updateExpSlider(value) {
    log("updateExpSlider");
    const cc = MODEL.control_id.exp_pedal;
    const id = `cc-${cc}`;
    sliders[id].value = value;
    const slider_value_element = document.getElementById(`${id}-value`);
    slider_value_element.innerText = MODEL.control[cc].human(value);
}

export function setupSliders(userActionCallback) {

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
        track_bg_color: "#333"
    };

    const slider_element = document.getElementById(id);
    sliders[id] = new Slider(slider_element, mixer_slider_scheme);

    slider_element.addEventListener("change", function(event) {
        userActionCallback("cc", cc, event.detail);
    });

    resetExp();

}



