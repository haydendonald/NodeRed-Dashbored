# HVAC
![](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/img/widgets/HVAC.png)

Allows a HVAC or AC unit to be controlled.

## Properties
* `Enable Auto Mode`: If the auto mode is available.
* `Enable Heat Mode`: If the heat mode is available.
* `Enable Cool Mode`: If the cool mode is available.

## Example
![](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/img/examples/HVAC.png)
Download example [JSON](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/examples/HVAC.json)
### Input
Sending a payload will set the HVAC
```
return {
    "topic": "set",
    "payload": {
        "setMode": "heat",
        "currentMode": "cool",
        "setTemperature": 19,
        "currentTemperature": 10
    }
}
```

### Output
This sends a payload containing the status
```
payload: {
    setMode: "heat"
    currentMode: "off"
    setTemperature: 21
    currentTemperature: 21
    previousSetTemperature: 21
    previousSetMode: "cool"
    previousMode: "off"
}
```

## CSS
* `#widget`: Apply styling to the widget container
* `#title`: Apply styling to the title
* `#content`: Apply styling to the content under the title

* `.button`: The styling for the buttons
* `.div`: The divs containing each part
* `.tempDiv`: The div containing the temperature information
* `.innerTempDiv`: The div containing the temperature information
* `.button h1`: The current temperature text
* `.button h2`: The set temperature text
* `.autoColor`: The color for the auto mode
* `.heatColor`: The color for the heat mode
* `.coolColor`: The color for the cool mode
* `.offColor`: The color for the off mode