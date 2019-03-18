import {log} from "./debug";
import MODEL from "./model";
import {updateUI} from "./ui";
import {fullUpdateDevice} from "./midi_out";
import * as lity from "lity";
import {appendMessage} from "./ui_messages";
import {SYSEX_END_BYTE, SYSEX_PRESET} from "./model/sysex";
import {resetExp} from "./ui_exp";

//==================================================================================================================
// Preset file handling

let lightbox = null;    // lity dialog

/**
 *
 */
export function loadPresetFromFile() {
    $("#load-preset-error").empty();
    $("#preset-file").val("");
    lightbox = lity("#load-preset-dialog");
    return false;   // disable the normal href behavior when called from an onclick event
}

/**
 * Handler for the #preset-file file input element in #load-preset
 */
export function readFile() {

    let data = [];
    let f = this.files[0];
    log(`read file`, f);

    if (f) {
        let reader = new FileReader();
        reader.onload = function (e) {
            // noinspection JSUnresolvedVariable
            let view   = new Uint8Array(e.target.result);
            for (let i=0; i<view.length; i++) {
                data.push(view[i]);
                if (view[i] === SYSEX_END_BYTE) break;
            }
            const valid = MODEL.setValuesFromSysEx(data);
            if (valid.type === SYSEX_PRESET) {

                log("file read OK");
                if (lightbox) lightbox.close();

                appendMessage(`File ${f.name} read OK`);

                resetExp();
                updateUI();
                fullUpdateDevice();
                // setPresetClean();

            } else {
                log("unable to set value from file; file is not a preset sysex", valid);
                $("#load-preset-error").show().text(valid.message);
            }
        };
        reader.readAsArrayBuffer(f);
    }
}
