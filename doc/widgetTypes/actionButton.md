# Action Button
![](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/img/widgets/actionButton.png)

Is a simple button that when pressed can perform an action.

## Properties
* `Text`: The text of the button
* `Color`: The normal color of the button
* `Flash Color`: The color to "flash" when the button is clicked

## Messages
### Input
Sending a payload will "click" the button
```
{
    "topic": "set",
    "payload": {}
}
```

### Output
This sends a payload containing no values when clicked
```
{
    "topic": "set",
    "payload": {}
}
```

## CSS
* `.flashColor`: The CSS class applied when the button is to flash (overrides the flash color)
* `#button`: The CSS class for the button
* `#widget`: Apply styling to the widget container
* `#title`: Apply styling to the title
* `#content`: Apply styling to the content under the title