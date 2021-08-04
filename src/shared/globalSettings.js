import {log} from "@utils/debug";
import MODEL from "@model";
import {requestGlobalSettings, sendSysex} from "@midi/midiOut";
import {global_id} from "@device/model/global_conf";

export function setupGlobalSettings() {

    $('#refresh-global-settings').click(() => {
        requestGlobalSettings();
        return false;
    });

    $('#toggle-global-lock').click(() => {

        const unlock = $("#global-lock-opened");
        const lock = $("#global-lock-closed");

        if (unlock.is(".closed")) {
            lock.addClass("closed");
            unlock.removeClass("closed");
            $('.global-setting-toggle').addClass('enabled');
        } else {
            unlock.addClass("closed");
            lock.removeClass("closed");
            $('.global-setting-toggle').removeClass('enabled');
        }
        return false;
    });

    $(".global-setting-toggle").click((e) => {

        if ($("#global-lock-opened").is('.closed')) {
            return false;
        }

        const setting_number = parseInt(e.currentTarget.id.split("-")[1]);
        const c = $(e.currentTarget).children('.value-on');
        const off = c.is('.hidden');

        let mask = $(e.currentTarget).attr("data-mask");
        if (mask === undefined) {
            mask = 0x7f;
        }
        log("global: mask is", mask);
        // const invert_mask = (~mask >>> 0) & 0x7F;     // convert an unsigned integer to a signed integer with the unsigned >>> shift operator

        const cur = MODEL.global_conf[setting_number].value;
        log("global: current value", setting_number, cur);

        let value;
        if (off) {
            // was OFF, switch to ON
            value = cur | mask;    // 1. set masked bits to 1
            // value = 127;
            $(e.currentTarget).children('.value-off').addClass('hidden');
            $(e.currentTarget).children('.value-on').removeClass('hidden');
        } else {
            // was ON, switch to OFF
            const invert_mask = (~mask >>> 0) & 0x7F;     // convert an unsigned integer to a signed integer with the unsigned >>> shift operator
            value = cur & invert_mask;    // 1. set masked bits to 0
            // value = 0;
            $(e.currentTarget).children('.value-off').removeClass('hidden');
            $(e.currentTarget).children('.value-on').addClass('hidden');
        }

        log(`setupGlobalSettings: ${setting_number}=${value}`);
        sendSysex(MODEL.getSysexDataForGlobalConfig(setting_number, value));
        return false;
    });
}

function showGlobalSetting(id, state) {
    log(`showGlobalSetting ${id} ${state}`);
    if (state) {
        $(`#global-${id} span.value-off`).addClass('hidden');
        $(`#global-${id} span.value-on`).removeClass('hidden');
    } else {
        $(`#global-${id} span.value-off`).removeClass('hidden');
        $(`#global-${id} span.value-on`).addClass('hidden');
    }
}


/**
 * Update the UI from the MODEL controls values.
 */
export function updateGlobalSettings() {
    log("updateGlobalSettings()");

    showGlobalSetting(`${global_id.input_mode}`, MODEL.global_conf[global_id.input_mode].value);
    showGlobalSetting(`${global_id.input_level}`, MODEL.global_conf[global_id.input_level].value);
    showGlobalSetting(`${global_id.relay_bypass}`, MODEL.global_conf[global_id.relay_bypass].value);
    showGlobalSetting(`${global_id.kill_dry}`, MODEL.global_conf[global_id.kill_dry].value);
    showGlobalSetting(`${global_id.tempo_select}`, MODEL.global_conf[global_id.tempo_select].value);

    // special case for global Trails because this global settings represents two values (trail, glide)
    // TRAIL, bit 1:
    showGlobalSetting(`${global_id.trails}`, MODEL.global_conf[global_id.trails].value & 0x02);  // the -b suffix is just to make the ID diff from the one above
    // TRAIL, bit 0:
    // showGlobalSetting(`${global_id.trails}-b`, MODEL.global_conf[global_id.trails].value & 0x01);

    log("updateGlobalSettings done");
}
