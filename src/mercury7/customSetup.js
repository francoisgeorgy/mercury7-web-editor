import MODEL from "@model";
import {updateControl} from "@shared/controller";
import {TRACE} from "@shared/utils/debug";

export function customSetupUI() {

    if (TRACE) console.groupCollapsed("customSetupUI");

    $('#tempo-label').click(() => {
        const c = MODEL.control[MODEL.control_id.tempo];
        if (c.human === MODEL._tempo_bpm) {
            c.human = MODEL._tempo_ms;
            $('#tempo-label').text('tempo MS');
        } else {
            c.human = MODEL._tempo_bpm;
            $('#tempo-label').text('tempo BPM');
        }
        updateControl(c.cc_type, MODEL.control_id.tempo, MODEL.getControlValue(c), MODEL.getMappedControlValue(c));
    });

    if (TRACE) console.groupEnd();
}
