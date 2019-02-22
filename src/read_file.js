import {log} from "./debug";
import DEVICE from "./model";
import {updateUI} from "./ui";
import {fullUpdateDevice} from "./midi_out";
import * as lity from "lity";

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
    return false;   // disable the normal href behavior
}

/**
 * Handler for the #preset-file file input element in #load-preset
 */
export function readFile() {

    const SYSEX_END = 0xF7;

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
                if (view[i] === SYSEX_END) break;
            }
            if (DEVICE.setValuesFromSysEx(data)) {
                log("file read OK");
                if (lightbox) lightbox.close();

                updateUI();
                fullUpdateDevice();

            } else {
                log("unable to set value from file");
                $("#load-preset-error").show().text("The file is invalid.");
            }
        };
        reader.readAsArrayBuffer(f);
    }
}
