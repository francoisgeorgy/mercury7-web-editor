import {log} from "./debug";
import MODEL from "./model";
import {requestGlobalConfig, sendSysEx} from "./midi_out";
import {hideDefaultPanel, showDefaultPanel} from "./ui";
import {closeAppPreferencesPanel} from "./ui_app_prefs";
import {setStatus} from "./ui_messages";
import {closeHelpPanel} from "./ui_help";

const CONTAINER = "#global-settings";
// const MENU_ENTRY = "#menu-global";

/*
export function toggleGlobalSettingsPanel() {
    const main = $("#main");
    closeAppPreferencesPanel();
    if (main.is(".settings-view")) {
        closeAppPreferencesPanel();
        closeSettingsPanel();
        showDefaultPanel();
        $(MENU_ENTRY).parent(".menu-entry").removeClass("menu-active");
    } else {
        main.removeClass("main-default").addClass("settings-view");
        $(CONTAINER).removeClass("closed");
        $(MENU_ENTRY).parent(".menu-entry").addClass("menu-active");
    }
    return false;   // disable the normal href behavior
}
*/

export function openSettingsPanel() {
    hideDefaultPanel();
    closeAppPreferencesPanel();
    closeHelpPanel();
    $(CONTAINER).removeClass("closed");
    setStatus("Request global config");
    requestGlobalConfig();
    // updateGlobalConfig() will be called by the sysex handler after having received the global conf sysex response.
    return false;
}

export function closeSettingsPanel() {
    $(CONTAINER).addClass("closed");
    return false;
}

export function setupGlobalConfig() {
    log("setupGlobalConfig()");

    $(".close-settings-panel").click(() => {
        closeSettingsPanel();
        showDefaultPanel();
    });

    $("input[type='radio'].global-config").on("change", function(c) {
        const setting_number = parseInt(c.target.name.split("-")[1]);
        if (isNaN(setting_number)) {
            console.log("setupGlobalConfig: invalid setting number", c.target.name);
            return false;
        }
        const value = parseInt(c.target.value);
        if (isNaN(value)) {
            console.log("setupGlobalConfig: invalid value", c.target.value);
            return false;
        }
        log(`setupGlobalConfig: ${setting_number}=${value}`);
        sendSysEx(MODEL.getSysexDataForGlobalConfig(setting_number, value));
    });
    return true;
}


/**
 * Update the UI from the MODEL controls values.
 */
export function updateGlobalConfig() {

    log("updateGlobalConfig()");

    // console.log(MODEL.global_conf);
    for (let i=0; i < MODEL.global_conf.length; i++) {
        const g = MODEL.global_conf[i];
        // console.log(g);
        $(`#global-${g.id}-${g.value}`).prop('checked', true);
    }

    log("updateGlobalConfig done");
}
