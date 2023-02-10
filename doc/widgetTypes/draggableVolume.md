# Draggable Volume
![](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/img/widgets/draggableVolume.png)

Provides a volume widget that can be interacted with by dragging the volume bar instead of clicking the +/- buttons in the [Volume Widget](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes/volume.md).

## Properties
* `Muted Value (mutedValue)`: The muted state
* `Unmuted Value (unmutedValue)`: The un-muted state
* `Increment (increment)`: The value to increment the slider by

## Messages
### Input
Sending a payload will set the volume
```
{
    "topic": "set",
    "payload": {
        "volume": <0-100%>,
        "muted": <mutedValue / unmutedValue>
    }
}
```

### Output
This sends a payload containing the state
```
{
    "topic": "set",
    "payload": {
        "volume": <0-100%>,
        "muted": <mutedValue / unmutedValue>
        "previousVolume": <0-100%>
        "previousMuted": <mutedValue / unmutedValue>
    }
}
```

## CSS
* `#widget`: Apply styling to the widget container
* `#title`: Apply styling to the title
* `#content`: Apply styling to the content under the title
* `#volumeLevelContainer`: The styling for the container
* `#volumeLevelTop`: The styling for the volume "bar"
* `#buttonContainer`: The styling for the container containing the buttons
* `.button`: The style for the buttons
* `.mutedColor`: The color when the channel is muted
* `.clickColor`: The color when a button is pressed