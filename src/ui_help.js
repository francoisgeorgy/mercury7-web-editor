import {warn} from "./debug";

/*
const CONTAINER = "#help-panel";
*/

export function openHelpPanel() {
/*
    hideDefaultPanel();
    closeGlobalSettingsPanel();
    closeAppPreferencesPanel();
    $(CONTAINER).removeClass("closed");
*/
    return false;
}

export function closeHelpPanel() {
/*
    $(CONTAINER).addClass("closed");
*/
    return false;
}

export function setupHelpPanel() {
    warn("setupHelpPanel: TODO: v1.5");
    /*
    $(".close-help-panel").click(() => {
        closeHelpPanel();
        showDefaultPanel();
    });
    */
    return true;
}
