# NodeRed Dashbored
A customizable dashboard for NodeRed, not to be confused with the [NodeRed Dashboard](https://github.com/node-red/node-red-dashboard) project.

![Example 1](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/img/example1.png)

# Features
* Widgets!
* Configuration within the NodeRed flow(s)
* Custom CSS
* Compatibility with older browsers (We use Android tablets with outdated browsers and need to support them)
* Locked pages / actions behind a password
* A "Are you sure" dialog

# How it works
The project serves dashboreds at your node-red ip `http://<your-nodered-ip>:1880/<dashbored-endpoint>`

The following example will create 2 dashboreds at `/example1` and `/example2` and will show how widgets can be used between the two dashbored instances.

[Example JSON](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/examples/defaultExample.json)


# Installation
Simply search for `node-red-contrib-dashbored` in the pallet manager or install using `npm install node-red-contrib-dashbored`

# Supported Widgets
## [Action Button](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes/actionButton.md)
Is a simple button that performs an action.

![Action Button](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/img/widgets/actionButton.png)

## [Toggle Button](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes/toggleButton.md)
Switches between two states. Useful for on/off applications.

![Toggle Button](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/img/widgets/toggleButton.png)

## [Button Selector](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes/buttonSelector.md)
This allows for a selection of a value using a simple button layout

![Button Selector](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/img/widgets/buttonSelector.png)

## [Horizontal Stack](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes/horizontalStack.md)
Stacks many other widgets horizontally

![Horizontal Stack](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/img/widgets/horStack.png)

## [Vertical Stack](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes/verticalStack.md)
Stacks many other widgets vertically

![Vertical Stack](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/img/widgets/vertStack.png)

## [Volume](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes/volume.md)
Control a volume channel

![Volume](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/img/widgets/volume.png)

## [HVAC](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes/HVAC.md)
Control a HVAC unit

![HVAC](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/img/widgets/HVAC.png)


# Learn More
## [Widgets](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widget.md)
Find information how the widgets work.

## [The Dashbored Node](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/dashbored.md)
Find information on how the dashbored node works, it's settings and other information.

## [The Server Node](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/server.md)
Find information on how the server it's self can be configured.

## [Development](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/development.md)
Find information on how to contribute to this project and how to create your own widgets.

# Examples
### Dynamic Widget Options
Sometimes it can be useful to modify widgets dynamically. In this example we will set the options of a few widgets dynamically.

[Example JSON](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/examples/dynamicWidgetOptions.json)

### Custom Dynamic Widgets
Sometimes it can be useful to add widgets dynamically. In this example two custom toggle buttons will be added to a horizontal stack.

[Example JSON](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/examples/customWidgets.json)

# Contributing
To contribute to the project fork the repo into your local directory and add it to node-red with the following commands
1. cd into the project directory
2. `npm install`
3. `npm link`
4. `cd ~/.node-red` or `cd %userprofile%/.node-red`
5. `npm link node-red-contrib-dashbored`

You can add widgets into the widgets directory, see [Development](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/development.md) for more information on creating widgets.


# Limitations
* There is probably no or very little security. Data will probably be sent in plain text so don't expect any encryption.
* If you are using HomeAssistant access the editor externally. The configuration will not load if you access NodeRed through home assistant itself, the editor may also ask for 2 passwords, the first one is your admin password and the second is your password for accessing the web if configured.
