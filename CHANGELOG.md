# Pre Release
## - 0.1.0
* First publish
## - 0.2.0
* Fixed a bug with the loading of settings causing the module to not function at all
* Fixed a bug where this module would override all other web servers like UIBuilder, Dashboard etc
* Updated FontAwesome to version 6
## - 0.2.1
* Fixed a bug with httpEndpoint set
* Fixed a bug with nodeEndpoint set
* Fixed a bug where the clipboard cannot be copied to without HTTPs (It is not allowed without HTTPs)
## - 0.2.2
* Fixed a few issues with the volume widget
* Fixed a bug where the width and height multipliers were not being set
## - 0.2.4
* More changes to the volume widget
* Added the ability to copy settings from another widget
## - 0.2.5
* Added an increment value to the volume widget
## - 0.2.6
* Fixed a bug where the button selector would not set it's background colour correctly on first load in
## - 0.2.7
* Added the ability to override the title, widthMultiplier, and heightMultiplier of widgets using the dashbored HTML
* Fixed a crash with a generated widget with invalid type being generated
## - 0.2.8
* Fixed a bug where widgets setup would not be called correctly for generated widgets
## - 0.3.0
* Changed the are you sure dialog to look a bit better and have a count down for the no answer
* Added a previous value parameter to widgets when they send out a new value
## - 0.3.1
* Fixed a bug where the horizontal/vertical stack would not pass additional properties like ask and lock
* Fixed a bug where the dashbored would not detect a disconnection from the server if the server went down in a bad way (network failure etc)
* Changed the clock to get it's time from the server rather than the client
* Moved the weather and clock data into the status message sent every second (this also allows for server disconnection detection)
## - 0.4.0
* Added the ability to manipulate widget settings by setting them in the flow
* Added the ability to add custom HTML/widgets to the horizontal/vertical stack
* Fixed a bug where it was possible to add a hor/vert stack to itself causing a circular dependency loop crashing the dashbored
* Added the ability for hor/vert stacks to send out internal widget updates to the output
* The dashbored will now only display debug messages to console when the NodeRed debug flag is set
* Fixed a bug where the password would not visually clear when closed
## - 0.5.0
* Added HVAC widget
* Fixed a bug where if the dashbored were to reload while NodeRed is redeploying it would crash node-red.
## - 0.5.1
* Removed ask from the temperature adjustments for the HVAC widget
## - 0.5.2
* Added restoreState, setState, widthMultipliers to the widgets
## - 0.5.3
* Added the ability to debug the the page by sending console messages to the DOM
## - 1.0.0
* Release!
## - 1.1.0
* Added a draggable volume widget
* Fixed a bug where widgets with boolean config would be set to the default value if false. This was due to an error in the population of configuration to a widget
## - 1.1.1
* Bug fix: The draggable volume didn't support touch screens, this has been fixed :)
## - 1.1.2
* Bug fix: Made the draggable volume easier to reach 0% and 100%
## - 1.1.3
* Bug fix: Made the draggable volume easier to reach 0% and 100%, forgot the return
## - 1.1.4
* Bug fix: Fixed an issue with draggable volume not working on all pages