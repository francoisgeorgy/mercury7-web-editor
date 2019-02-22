import {log} from "./debug";
import {settings} from "./settings";
import * as WebMidi from "webmidi";

export function updateSelectDeviceList() {

    log("updateSelectDeviceList");

    let present = false;
    let s = $("#midi-input-device");
    s.empty().append($("<option>").val("").text("- select -"));
    // noinspection JSUnresolvedVariable
    s.append(
        WebMidi.inputs.map((port) => {
            present = present || (port.id === settings.input_device_id);
            return $("<option>").val(port.id).text(`${port.name}`);
        })
    );
    s.val(present ? settings.input_device_id : "");

    present = false;
    s = $("#midi-output-device");
    s.empty().append($("<option>").val("").text("- select -"));
    // noinspection JSUnresolvedVariable
    s.append(
        WebMidi.outputs.map((port) => {
            present = present || (port.id === settings.output_device_id);
            return $("<option>").val(port.id).text(`${port.name}`);
        })
    );
    s.val(present ? settings.output_device_id : "");
}
