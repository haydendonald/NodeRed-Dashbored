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

# Development
See the [Wiki](https://github.com/haydendonald/NodeRed-Dashbored/wiki)

# Limitations
* There is probably no or very little security. Data will probably be sent in plain text so don't expect any encryption.
* Currently in the early stages so there will be issues / missing features