# Button Selector
![](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/img/widgets/buttonSelector.png)

This allows for a selection of a value using a simple button layout

## Properties
* `Options`: Add the buttons that can be pressed by the user

## Messages

### Input
Sending a payload will set the value
```
{
    "topic": "set",
    "payload": {
        "value": <value>
    }
}
```

### Output
This sends a payload containing the value selected
```
{
    "topic": "set",
    "payload": {
        "value": <value>
        "previousValue": <value>
    }
}
```

## CSS
* `.on`: Styling to add when a button is "on"
* `.off`: Styling to add when a button is "off
* `#widget`: Apply styling to the widget container
* `#title`: Apply styling to the title
* `#content`: Apply styling to the content under the title