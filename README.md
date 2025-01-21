> [!NOTE]  
> **Project Status: Archived**
>
> This project is no longer being actively maintained or updated. While the repository remains available for reference and use, I do not plan to make further changes or provide ongoing support.
> 
> Thank you for your interest and understanding!


Mercury7 editor
===============

Control your Meris Mercury7 pedal with your web browser. View all the pedal's settings at once.

![Mercury7 Editor screenshot](/images/doc/mercury7-editor-v15.jpg "Mercury7 Editor screenshot")

[Open the editor](https://studiocode.dev/mercury7/editor/)


Requirements
============

- A browser that [supports](https://developer.mozilla.org/en-US/docs/Web/API/MIDIAccess#Browser_compatibility) the [WebMIDI standard](/resources/webmidi). Currently, 
only **Chrome** and **Opera** support this standard. 
- A compatible MIDI interface. The editor has been successfully tested with:
    - [Meris MIDI I/O](https://www.meris.us/product/midi-i-o/) interface
    - [Disaster Area](https://www.disasterareaamps.com/) MIDI-Baby


### Changes from the previous version (1.0):

- The preset in the URL is not supported anymore. 
- The "history" window (messages) has been discarded*.
- The Controls' description are not displayed anymore*.

(*) this may come back in a future version.

The version 1.0 is still available at [studiocode.dev/mercury7-editor-v10/](/mercury7-editor-v10/).

Setup
=====

1. Configure the Mercury7 for MIDI communication. Consult the Mercury7 user manual for the exact procedure.
    1. Set the Mercury7's EXP/MIDI jack for MIDI communication.
    2. Set the Mercury7's MIDI mode to MIDI OUT. 
    3. Choose a MIDI channel and set it.
2. Connect the Mercury7 with the MIDI interface. Be sure to use a stereo (TRS) jack cable.
3. Connect the MIDI interface to your computer.
4. Open [studiocode.dev/mercury7-editor](https://studiocode.dev/mercury7-editor/)
5. Authorize the browser to access your MIDI devices.
6. In the editor, select the MIDI input, output and channel. 
    - You can ignore the "in 2" input for the moment.
7. Move a knob on your Mercury7, the corresponding control in the editor must react accordingly.
8. Play some sound through the Mercury7 and move a knob in the editor. The sound should change as if you have moved the same control on the Mercury7. 
9. Enjoy your Mercury7!


![doc-mercury7-anim-6.gif](/images/doc/doc-mercury7-anim-2.gif)


### MIDI input no 2

The second MIDI input can be used, for example, to connect an expression pedal or a MIDI controller.

The editor will automatically forward to the Mercury7 the messages it receives on this second MIDI input. It will however ignore the messages that Mercury7 does not support.

You can also use this second input to check the configuration of an external MIDI controler even without a pedal connected to the editor. 
The received messages will update the editor's controls and thus you'll be able to check that the messages sent by your external controller are valid.
  

### Settings auto-save

The configuration of the editor is automatically saved in the browser's _local storage_. As long as you use the same browser, you just have to configure the editor once.  


### Troubleshooting

If you can switch presets from the editor but nothing happens when you move a control, that means the input and output devices are correct but that the MIDI channel is incorrect.

Consult the **Troubleshooting** chapter at the end of this page if you still have problems making your Mercury7 and the editor work together.

The page [resources/meris-pedals-checklist](/resources/meris-pedals-checklist/) could also help you.

See also the [WebMIDI](/resources/webmidi) page if you struggle with the WebMIDI configuration in your browser. 
  

Editor User Interface
=====================

MIDI communication
----

The "**in**" and "**out**" texts light up when a MIDI message is send or received.

If the Editor is able to communicate with Mercury7, the preset selector will have a light background. 
In case the Editor is not able to communicate with Mercury7, the preset selector will have a dark background. 

**Communication with Mercury7 OK:** 

![](/images/doc/doc-mercury7-preset-comm-ok.png)

**No communication with Mercury7:**

![](/images/doc/doc-mercury7-preset-comm-ko.png)


Tooltips:
---------

Tooltips (little informational text box) can be displayed for most of the User Interface (UI) commands. 

Click the <i class="far fa-comment-alt"></i> icon to enable/disable the tooltips:

![doc-mercury7-anim-6.gif](/images/doc/doc-mercury7-anim-7.gif)



Global settings:
------------------

The Global Settings are locked by default. This is to prevent any unwanted change. 

Click the lock icon (<i class="fas fa-lock-open" aria-hidden="true"></i> or <i class="fas fa-lock icon-btn" aria-hidden="true"></i>) to enable/disable the Global Settings editing.

![doc-mercury7-anim-6.gif](/images/doc/doc-mercury7-anim-5.gif)

### Important if you have more than one Meris pedal: 

If you have more than one Meris pedal connected to the same_ MIDI interface, it is recommended you do not change the Global Settings while more than one pedal is connected and powered-up. 

The Global Settings MIDI messages do not distinguish between different pedals and all the pedals connected to the same MIDI interface will receive and apply the Global Settings messages.

To work around this limitation:
1. disconnect or power-down any pedals that you do not want to change.
2. modify the global settings of the pedal that is connected.
3. reconnect the other pedals.


Init and randomize:
------------------

The INIT command resets all the control to some handy predefined values. A future version of the Editor will allow you to choose the default values.

The RANDOMIZE command sets all the controls to a random value.

The INIT and RANDOMIZE commands affect both the normal and the EXP values. 

![doc-mercury7-anim-6.gif](/images/doc/doc-mercury7-anim-6.gif)


Add current settings to the Library:
------------------

You can quickly save your current settings to the Library with the ADD TO LIB command. You can give your preset a name. 
If you leave the name empty, the preset will automatically be named with the current date & time.

You can rearange the Library Presets by drag & dropping them.

![doc-mercury7-anim-6.gif](/images/doc/doc-mercury7-anim-3.gif)


Library scrolling:
------------------

The <i class="fas fa-arrows-alt-v"></i> icon enable/disable the vertical scrolling of the Library. This is useful when the Library contains more than 16 presets.

When the Library is open, the first 16 presets are always visible.


Preset modified:
------------------

As soon as you change a control, the current preset selector display a dot to remind you that the current settings do not reflect the saved preset anymore.

![doc-mercury7-anim-12.gif](/images/doc/doc-mercury7-anim-8.gif)

If you had selected a preset from the Library and you have modified a control, the Library Preset will show a save icon. Click this save icon to update the Library Preset.

![](/images/doc/doc-mercury7-preset-update-icon.png)


How to set EXP values:
------------------

To define the values corresponding to the TOE DOWN position of the EXP pedal, click the "toe" button. As long as the "toe" button is clicked, you modify and view the EXP values.

Keyboard shortcut: pressing the SHIFT key on your keyboard is the same as clicking the "toe" button.

![doc-mercury7-anim-5.gif](/images/doc/doc-mercury7-set-exp.gif)


Presets Library
==============

The Presets Library is a simple tool to manage more than the 16 Mercury7 presets.

It is important to keep in mind that the Library stores the presets in the browser's _local storage_. It is therefore a good idea to export
them as SysEx files if you want to share them across browsers or if you don't want to lose them in case you clear all your browsing data.

A futur version of the Editor will save the Library Presets in the cloud and offer better management features. 
           
### Import Mercury7 presets:

This will read the 16 presets stored in Mercury7 memory and save them in the Presets Library. 

### Import sysex files:

You can import presets stored in files (sysex files, usually with .syx extension). 

If you import several files at once, the order you select the files is the order they will appear in the Library. You can sort them in the Library by drag-and-dropping them.

### Write presets in Mercury7:

You can write up to 16 presets in Mercury7. A popup window will allow you to choose the range of presets you want to write in Mercury7. 
    
If you want to save them in a specific order, you have to first sort the presets in Library (wih drag & drop).

### Export presets as file:
    
You can export all the Library Presets as a single zip file. 

At the moment, you cannot export only one single preset, or a selection of presets, from the Library. This will be available in a future version.

Loading a preset from the Library
---------------------------------

When you select a preset in the Library, it is sent to the Mercury7 and replace the current _live_ values of the controls. It does not replace the preset _stored in memory_. 
If you want to _keep_ the preset in Mercury7, you have to save it in Mercury7 memory. This is described in the next chapter.
    
Save a single Library Preset to Mercury7
------------------------------------

1. Select the preset in the Library.
2. Click the SAVE command in the Editor header.

Instead of clicking the SAVE button you can also press and hold the ALT button on the Mercury7.
        
Library preset icons
-------------------

![](/images/doc/doc-mercury7-preset-icons.png)

Click the <i class="fas fa-pen"></i> Pen icon to edit the name or the description only.  

Click the <i class="fas fa-trash-alt"></i> Trash to delete the preset. A locked preset must first be unlocked in order to be deleted.

Click the <i class="fas fa-lock-open"></i> Lock Open icon (that appears when you hover over the preset) to protect the preset against modification or deletion.  

Click the <i class="fas fa-lock"></i> Lock Closed icon to unlock the preset.  

Click the <i class="fas fa-save"></i> Save icon to update the preset. You can also edit the name or the description. This will overwrite the preset with the current controls' values.
                     
        
Expression pedal
================

The EXP slider allows you to simulate an expression pedal connected to the Mercury7.

* The slider's **toe up** position (slider at 0) corresponds to a opened (toe up) expression pedal.
* The slider's **down** position (slider at 127) corresponds to a closed (toe down) expression pedal.

The value displayed next to the slider is:

* 0 : corresponds to an expression pedal in the _toe up_ position (default position)
* 100 : corresponds to an expression pedal in the _toe down_ position.

### How to set the values for the EXP pedal

1. Press and hold the shift key on your compter keyboard. The Editor will show the EXP values.
2. While you hold the shift key, any change you do will alter the EXP value.

You can also set the Editor in EXP mode by pressing the TAB key on your computer keyboard or by clicking the "toe" button in the Editor.  

While the Editor is in EXP mode, a "copy" button will be displayed below the "toe" button. Use this "copy" button to copy the normal values
to the EXP values. 

While the Editor is in EXP mode, the control's name are displayed in _italic_.

When you are done, click the "toe" button again, or press your computer TAB key, to get back to the normal values.

![todo](/images/mercury7/exp_edit_mode1.jpg)

### Check your EXP config:

Move the "EXP" slider to morph the controls between the normal and EXP values.

Note: the editor will interpolate the values to show you what the Mercury7 is probably doing. 
The editor does a linear interpolation and maybe Mercury7 does a different kind of interpolation, so the interpolated value may displayed by the Editor be different from the real value Mercury7 will use.  

Please read the [Meris Mercury7 User Manual](https://www.meris.us/wp-content/uploads/2017/03/Meris_Mercury7_full_Manual-v4.pdf), section 5, for more information.
   

Keyboard shortcuts
==================

| keyboard key | function                    |
|--------------|-----------------------------|
| SPACE BAR    | toggle BYPASS               |
| Shift        | show EXP values             |
| Tab          | switch to EXP values        |
| I            | Init                        |
| R            | Randomize                   |
| Up arrow     | slowly move EXP to "toe" position; press Up again to stop the animation |
| Down arrow   | slowly move EXP to "heel" position; press Dowm again to stop the animation |
| PageUp       | set EXP to "toe" position |
| PageDown     | set EXP to "heel" position |
| Left arrow   | previous PRESET             |
| Right arrow  | next PRESET                 |
| S            | toggle SWELL        |
| L            | open/close the Library        |
| K            | enable/disable the Library scrolling        |


Startup options
===============

These URL parameters are available:

**`size=<window-size>`**

This will force the window size of the editor. 
    
`window-size` can be:

- `0` or `S` or `small` for the small window 
- `1` or `M` or `normal` for the default window 
- `2` or `L` or `large` for the full width window     
    
**`m=<margins>`**
    
This will set the external margins of the editor window.

`<margins>` must be a valid CSS margin definition. Use `%20` to represent the _space_ char in the value.     
    
**`bg=<color>`**

This will set the background color of the browser window. By default the color is `#111111`;

`<color>` must be a valid CSS color definition.     

**`deletedata=1`**

Clear all the data saved by the Editor in the browser's _local storage_.
  

Clearing the data saved in the browser
======================================

The Editor uses the browser's Local Storage to store the preferences and the Presets Library's presets.

To clear all the Editor's data, start the editor with the `deletedata=1` parameter in the URL. 
    
Example: [https://studiocode.dev/mercury7-editor/?deletedata=1](/mercury7-editor/?deletedata=1)


Troubleshooting
===============

Mercury7 and the Editor are not in sync
-----------------------------------

If you think the Editor is out of sync with Mercury7 anymore:
 
- Select a preset in the Editor.
- If the above step did not solve the problem, refresh the page in your browser (F5 or Ctrl-R in Window, Cmd-R in OSX).
- If the editor is still out of sync, check the MIDI configuration. See the next chapter.


MIDI on the Mercury7
----------------
    
If you can't get the MIDI communication working, check the following on the Mercury7:

- The Global Settings EXP MODE is set to MIDI
- The Global Settings MIDI is set to MIDI OUT
- Choose a Global Settings MIDI CHANNEL.  
- The cable between the Mercury7 and the MIDI interface is TRS (stereo).
- The MIDI interface is powered on.
- The Mercury7 is powered on.
- The TSR cable is connected between the 4 MIDI interface jack and the Mercury7's EXP/MIDI jack.
- The MIDI interface is connected to your PC.
- The MIDI editor uses the same channel as the Mercury7's MIDI channel defined in the Global Settings.

Check the [Meris Mercury7 User Manual](https://www.meris.us/wp-content/uploads/2017/03/Meris_Mercury7_full_Manual-v4.pdf) and 
the [Meris MIDI I/O User Manual](https://www.meris.us/wp-content/uploads/2018/03/Meris_MIDI_IO_Full_Manual_v1b.pdf) 
for more informations and instructions about how to set the Mercury7's Global Settings.


Limitations of this editor
==========================

This editor will _not_ work in Firefox, Safari, IE or Edge because these browsers do not support the Web MIDI API. 

The editor will not work under iOS (iPad, iPhone). 

This editor has mainly been tested with Chrome under OSX 10.14. Some tests have been done with success with Chrome under Linux Mint 17.1 and with Chrome under Windows 10. 


Known issues
============

- Selecting a preset with EXP set to max in the editor does not reset EXP when the new setting is loaded.


Thanks
======

A big thank you to Meris for having provided precious information regarding the SysEx data. This editor could not have been so complete without their support.


Disclaimer and License
======================

This editor is not endorsed by, directly affiliated with, maintained, or sponsored by Meris.             

This editor is published under [GNU General Public License v3](https://www.gnu.org/licenses/gpl-3.0.en.html).

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of 
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You can view and get a copy the license at https://www.gnu.org/licenses/licenses.en.html#GPL.

This editor is an Open Source project. You are welcome to contribute. The code is available at https://github.com/francoisgeorgy/mercury7-web-editor.

To contribute your bug fixes, new features, etc.:
 
1. Fork the project.
2. Create a pull-request.


----

If you like this application, you can [![Buy Me A Coffee](https://bmc-cdn.nyc3.digitaloceanspaces.com/BMC-button-images/custom_images/orange_img.png)](https://www.buymeacoffee.com/c6dVm4Q)
