import {log} from "./debug";
import MODEL from "./model";
import Knob from "svg-knob";
import {KNOB_THEME_BLUE} from "./ui_knobs_theme";

export const knobs = {};         // svg-knob

/**
 *
 */
export function setupKnobs(userActionCallback) {

    log("setupKnobs()");

    for (let i=0; i < MODEL.control.length; i++) {

        const c = MODEL.control[i];
        if (typeof c === "undefined") {
            log("device undefined", i);
            continue;
        }

        const id = `${c.cc_type}-${c.cc_number}`;
        const v = MODEL.getControlValue(MODEL.control[i]);

        let elem = document.getElementById(id);
        if (elem === null) {
            continue;
        }
        if (!elem.classList.contains("knob")) return;

        log(`configure #${id}: range=${c.cc_range}, init-value=${v}`);

        // knobs[id] = new Knob(elem, KNOB_THEME_DEFAULT);
        knobs[id] = new Knob(elem, KNOB_THEME_BLUE);
        knobs[id].config = {
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
