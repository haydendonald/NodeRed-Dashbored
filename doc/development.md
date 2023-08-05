# Creating a Widget
The following guide will explain how to build a widget for the NodeRed Dashbored project.

# General Knowledge
* Each widget is contained within a node module in the `widgets` folder.
* To include a widget in the project it needs to be added to the `widgets/widgets.js` file with the correct structure specified below.

## Basic Instructions
1. To start it is best to duplicate an existing widget. The toggle button is a good starting point and can be found [here](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/widgets/toggleButton.js)
2. Set the parameters for your widget (* = required):
* `widgetType*` The unique widget type identifier
* `version*` The version of the widget
* `label*` The name of the widget visible to the user from the nodered editor
* `description*` The description of what the widget will do
* `widthMultiplier*` If your widget needs to be larger than the normal widget size it can be multiplied using this value (Default is 1).
* `heightMultiplier*` If your widget needs to be larger than the normal widget size it can be multiplied using this value (Default is 1).
* `minWidth` If your widget needs a minimum width it can be set here.
* `minHeight` If your widget needs a minimum height it can be set here.
* `maxWidth` If your widget needs a maximum width it can be set here.
* `maxHeight` If your widget needs a maximum height it can be set here.
* `resetConfig` If set to true will force reset the configuration on deploy. This is useful for development purposes.

3. Define the node red editor scripts. These will define how your widget's configuration is generated in the nodered editor. (* = required)
* `generateConfigHTML*` is expected to return a HTML string with the elements to be shown in the editor see [Node Properties](https://nodered.org/docs/creating-nodes/properties) for more information.
* `generateConfigScript*` is expected to return an object containing the scripts that will be run by the nodered editor. See [Node Properties](https://nodered.org/docs/creating-nodes/properties) for more information. The following are required `oneditprepare`, `oneditsave`, `oneditcancel`, `update`.
* `defaultConfig` is an object containing the default values for the widget see [Node Properties](https://nodered.org/docs/creating-nodes/properties) for more information.

_Note: The ids must include the widget name in the format node-config-input-<WIDGETNAME>-<CONFIGNAME> otherwise the values may not be set correctly. For example:_
```
<div class="form-row">
  <label for="config-input-toggleButton-text">Text</label>
  <input type="text" id="node-config-input-toggleButton-text" placeholder="Text">
</div>
```

4. Setup the main functions for the dashbored project. (* = required)
* `getDefaultValues*: function(): returns object`: Returns the default values as a JSON object
* `getValues*: function(): returns object`: Returns the current values as a JSON object
* `setupWidget*: function(config)`: Is called to setup the widget passing the config options
* `onClose*: function()`: Is called when nodered redeploys or closes. Any cleanup can be done here.
* `onMessage*: function(msg)`: Is called when a message comes from the dashbored.
* `onFlowMessage*: function(msg)`: Is called when a message comes from the node red flow.

5. Setup the generation for the dashbored UI (* = required)
* `generateCSS*: function(): returns string`: Expects the CSS for the widget to be returned as a string (will replace any class names with a unique identifier.
* `generateHTML*: function(htmlId): returns string`: Expects the HTML for the widget to be returned as a string
* `generateOnload*: function(htmlId, lockedAccess, alwaysPassword, ask, askText): returns string`: Expects a script to be returned that will be executed when the dashbored loads in. Events should be set here.
* `generateOnMsg*: function(htmlId): returns string`: Expects a script to be returned that will be executed when a message comes in to the dashbored from nodered. You can update UI elements here for example.
* `generateScript*: function(): string`: Expects a script to be returned here. This will be placed directly on the webpage for any advanced scripts required.
* `onPageFocus: function(): string`: Expects a script to be returned here. Is called when the page this widget is on is focused

_There are utility functions which makes the generation with unique identifiers easier see utility methods below_

## Useful Methods
#### `sendToFlow: function(msg, messageType, get, sessionId, nodeId)`
Can be called to send a message to the NodeRed flow
#### `sendToDashbored: function(id, sessionId, payload)`
Can be called to send a message to the dashbored
* `id`
The node id to send the message to (can use node.id)
* `payload`
The message object to send
#### `setValues: function(values)`
Sets many values
#### `setValue: function(name, value)`
Set a value
#### `getValue: function(name): returns value`
Get a value
#### `getFlowValue: function(names)`
Requests flow values.
#### `sendStatusToFlow: function(type, sessionId, nodeId)`
Send the current status(s) to the flow
#### `sendStatusChangesToFlow: function(sessionId, changes, nodeId)`
Sends a status update to the flow


# Utility Functions
The following are utility functions available for use.

# In the dashbored (web)
#### `addOnLoadFunction: function(fn)`
Add a function to call when the page loads
* `fn: ()`
The function to execute
#### `addOnMsgFunction: function(fn)`
Add a function to call when a message is received from NodeRed
* `fn: (msg)`
The function to execute
### `print: function(type, message)`
Print to the console
#### `formatAMPM: function(date): returns string`
Format a date object to 12:00 pm
#### `hideShowElement: function(id, show, sec=0.2)`
Hide or show an element
* `id`
The id of the element to hide or show
* `show`
Should it be shown? true = yes
* `sec`
How long should it take to fade in/out
#### `message: function(type, title, description, closeAfterSec=3)`
Show a message at the top of the dashbored
* `type`
The type of message (`info, error, warning, success`)
* `title`
The title of the message
* `description`
The description of the message
* `closeAfterSec`
How long should the message be open. (`true closes the message, false will not close the message`)


# In the node
#### `util.generateTag: function(id, tagName, name, innerHTML, attributes): returns string`
Generate the HTML required for a DOM element
* `id`
The randomly generated HTML id
* `tagName`
The tag (eg "h1")
* `name`
The name of the element (eg "button")
* `innerHTML`
The inner HTML for the element
* `attributes`
Any extra attributes to add (eg class, style)
#### `util.generateCSS: function(id, selector, name, css): returns string`
Generate the CSS required to style a DOM element
* `id`
The randomly generated HTML id
* `selector`
What type of CSS selector (eg ".", "#")
* `name`
The element name
* `css`
The actual css value (eg "background-color: red")
#### `generateCSSClass: function(id, name): returns string`
Generate a CSS class name
* `id`
The random HTML id
* `name`
The CSS class to select
#### `getElement: function(htmlId, elementName): returns htmlElement`
Get a HTML element
* `htmlId`
The randomly generated HTML id
* `elementName`
The element to select
#### `generateWidgetActions: function(lockedAccess, alwaysPassword, ask, askText, actionYes, actionNo): returns string`
Generate the script for widget actions with locked, ask, etc actions.
* `lockedAccess`: The locked access setting
* `alwaysPassword`: The alwaysPassword setting
* `ask`: The ask setting
* `askText`: The askText setting
* `actionYes`: The actionYes callback
* `actionNo`: The actionNo callback
#### `randString: function() return string`
Generate a random string
#### `formatAMPM: function(date): returns string`
Format a date object to 12:00 pm