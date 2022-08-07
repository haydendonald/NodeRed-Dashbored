# NodeRed Dashbored
A more customizable dashboard for NodeRed, not to be confused with the [NodeRed Dashboard](https://github.com/node-red/node-red-dashboard) project.

![Example 1](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/img/example1.png)

# Features
* Widgets!
* Configuration within the NodeRed flow(s)
* Custom CSS
* Compatibility with older browsers (We use Android tablets with outdated browsers and need to support them)
* Locked pages / actions behind a password
* A "Are you sure" dialog

# Installation
Simply search for `node-red-contrib-dashbored` in the pallet manager or install using `npm install node-red-contrib-dashbored`

# Learn More
## [Widgets](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widget.md)

## [Supported Widgets](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes.md)

## [The Dashbored Node](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/dashbored.md)

## [The Server Node](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/server.md)

## [Development](https://github.com/haydendonald/NodeRed-Dashbored/wiki)

# Examples
## Dynamic Widget Options
Sometimes it can be useful to modify widgets dynamically. In this example we will set the options of a few widgets dynamically.

[Example JSON](./examples/dynamicWidgetOptions.json)

## Custom Dynamic Widgets
Sometimes it can be useful to add widgets dynamically. In this example two custom toggle buttons will be added to a horizontal stack.

[Example JSON](./examples/customWidgets.json)

# Limitations
* There is probably no or very little security. Data will probably be sent in plain text so don't expect any encryption.
* If you are using HomeAssistant access the editor externally. The configuration will not load if you access NodeRed through home assistant itself.