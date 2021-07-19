import {log} from "@utils/debug";
import MODEL from "@model";
import {requestGlobalSettings, sendSysex} from "@midi/midiOut";

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
        const c = $(e.currentTarget).children('.value-127');
        const off = c.is('.hidden');

        let value;
        if (off) {
            value = 127;
            $(e.currentTarget).children('.value-0').addClass('hidden');
            $(e.currentTarget).children('.value-127').removeClass('hidden');
        } else {
            value = 0;
            $(e.currentTarget).children('.value-0').removeClass('hidden');
            $(e.currentTarget).children('.value-127').addClass('hidden');
        }

        log(`setupGlobalSettings: ${setting_number}=${value}`);
        sendSysex(MODEL.getSysexDataForGlobalConfig(setting_number, value));
        return false;
    });
}

/**
 * Update the UI from the MODEL controls values.
 */
export function updateGlobalSettings() {
    log("updateGlobalSettings()");
    for (let i=0; i < MODEL.global_conf.length; i++) {
        const g = MODEL.global_conf[i];
        if (g.value) {
            $(`#global-${g.id} span.value-0`).addClass('hidden');
            $(`#global-${g.id} span.value-127`).removeClass('hidden');
        } else {
            $(`#global-${g.id} span.value-0`).removeClass('hidden');
            $(`#global-${g.id} span.value-127`).addClass('hidden');
        }
    }
    log("updateGlobalSettings done");
}
