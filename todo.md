- bugs: 
    - bypass is not set after loading preset (check w/ preset 4)

- Randomize:
    - randomize SWELL
    
- keyboard
    - remap keyboard by key-position, not key-value
        - use KeyboardEvent.code (see https://www.w3.org/TR/uievents-code/, https://keyshorts.com/blogs/blog/37615873-how-to-identify-macbook-keyboard-localization)
    - bug: shift is used for two functions

- connection/disconnection
    - ~~set preset dirty if no input or no output device connected~~

- midi
    - ignore PC echo
    - scan ports and channel until an Mercury7 is found
    - check that the connected device (chosen by the user) is an Mercury7

- preferences
    - use checkboxes to set URL update preferences
        - choices: manually, on init, on randomize, on preset change, on preset received (sysex), on file load, auto

- preset
    - auto-save current preset before switching to another preset
    - auto-save current preset after ... seconds of no-change
    - allow quick-access to preset not stored in Mercury7 memory

- print
    - add sysex as hash, not querystring
    - better layout
    - export as markdown / html

- EXP
    - ~~copy values~~                                          
    - ~~set exp value to 0 after loading a new preset~~
    - ~~set exp value to 0 after receiving a sysex preset~~

- preferences
    - ~~display raw values or human values~~ 
    - ~~display preference in the app~~

- presets management
    - file selection panel
    - re-open (last opened...)
    - favorites

- menu
    - ~~add WRITE command (save preset sysex)~~
    - ~~add READ command (read preset sysex)~~
        - ~~better to do with a PRESET select (send PC)~~

- init
    - URL params to bypass preferences
        - ~~URL param to force editor size~~
        - URL param to force init from URL or from device
        - URL param to force MIDI channel
        - URL param to force MIDI device
        - ~~URL param to force page background color~~

- keyboard
    - ~~ALT: show help keys~~
    - ~~ALT: show controls' raw values~~

- 2 layouts:
    - ~~pedal-like~~
    - logical (signal-flow)

- doc
    - update EXP screenshots
    - doc about keyboard shortcuts
    - state diagram for the ports connections/disconnections.
    - state diagram for the preset selection/save/dirty/...
    - explain that sysex works even when the channel is invalid, because sysex messages are not channel-bounded.
        - that's why we have MODEL and ID in the sysex message
    

