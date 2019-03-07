Mercury7 web editor
===============

Control your Meris Mercury7 pedal with your web browser. View all the pedal's settings at once.

![Mercury7 Editor screenshot](/images/screenshots/mercury7-editor-436x322.jpg "Mercury7 Editor screenshot")

![Open the editor](https://sysex.io/mercury7/editor/)


Requirements
============

- A browser that support the [Web MIDI API](http://webaudio.github.io/web-midi-api/). Currently, 
only **Chrome** and **Opera** support this standard. 
- A [Meris MIDI I/O](https://www.meris.us/product/midi-i-o/) interface.
- A MIDI interface in your computer. This can be a homestudio audio interface or, if your computer support Bluetooth, 
a MIDI Bluetooth adapter plugged into the Meris MIDI I/O interface. 


Setup
=====

1. Set the Mercury7's EXP/MIDI connector for MIDI communication.
2. Set the Mercury7's MIDI mode to MIDI OUT. 
3. Set the Mercury7's MIDI PORT.
4. Connect the Mercury7 with the MIDI I/O interface. Use a stereo (TRS) jack cable.
5. Connect the MIDI I/O interface to your computer.
6. Open https://sysex.io/mercury7/editor 
7. Allow the browser to access your MIDI devices.
8. In the top-right of the editor, select the MIDI input and output devices corresponding to the MIDI I/O and the MIDI port corresponding to your Mercury7 MIDI port setting.
9. Move a knob on your Mercury7, the corresponding control in the editor must react accordingly.
10. Play some sound through the Mercury7 and move a knob in the editor. The sound should change as if you have moved the same control on the Mercury7. 
11. Enjoy your Mercury7!

MIDI on the Mercury7
----------------

If you can't get the MIDI communication working, check the following on the Mercury7:

- The Global Settings EXP MODE is set to MIDI
- The Global Settings MIDI is set to MIDI OUT
- Choose a Global Settings MIDI CHANNEL.  
- The cable between the Mercury7 and the MIDI I/O interface is TRS (stereo).
- The MIDI I/O interface is powered on.
- The Mercury7 is powered on.
- The TSR cable is connected between one of the 4 MIDI I/O jack and the Mercury7's EXP/MIDI connecter.
- The MIDI I/O interface is connected to your PC.
- The MIDI editor uses the same channel as the Mercury7's MIDI channel defined in the Global Settings.

Check the [Meris Mercury7 User Manual](https://www.meris.us/wp-content/uploads/2017/03/Meris-Mercury7-Manual-v2.pdf) and 
the [Meris MIDI I/O User Manual](https://www.meris.us/wp-content/uploads/2018/03/Meris_MIDI_IO_Full_Manual_v1b.pdf) 
for more informations and instructions about how to set the Mercury7's Global Settings.

MIDI in the browser
-------------------

You use a browser that supports the [Web MIDI](https://www.midi.org/17-the-mma/99-web-midi) API specifications. 

Currently, only the following browsers [support](https://caniuse.com/#feat=midi) the Web MIDI API:

- Chrome (Mac, Linux, Windows) 
- Opera (Mac, Linux, Windows)

Web MIDI is not support under iOS (iPad, iPhone). It may work under Android but I did not test it.

Scroll down to [MIDI in the browser](#MIDI-in-the-browser) to get more information about how to check and setup MIDI in your browser.
 

Using the Editor
================

Setting up
----------

Once you have your Mercury7 connected to the MIDI I/O interface, you must configure the editor:

1. Select the input device 
2. Select the output device
3. Select the MIDI channel
    * You can leave the channel set to "all" but this is not recommended as this will send every messages to all channels 
    every time and this can perturb other MIDI devices which are connected to your computer. 
    
The editor's preferences (settings) are saved in your browser's _Local Storage_.      
    
Synchronizing Mercury7 and the editor
---------------------------------

**IMPORTANT:** please keep in mind that the editor only has the possibility to read the saved preset from Mercury7. It can not read the _current_ values ​​of the controls. 
These values may be different from the one saved in memory (saved as a preset).

Also, do not forget that each time you access a "Alt/2nd layer" value, the preset is saved (see Mercury7 User Manual Section 7, page 9). 

It is therefore recommended to always select a preset from the editor as first action after having opened it. After that, 
unless the MIDI connection is interrupted, the Mercury7 and the editor should always remain in sync.
    
Saving presets
--------------
    
1. Select a preset,
2. Twist the knobs, have fun, make a great sound,
3. Save the preset

From the [Meris online FAQ](https://www.meris.us/support/): 
> To save a preset, press one of the footswitches on the preset switch, modify your sound, then hold ALT to save."
    
You can not save to preset number different than the current number. 

To save the preset, use the WRITE menu option in the editor or press and hold the ALT button on the Mercury7. If you save on the Mercury7,
select the preset in the editor to make sure it remains in sync with the Mercury7.    
        
Loading presets
---------------

Presets can be stored in files (binary .syx files) and, with this editor, presets can also be stored as URLs. 

When you load a preset, it is sent to the Mercury7 and replace the current _live_ values. It does not replace the preset _stored in memory_. If you want to keep the preset you loaded
in the Mercury7, then you need to store it, either by using the menu SAVE command of this editor or by pressing and holding the ALT button on the Mercury7.  
        
Synchronizing with Sysex
------------------------

The editor can receive SysEx from the Mercury7. You can use this possibility to update the editor with the current preset of the Mercury7.
You have two possibilities to synchronize the editor with the Mercury7:

1. From the Mercury7, send the preset as Sysex Data (see _Mercury7 User Manual_ page 9). 
To do that, press the Bypass LED switch while holding the ALT button. The editor will tell you when it has received a 
preset as SysEx.

![SysEx received](/images/screenshots/sysex-received.jpg "SysEx received")

Note: while you hold the ALT switch, the Mercury7 will save the preset before sending it. 
 
Out of sync
-----------

The editor can become out-of-sync with the Mercury7 in that situation:

1. The editor is not yet connected to Mercury7.
2. On the Mercury7 a preset has been loaded.
3. On the Mercury7, some values have been modified.
4. The editor is started.
    a. The editor will read the current preset (from the Mercury7 _memory_)
    b. Mercury7 will send the value saved in memory for the current preset. It will not send the _current_ values of the knobs and buttons. 
    
To avoid this problem:

- Option 1: select a preset in the editor. This will select the preset in the Mercury7. Unsaved settings will be lost. 
- Option 2: save the current preset (with the WRITE command in the editor or the ALT switch in Mercury7) then select this preset from
the editor. No settings will be lost and the editor will be in sync.   

Menu commands
-------------

| icon | command | direction  | description  |
|---|---|---|---|
|   | Init | editor --> Mercury7 | Set convenient "default" values (send as CC messages, not SysEx preset). |
|   | Randomize  | editor --> Mercury7 | Set random values for all controls (send as CC messages, not SysEx preset). |
|   | Send  | editor --> Mercury7 | Send the current editor's values to Mercury7 (send as CC messages, not SysEx preset). |
|   | Save  | editor --> Mercury7 | Tell the Mercury7 to save in memory the current settings (updates the current preset). |
|   | URL  | editor only | Update the editor's URL with the current values. This makes a "_bookmarkable preset_". |
|   | Print  | editor only | Open a popup window with the currents settings displayed for printing (or saving as PDF). |
|   | Load  | editor --> Mercury7 | Load a preset from a sysex file and send the values to the Mercury7 (send as CC messages, not SysEx preset). |
|   | Download  | editor only | Download the current editor's values as a sysex file. |
|   | Midi  | editor <--> Mercury7 | Open a popup displaying all the MIDI messages exchanged between the editor and the Mercury7. |
|   | Global  | editor <--> Mercury7 | Display and edit the Global Settings of the Mercury7. |
|   | Prefs  | editor only | Display and edit the editor's preferences. |
|   | Help  | editor only | Display a summary of the editor usage. |
|   | About  | editor only | Display version and credits about the editor. |


MIDI in the browser
===================

If you can't get the MIDI communication working, check the following on the browser:

- You use a browser that supports the [Web MIDI](https://www.midi.org/17-the-mma/99-web-midi) API specifications. 
Currently, only the following browsers [support](https://caniuse.com/#feat=midi) the Web MIDI API:

    - Chrome (Mac, Linux, Windows) 
    - Opera (Mac, Linux, Windows)

    Web MIDI is not support under iOS (iPad, iPhone). It may work under Android but I did not test it.

- The Web MIDI is not blocked by the browser. See below for information about this feature in Chrome.

### Web MIDI in Chrome

The first time you access a web page that uses the WebMIDI API, the browser will ask you for permission.

![Chrome asks for MIDI permission](/images/screenshots/chrome-midi-ask.jpg "Chrome asks for MIDI permission")

You need to click "Allow" to authorize the application to use the Web MIDI API.

If you refuse access, the application will display the following message:

![MIDI access refused](/images/screenshots/message-midi-blocked.jpg "MIDI access refused")

    Waiting for MIDI interface access...
    ERROR: WebMidi could not be enabled.
           
You can change the permission at any time:

![Chrome change MIDI permission](/images/screenshots/chrome-midi-allow.jpg "Chrome change MIDI permission")

#### MIDI icon in the URL

Chrome display an icon in the URL to remind you that you are on a page that have access to MIDI. You can click this icon to access the MIDI permission settings.

![Chrome MIDI icon in URL](/images/screenshots/chrome-midi-url-icon.jpg "Chrome MIDI icon in URL")

![Chrome MIDI icon in URL](/images/screenshots/chrome-midi-url-icon-dialog.jpg "Chrome MIDI icon in URL")

    
#### MIDI configuration in the browser settings:    
    
You can also access the MIDI permissions via the browser Settings page. 

In Chrome, follow this path: Menu Settings / Advanced / Content settings / MIDI devices    

You can also open the Settings page and search for "MIDI".
 

Bluetooth MIDI
==============

A small Bluetooth MIDI adapter such as the [Quicco Sound mi.1](https://www.thomann.de/intl/quicco_sound_mi.1_wireless_midi_adapter.htm) 
or [Yamaha MD-BT01](https://www.thomann.de/intl/yamaha_md_bt01_wireless_midi_adapter.htm) is a very convenient way to connect the 
MIDI I/O interface to your computer. 

![Quicco Sound mi.1](/images/quicco_sound_mi1-33.jpg "Quicco Sound mi.1")

![Yamaha MD-BT01](/images/yamaha_md_bt01-33.jpg "Yamaha MD-BT01")

If you have a Mac, use the Audio MIDI Setup application. 

![Mac Audio Setup Application](/images/screenshots/mac-audio-setup.jpg "Mac Audio Setup Application")


--TODO: photo MIDI I/O with adapter--

 
MIDI tools
==========

If you use a Mac, check out the tools available at https://www.snoize.com/. 


Limitations of this editor
===============================

This editor will _not_ work in Firefox, Safari, IE or Edge because these browsers do not support the Web MIDI API. 

The editor will not work under iOS (iPad, iPhone). 

This editor has mainly been tested with Chrome on a MacBook pro running the latest OS release. Some tests have been 
done with success with Chrome under Linux Mint 17.1 and with Chrome under Windows 10. 

Still under active development. Feel free to log bugs/issues.  


Known issues
============

There's still some issues with the preset loading from a bookmarked URL.


Contribute
==========

This editor is an Open Source project. You are welcome to contribute.

The code is available at https://github.com/francoisgeorgy/mercury7-web-editor.

To contribute your bug fixes, new features, etc.:
 
1. Fork the project.
2. Create a pull-request.


Trademarks
==========

This editor is not endorsed by, directly affiliated with, maintained, or sponsored by Meris.             


License and disclaimer
======================

This editor is published under [GNU General Public License v3](https://www.gnu.org/licenses/gpl-3.0.en.html).

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of 
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You can view and get a copy the license at https://www.gnu.org/licenses/licenses.en.html#GPL.
