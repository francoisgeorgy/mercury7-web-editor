
let activity_in = false;

export function showMidiInActivity() {
    if (!activity_in) {
        activity_in = true;
        $("#midi-in-led").addClass("on");
        let timeoutID = window.setTimeout(
            function () {
                $("#midi-in-led").removeClass("on");
                activity_in = false;
                timeoutID = null;
            },
            500);
    }
}

let activity_out = false;

export function showMidiOutActivity() {
    if (!activity_out) {
        activity_out = true;
        $("#midi-out-led").addClass("on");
        let timeoutID = window.setTimeout(
            function () {
                $("#midi-out-led").removeClass("on");
                activity_out = false;
                timeoutID = null;
            },
            500);
    }
}
