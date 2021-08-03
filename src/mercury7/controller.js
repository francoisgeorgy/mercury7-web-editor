import {log} from "@utils/debug";

/*
export function updateTempoBPMText() {
    log("updateTempoBPMText");
    const c = MODEL.control[MODEL.control_id.time];
    const time = Math.round(MODEL.getControlValue(c) / 127 * 120) * 10;
    const bpm = time > 0 ? Math.round(60000 / time) : 0;
    $('#tempo-bpm').text(`${bpm} BPM`);
}
*/

export function customUpdateUI(control_type, control_number) {
    log("customUpdateUI", control_type, control_number);
}
