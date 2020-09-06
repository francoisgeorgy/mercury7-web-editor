
let activity_in = false;

export function showMidiInActivity(input_num = 1) {
    if (!activity_in) {
        activity_in = true;
        const led = $(`#midi-in${input_num}-led`);
        led.addClass("led-on");
        window.setTimeout(
            function () {
                led.removeClass("led-on");
                activity_in = false;
            },
            250);
    }
}

let activity_out = false;

export function showMidiOutActivity() {
    if (!activity_out) {
        activity_out = true;
        $("#midi-out-led").addClass("led-on");
        window.setTimeout(
            function () {
                $("#midi-out-led").removeClass("led-on");
                activity_out = false;
            },
            250);
    }
}
