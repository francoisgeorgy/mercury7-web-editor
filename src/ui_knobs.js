import {log} from "./debug";
import MODEL from "./model";
import Knob from "svg-knob";

export const knobs = {};         // collection of svg-knob

const KNOB_THEME_DEFAULT = {

    label: false,
    value_min: 0,
    value_max: 127,
    value_resolution: 1,
    default_value: 0,
    center_zero: false,
    center_value: 0,
    format: v => v,
    snap_to_steps: false,
    mouse_wheel_acceleration: 1,

    bg_radius: 40,
    bg_border_width: 1,

    cursor_radius: 24,
    cursor_length: 14,
    cursor_width: 6,
    cursor_color_init: "#e8f1ff",
    cursor_color: "#e8f1ff",

    track: true,
    track_color_init: "#e8f1ff",
    track_color: "#e8f1ff",
    track_radius: 36,
    track_width: 5,
    class_track : "knob-track",

    track_bg: false,

    bg:  true,
    cursor: true,
    linecap: "round",
    value_text: true,
    value_position: 58,    // empirical value: HALF_HEIGHT + config.font_size / 3
    font_family: "sans-serif",
    font_size: 25,
    font_weight: "bold",
    markers: false,

    class_bg: "knob-bg",
    class_value : "knob-value",
    class_cursor : "knob-cursor",
    class_markers: "knob-markers",

    markers_color: "#3680A4",
    font_color: "#fff"
};

/**
 *
 */
export function setupKnobs(userActionCallback) {

    log("setupKnobs()");

    for (let i=0; i < MODEL.control.length; i++) {

        const c = MODEL.control[i];
        if (typeof c === "undefined") {
            // log("device undefined", i);
            continue;
        }

        const id = `${c.cc_type}-${c.cc_number}`;
        const v = MODEL.getControlValue(MODEL.control[i]);

        let elem = document.getElementById(id);
        if (elem === null) {
            continue;
        }
        if (!elem.classList.contains("knob")) continue;

        log(`configure #${id}: range=${c.cc_range}, init-value=${v}`);

        knobs[id] = new Knob(elem, KNOB_THEME_DEFAULT);
        knobs[id].config = {
            // zero_at: 270.0,
            // angle_min: 70.0,
            // angle_max: 290.0,
            value_min: Math.min(...c.cc_range),
            value_max: Math.max(...c.cc_range),
            default_value: v,
            center_zero: Math.min(...c.range) < 0,
            center_value: c.hasOwnProperty("cc_center") ? c.cc_center : c.init_value,
            format: v => c.human(v)
        };
        knobs[id].disableDebug();

        elem.addEventListener("change", function(event) {
            userActionCallback(c.cc_type, c.cc_number, event.detail);
        });
    }

} // setupKnobs

/**
 *
 */
export function switchKnobsDisplay(display_raw_value = false) {

    log("switchKnobsDisplay()");

    for (const id in knobs) {
        if (knobs.hasOwnProperty(id)) {
            knobs[id].setConfigValue("display_raw", display_raw_value);
        }
    }

} // setupKnobs
