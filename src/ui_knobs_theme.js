
export const KNOB_THEME_DEFAULT = {

    // with_label: false,
    label: false,
    value_min: 0,
    value_max: 127,
    value_resolution: 1,
    default_value: 0,
    center_zero: false,
    center_value: 0,
    format: v => v,
    snap_to_steps: false,
    mouse_wheel_acceleration: 1,
    // background disk:
    bg_radius: 34,
    bg_border_width: 1,
    // track background:
    track_bg_radius: 40,
    track_bg_width: 5,
    // track:
    track_radius: 40,
    track_width: 5,
    // cursor
    cursor_radius: 20,
    cursor_length: 14,
    cursor_width: 4,
    // appearance:
    palette: "dark",
    bg:  true,
    track_bg: false,
    track: true,
    cursor: true,
    linecap: "round",
    value_text: true,
    value_position: 58,    // empirical value: HALF_HEIGHT + config.font_size / 3
    font_family: "sans-serif",
    font_size: 25,
    font_weight: "bold",
    markers: false,
    class_bg: "knob-bg",
    // class_track_bg : "knob-track-bg",
    class_track : "knob-track",
    class_value : "knob-value",
    class_cursor : "knob-cursor",
    class_markers: "knob-markers",
    // bg_color: "#333",
    // bg_border_color: "#000",
    // track_bg_color: "#555",

    track_color_init: "#e7c100",
    track_color: "#e7c100",

    cursor_color_init: "#d3b000",
    cursor_color: "#d3b000",

    markers_color: "#3680A4",
    font_color: "#FFEA00"
    // bg_color: "#333",
    // bg_border_color: "#888",
    // track_bg_color: "#555",
    // track_color_init: "#999",
    // track_color: "#bbb",
    // cursor_color_init: "#999",
    // cursor_color: "#bbb",
    // markers_color: "#3680A4",
    // font_color: "#FFEA00"
};


export const KNOB_THEME_BLUE = {

    // with_label: false,
    label: false,
    value_min: 0,
    value_max: 127,
    value_resolution: 1,
    default_value: 0,
    center_zero: false,
    center_value: 0,
    format: v => v,
    snap_to_steps: false,
    mouse_wheel_acceleration: 1,

    bg_radius: 40,
    bg_border_width: 1,

    cursor_radius: 24,
    cursor_length: 14,
    cursor_width: 6,
    // cursor_color_init: "#ccc",
    // cursor_color: "#ccc",
    cursor_color_init: "#e8f1ff",
    cursor_color: "#e8f1ff",

    track: true,
    // track_color_init: "#ccc",
    // track_color: "#ccc",
    track_color_init: "#e8f1ff",
    track_color: "#e8f1ff",
    track_radius: 36,
    track_width: 5,
    class_track : "knob-track",

    track_bg: false,
    // track_bg_radius: 40,
    // track_bg_width: 8,
    // track_bg_color: "rgba(0, 0, 0, 0.1)",

    bg:  true,
    cursor: true,
    linecap: "round",
    value_text: true,
    value_position: 58,    // empirical value: HALF_HEIGHT + config.font_size / 3
    font_family: "sans-serif",
    font_size: 25,
    font_weight: "bold",
    markers: false,

    class_bg: "knob-bg",
    class_value : "knob-value",
    class_cursor : "knob-cursor",
    class_markers: "knob-markers",
    // bg_color: "#333",
    // bg_border_color: "#000",

    markers_color: "#3680A4",
    font_color: "#fff"
    // bg_color: "#333",
    // bg_border_color: "#888",
    // track_bg_color: "#555",
    // track_color_init: "#999",
    // track_color: "#bbb",
    // cursor_color_init: "#999",
    // cursor_color: "#bbb",
    // markers_color: "#3680A4",
    // font_color: "#FFEA00"
};

export const KNOB_THEME_SMALL = {

    // with_label: false,
    label: false,
    value_min: 0,
    value_max: 127,
    value_resolution: 1,
    default_value: 0,
    center_zero: false,
    center_value: 0,
    format: v => v,
    snap_to_steps: false,
    mouse_wheel_acceleration: 1,
    // background disk:
    bg_radius: 34,
    bg_border_width: 1,
    // track background:
    track_bg_radius: 40,
    track_bg_width: 5,
    // track:
    track_radius: 40,
    track_width: 5,
    // cursor
    cursor_radius: 20,
    cursor_length: 14,
    cursor_width: 4,
    // appearance:
    palette: "dark",
    bg:  true,
    track_bg: false,
    track: true,
    cursor: true,
    linecap: "round",
    value_text: true,
    value_position: 58,    // empirical value: HALF_HEIGHT + config.font_size / 3
    font_family: "sans-serif",
    font_size: 25,
    font_weight: "bold",
    markers: false,
    class_bg: "knob-bg",
    // class_track_bg : "knob-track-bg",
    class_track : "knob-track",
    class_value : "knob-value",
    class_cursor : "knob-cursor",
    class_markers: "knob-markers",
    // bg_color: "#333",
    // bg_border_color: "#000",
    // track_bg_color: "#555",

    track_color_init: "#e7c100",
    track_color: "#e7c100",

    cursor_color_init: "#d3b000",
    cursor_color: "#d3b000",

    markers_color: "#3680A4",
    font_color: "#FFEA00"
    // bg_color: "#333",
    // bg_border_color: "#888",
    // track_bg_color: "#555",
    // track_color_init: "#999",
    // track_color: "#bbb",
    // cursor_color_init: "#999",
    // cursor_color: "#bbb",
    // markers_color: "#3680A4",
    // font_color: "#FFEA00"
};


// backup:
/*
export const KNOB_THEME_DEFAULT = {

    // with_label: false,
    label: false,
    value_min: 0,
    value_max: 127,
    value_resolution: 1,
    default_value: 0,
    center_zero: false,
    center_value: 0,
    format: v => v,
    snap_to_steps: false,
    mouse_wheel_acceleration: 1,
    // background disk:
    bg_radius: 34,
    bg_border_width: 1,
    // track background:
    track_bg_radius: 40,
    track_bg_width: 5,
    // track:
    track_radius: 40,
    track_width: 5,
    // cursor
    cursor_radius: 20,
    cursor_length: 14,
    cursor_width: 4,
    // appearance:
    palette: "dark",
    bg:  true,
    track_bg: false,
    track: true,
    cursor: true,
    linecap: "round",
    value_text: true,
    value_position: 58,    // empirical value: HALF_HEIGHT + config.font_size / 3
    font_family: "sans-serif",
    font_size: 25,
    font_weight: "bold",
    markers: false,
    class_bg: "knob-bg",
    // class_track_bg : "knob-track-bg",
    class_track : "knob-track",
    class_value : "knob-value",
    class_cursor : "knob-cursor",
    class_markers: "knob-markers",
    // bg_color: "#333",
    // bg_border_color: "#000",
    // track_bg_color: "#555",

    track_color_init: "#e7c100",
    track_color: "#e7c100",

    cursor_color_init: "#d3b000",
    cursor_color: "#d3b000",

    markers_color: "#3680A4",
    font_color: "#FFEA00"
    // bg_color: "#333",
    // bg_border_color: "#888",
    // track_bg_color: "#555",
    // track_color_init: "#999",
    // track_color: "#bbb",
    // cursor_color_init: "#999",
    // cursor_color: "#bbb",
    // markers_color: "#3680A4",
    // font_color: "#FFEA00"
};



*/
