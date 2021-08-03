import {log, TRACE, warn} from "@utils/debug";
import {setAndSendPC, updateDevice} from "@midi/midiOut";
import MODEL from "@model";
import {setPresetSelectorDirty} from "@shared/presets";
import {setLibraryPresetDirty} from "@shared/preset_library";
import {inExpMode, updateExpSlider} from "@shared/expController";
import {knobs} from "@shared/knobs";
import {updateBypassSwitch, updateMomentaryFootswitch, updateOptionSwitch} from "@shared/switches";
import {updateLeftFootswitch} from "@device/footswitches";
import {CC_EXPRESSION_PEDAL, CC_LEFT_FOOTSWITCH, CC_RIGHT_FOOTSWITCH} from "@model";
import {customUpdateUI} from "@device/controller";

/**
 * Handles a change made by the user in the UI.
 */
export function handleUserAction(control_type, control_number, value) {
    log(`handleUserAction(${control_type}, ${control_number}, ${value})`);
    const n = parseInt(control_number, 10);
    if (control_type === 'pc') {
        setAndSendPC(n);
    } else {
        if (n !== MODEL.control_id.exp_pedal) {
            setPresetSelectorDirty();
            setLibraryPresetDirty();
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

        if (num === CC_EXPRESSION_PEDAL) {
            updateExpSlider(value);
            return;
        }

        if (num === CC_RIGHT_FOOTSWITCH) {
            updateBypassSwitch(value);
            return;
        }

        if (num === CC_LEFT_FOOTSWITCH) {
            updateLeftFootswitch(value);
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

                } else if (c.is(".momentary-switch")) {
                    log(`updateControl(${control_type}, ${num}, ${value}) momentary-switch`);

                    updateMomentaryFootswitch(`${id}-${mappedValue}`, mappedValue);
                    setTimeout(() => updateMomentaryFootswitch(`${id}-${mappedValue}`, 0), 200);

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
    for (let i = 0; i < MODEL.control.length; i++) {
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
        customUpdateUI(c.cc_type, i);
    }
    if (TRACE) console.groupEnd();
} // updateControls()

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
        // updateControl(control_type, num, value);
        const c = MODEL.control[num];
        updateControl(control_type, num, MODEL.getControlValue(c), MODEL.getMappedControlValue(c));

        if (num === MODEL.control_id.exp_pedal) {
            MODEL.interpolateExpValues(value);
            updateControls(true);
        }

        setPresetSelectorDirty();
        setLibraryPresetDirty();

        customUpdateUI(control_type, control_number);

    } else {
        log(`the MODEL does not support this control: ${num}`)
    }
}