
export function updateLeftFootswitch(value) {
    log("updateLeftFootswitch", value);
    if (value === 0) {
        $("#cc-28-0").addClass("sw-off");
        $("#cc-28-127").removeClass("sw-off");
    } else {
        $("#cc-28-127").addClass("sw-off");
        $("#cc-28-0").removeClass("sw-off");
    }
}

export function updateBypassSwitch(value) {
    log("updateBypassSwitch", value);
    if (value === 0) {
        $("#cc-14-0").addClass("sw-off");
        $("#cc-14-127").removeClass("sw-off");
    } else {
        $("#cc-14-127").addClass("sw-off");
        $("#cc-14-0").removeClass("sw-off");
    }
}