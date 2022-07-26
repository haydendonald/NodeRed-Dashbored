# Volume
![](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/img/widgets/volume.png)

# In Development!

Allows for a volume channel to be controlled

## Properties
* `Muted Value`: The muted state
* `Unmuted Value`: The unmuted state
* `Increment`: The value to add/minus when plus/minus is clicked

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