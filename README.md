# Mercury7 web editor

Control your Meris Mercury7 pedal with your web browser. 


# Requirements

:warning: This application requires a browser that support the [Web MIDI API](http://webaudio.github.io/web-midi-api/).

Currently, only **Chrome** and **Opera** support this standard. This app will therefore _not_ work in Firefox, Safari, IE or Edge. 


# Usage

1. Open https://francoisgeorgy.github.io/mercury7-web-editor 
2. Allow the browser to access your MIDI devices.
3. If it's not already done, connect your Mercury7 to its MIDI adapter.
4. In the top-right corner of the application, select the MIDI devices and MIDI port.
5. When the pedal is connected the "Mercury7" text will glow.
6. Move a knob on your Mercury7, the corresponding on-screen control must move accordingly.


# Limitations

This application isn't able to edit the Global configuration of the Mercury7.

This application does not offer presets management either.

This application has mainly be tested with Chrome on a MacBook pro running OS X 10.14. Some tests have been done with success with Chrome under Linux Mint 17.1. 
The application has not been thoroughly tested under Windows. Any Windows feedback is very welcome.

Still under active development. Feel free to log bugs/issues. This is a development I'm doing during my freetime. 


# MIDI in your browser

You need to allow your browser to use your MIDI device:

![screenshot](/images/help-01.png "midi settings in Chrome")

In case you didn't allow the use of MIDI device and want to change that, you can right-click on the URL icon and change the setting:
        
![screenshot](/images/help-02.png "midi settings in Chrome")


# FAQ

_To be completed..._


# Contribute

This editor is an Open Source project. You are welcome to contribute.

To contribute your bug fixes, new features, etc.: 1) fork the project, 2) create a pull-request.


# Trademarks

This application is not endorsed by, directly affiliated with, maintained, or sponsored by Meris.             

This application is published under [GNU General Public License v3](https://www.gnu.org/licenses/gpl-3.0.en.html).


