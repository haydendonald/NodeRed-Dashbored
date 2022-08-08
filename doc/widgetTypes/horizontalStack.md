# Horizontal Stack
![](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/img/widgets/horStack.png)

Stacks many other widgets horizontally

## Properties
* `Widgets`: The selection of widgets to display in their order. For a generated widget many widgets can be added using a `,` for example `widgets=id1,id2`

## Messages
### Input
Sending a payload will set the state
```
{
    "topic": "set",
    "id": <widget id>,
    "payload": {
        ... Extra information specific to the internal widget type.
    }
}
```

### Output
This sends a payload containing the state for internal widgets with id
```
{
    "topic": "set",
    "id": <widget id>,
    "payload": {
        ... Extra information specific to the internal widget type.
    }
}
```
See [widget types](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes.md) for more information on what the widget types send.

## Dynamic Options
This widget supports extra dynamic options:
* `widgetsHTML`: Is an array of HTML elements to add to the stack.
`widgetsHTML: ["<h1>Hello!</h1>", "<widget id='widget' type='toggleButton' %ask% %ask-text%>]` See [widgets](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widget.md#input) for more. To copy parameters like ask `%ask%` can be used.

## CSS
* `#widget`: Apply styling to the widget container
* `#title`: Apply styling to the title
* `#content`: Apply styling to the content under the title