import {preferences, savePreferences} from "./preferences";

export function setupTooltips() {

    const t = $('#menu-toggle-tooltip');
    if (preferences.tooltips) {
        t.removeClass('inactive');
    } else {
        t.addClass('inactive');
    }

    t.click(() => {
        const e = $('#menu-toggle-tooltip');
        if (e.is('.inactive')) {
            e.removeClass('inactive');
            savePreferences({tooltips: 1});
        } else {
            e.addClass('inactive');
            savePreferences({tooltips: 0});
        }
    })

    $('.menu-entry')
        .mouseenter((e) => {
            const c = $(e.currentTarget).children('.tooltip').first();
            // console.log(e, c);
            if (tooltipsEnabled() || c.is('.tooltip-always')) c.removeClass('hidden')
        })
        .mouseleave((e) => {
            const c = $(e.currentTarget).children('.tooltip').first();
            if (tooltipsEnabled() || c.is('.tooltip-always')) c.addClass('hidden')
        });

}

export function tooltipsEnabled() {
    return !$('#menu-toggle-tooltip').is('.inactive');
}
