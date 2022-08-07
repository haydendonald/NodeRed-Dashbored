# Vertical Stack
![](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/img/widgets/vertStack.png)

Stacks many other widgets vertically

## Properties
* `Widgets`: The selection of widgets to display in their order. For a generated widget many widgets can be added using a `,` for example `widgets=id1,id2`

## Messages
None.

## Dynamic Options
This widget supports extra dynamic options:
* `widgetsHTML`: Is an array of HTML elements to add to the stack.
`widgetsHTML: ["<h1>Hello!</h1>", "<widget id='widget' type='toggleButton' %ask% %ask-text%>]` See [widgets](../widget.md#input) for more. To copy parameters like ask `%ask%` can be used.

## CSS
* `#widget`: Apply styling to the widget container
* `#title`: Apply styling to the title
* `#content`: Apply styling to the content under the title