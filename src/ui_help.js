import {closeSettingsPanel} from "./ui_global_settings";
import {hideDefaultPanel, showDefaultPanel} from "./ui";
import {closeAppPreferencesPanel} from "./ui_app_prefs";

const CONTAINER = "#help-panel";

export function openHelpPanel() {
    hideDefaultPanel();
    closeSettingsPanel();
    closeAppPreferencesPanel();
    $(CONTAINER).removeClass("closed");
    return false;
}

export function closeHelpPanel() {
    $(CONTAINER).addClass("closed");
    return false;
}

export function setupHelpPanel() {
    $(".close-help-panel").click(() => {
        closeHelpPanel();
        showDefaultPanel();
    });
    return true;
}
