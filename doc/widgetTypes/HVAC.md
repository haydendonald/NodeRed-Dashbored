# Volume
![](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/img/widgets/HVAC.png)

Allows a HVAC or AC unit to be controlled.

## Properties
* `Modes`: The modes available to the unit.


* `Muted Value`: The muted state
* `Unmuted Value`: The unmuted state
* `Increment`: The value to add/minus when plus/minus is clicked

## Supported Modes
Must include "off"

## Messages
### Input
Sending a payload will set the volume
```
```

### Output
This sends a payload containing the state
```
```

## CSS
* `#widget`: Apply styling to the widget container
* `#title`: Apply styling to the title
* `#content`: Apply styling to the content under the title