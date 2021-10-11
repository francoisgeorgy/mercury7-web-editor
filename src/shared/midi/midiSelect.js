import {log} from "@utils/debug";
import {preferences} from "@shared/preferences";
import * as WebMidi from "webmidi";

export function updateSelectDeviceList() {

    log("updateSelectDeviceList");

    let present = false;
    let s = $("#midi-input-device");
    s.empty().append($("<option>").val("").text("select MIDI input..."));
    // noinspection JSUnresolvedVariable
    s.append(
        WebMidi.inputs.map((port) => {
            present = present || (port.id === preferences.input_device_id);
            return $("<option>").val(port.id).text(`${port.name}`);
        })
    );
    s.val(present ? preferences.input_device_id : "");

    present = false;
    s = $("#midi-output-device");
    s.empty().append($("<option>").val("").text("select MIDI output..."));
    // noinspection JSUnresolvedVariable
    s.append(
        WebMidi.outputs.map((port) => {
            present = present || (port.id === preferences.output_device_id);
            return $("<option>").val(port.id).text(`${port.name}`);
        })
    );
    s.val(present ? preferences.output_device_id : "");

    present = false;
    s = $("#midi-input2-device");
    s.empty().append($("<option>").val("").text("not used"));
    // noinspection JSUnresolvedVariable
    s.append(
        WebMidi.inputs.map((port) => {
            present = present || (port.id === preferences.input2_device_id);
            return $("<option>").val(port.id).text(`${port.name}`);
        })
    );
    s.val(present ? preferences.input2_device_id : "");

}
