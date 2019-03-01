Mercury7 web editor
===============

Control your Meris Mercury7 pedal with your web browser. View all the pedal's settings at once.

![Mercury7 Editor screenshot](/images/screenshots/mercury7-editor-436x322.jpg "Mercury7 Editor screenshot")


Requirements
============

- A browser that support the [Web MIDI API](http://webaudio.github.io/web-midi-api/). Currently, 
only **Chrome** and **Opera** support this standard. 
- A [Meris MIDI I/O](https://www.meris.us/product/midi-i-o/) interface.
- A MIDI interface in your computer. This can be a homestudio audio interface or, if your computer support Bluetooth, 
you can use a MIDI Bluetooth adapter plugged into the Meris MIDI I/O interface. 


Usage
=====

1. Set the Mercury7's EXP/MIDI connector for MIDI communication.
2. Set the Mercury7's MIDI mode to MIDI OUT. 
3. Set the Mercury7's MIDI PORT.
4. Connect the Mercury7 with the MIDI I/O interface. Use a stereo (TRS) jack cable.
5. Connect the MIDI I/O interface to your computer.
6. Open https://sysex.io/mercury7/editor 
7. Allow the browser to access your MIDI devices.
8. In the top-right of the application, select the MIDI input and output devices corresponding to the MIDI I/O and the MIDI port corresponding to your Mercury7 MIDI port setting.
9. Move a knob on your Mercury7, the corresponding on-screen control must move accordingly. This tests the MIDI IN communication.
10. Play some sound through the Mercury7 and move a knob on the Editor. The sound should change as if you have moved the same control on the Mercury7. This tests the MIDI OUT communication.
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
- The MIDI application uses the same channel as the Mercury7's MIDI channel defined in the Global Settings.

Check the [Meris Mercury7 User Manual](https://www.meris.us/wp-content/uploads/2018/06/Meris_Mercury7_Manual_v1c.pdf) and 
the [Meris MIDI I/O User Manual](https://www.meris.us/wp-content/uploads/2018/03/Meris_MIDI_IO_Full_Manual_v1b.pdf) 
for instructions about how to set the Mercury7's Global Settings.


MIDI in the browser
-------------------

If you can't get the MIDI communication working, check the following on the browser:

- You use a browser that supports the [Web MIDI](https://www.midi.org/17-the-mma/99-web-midi) API specifications. 
Currently, only the following browsers [support](https://caniuse.com/#feat=midi) the Web MIDI API:

    - Chrome (Mac, Linux, Windows) 
    - Opera (Mac, Linux, Windows)

    Web MIDI is not support under iOS (iPad, iPhone). It may work under Android but I did not test it.

- The Web MIDI is not blocked by the browser. See below for information about this feature in Chrome.

### Web MIDI in Chrome

The first time you access an application that uses the WebMIDI API, the browser will ask you for permission.

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
 

Using the Editor
================

Setting up:
-----------

Once you have your Mercury7 connected to the MIDI I/O interface, you must configure the application:

1. Select the input device 
2. Select the output device
3. Select the MIDI channel
    You can leave the channel set to "all" but this is not recommended as this will send all messages to all channels every time and 
    this can perturb other MIDI devices you may have connected to your computer. 
    
The applications preferences (settings) are saved in your browser's _Local Storage_.      
    
Synchronizing to Mercury7 with Sysex:
---------------------------------

**IMPORTANT:** please keep in mind that the application has no possibility to _read_ the Mercury7 settings. When the application starts, 
the values displayed by the application will not reflect the current preset of the Mercury7. 

The application will tell remind you to send a Sysex from the Mercury7:

![Send SysEx reminder](/images/screenshots/message-send-sysex.jpg "Send SysEx reminder")


You have two possibilities to synchronize the application with the Mercury7:

1. From the Mercury7, send the preset as Sysex Data (see _Mercury7 User Manual_ page 9). 
To do that, press the Bypass LED switch while holding the ALT button. The application will tell you when it has received a 
preset as SysEx.

![SysEx received](/images/screenshots/sysex-received.jpg "SysEx received")

2. From the application, use the INIT or RANDOMIZE menu options to set all the values at once. 

From now on, until you select a new preset, the application will show the current settings of the Mercury7.

### Changing preset

After you select a new preset, you need to re-sync the application. In that case, in order to keep the preset settings, you can
only send the preset as SysEx from the Mercury7. After that, the application will show you the preset settings.


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


Limitations of this application
===============================

This application will _not_ work in Firefox, Safari, IE or Edge because these browsers do not support the Web MIDI API. 

The application will not work under iOS (iPad, iPhone). 

This application has mainly be tested with Chrome on a MacBook pro running the latest OS release. Some tests have been 
done with success with Chrome under Linux Mint 17.1 and with Chrome under Windows 10. 

Still under active development. Feel free to log bugs/issues. This is a development I'm doing during my freetime. 


Known issues
============

The TEMPO value is not saved. If a preset uses a tempo value different from 0, then you have to set the tempo 
manually after loading the preset.

There's still some issues with the preset loading from a bookmarked URL.

It is not possible to capture the press & hold of the TAP footswitch because the Mercury7 only sends a message for when 
the footswitch is pressed, but not for when it is released.


Contribute
==========

This editor is an Open Source project. You are welcome to contribute.

To contribute your bug fixes, new features, etc.: 1) fork the project, 2) create a pull-request.


Trademarks
==========

This application is not endorsed by, directly affiliated with, maintained, or sponsored by Meris.             


License and disclaimer
======================

This application is published under [GNU General Public License v3](https://www.gnu.org/licenses/gpl-3.0.en.html).

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of 
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You can view and get a copy the license at https://www.gnu.org/licenses/licenses.en.html#GPL.
