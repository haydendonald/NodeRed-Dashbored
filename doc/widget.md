# Widgets
The widget is a "card" which appears on the dashbored.

### Options
* `Name`: The name of the widget
* `Server`: The dashbored server to add this widget to
* `Type`: What type of widget is this? See [supported widgets](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes.md) for more information
* `Size`: The size of the widget (This is a multiple of the dashbored widget sizing, some types may not allow resizing)
* `Title`: The text shown above the widget (Leave empty to disable)
* `Restore state on deploy`: Should the stored state be saved for deploys?
* `CSS`: The CSS for the widget. The following can be used to access styling for the widget container:
   * `#widget`: The outer container for the widget
   * `#title`: The title of the widget
   * `#content`: The widget content

The rest of the options are specific to the type.

It may be necessary to use `!important` on CSS attributes.


# Widget Node
The widget node accessible from the NodeRed flow.

### Options
* `Widget`: The widget this node is connected to
* `Only output when a input is received`: Only send a message to the output if a message was sent to the input first
* `When a set message is sent to the input output the set message`: Send set messages to the output if set from the input
* `When another node sends get to the input output the get request here`: Send get requests from other widget node inputs here

### Input
The input can take in the following message to get or set the value(s)
```
{
    //If we should set the value or get the current value
    topic: "set/get",
    outputOnOthers: true, //Set outputOnOthers to false to disable output when we set the value
    payload: {
        //Widget specific payload
    }
}
```
It is also possible to alter the widget settings with the following. These options are not saved across redeploy but they can be used to create dynamic elements. Sending an empty payload will not set any values, this can be used to read the current options.
```
{
    topic: "options",
    payload: {
        //Any options to alter here for example
        title: "Hello World!"
    }
}
```


### Output
There are two outputs. The top output is called `output` and the bottom output is called `get`. When the value changes it will be sent via the output and if the node is requesting it's value (for example when NodeRed restarts and the value is unknown) it will send a message to the `get` output requesting the value.
#### Output `output`
```
{
    //If this was set or a response to a get message
    topic: "set/get",
    payload: {
        //Widget specific payload
    }
}
```
#### Output `get`
```
{
    //If this was set or a response to a get message
    topic: "get",
    payload: {
        //Widget specific payload
    }
}
```


