# HVAC
![](https://raw.githubusercontent.com/haydendonald/NodeRed-Dashbored/main/img/widgets/HVAC.png)

Allows a HVAC or AC unit to be controlled.

## Properties
* `Enable Auto Mode`: If the auto mode is available.
* `Enable Heat Mode`: If the heat mode is available.
* `Enable Cool Mode`: If the cool mode is available.

## Messages
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

## Example
Import the following into NodeRed for an example
```[{"id":"9b20ef433244b649","type":"dashbored-widget-node","z":"377a5f0516f0271c","name":"HVAC","widget":"adbc1eef03d1b936","onlyOutputOnInput":false,"sendSetToOutput":false,"getOutputOthers":false,"x":610,"y":340,"wires":[["c733e7d8dcc1a116","632123d0d35a7189"],[]]},{"id":"c733e7d8dcc1a116","type":"debug","z":"377a5f0516f0271c","name":"debug 1","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","statusVal":"","statusType":"auto","x":760,"y":340,"wires":[]},{"id":"3ef640ba27c408b8","type":"function","z":"377a5f0516f0271c","name":"Set HVAC","func":"return {\n    \"topic\": \"set\",\n    \"payload\": {\n        \"setMode\": \"heat\",\n        \"currentMode\": \"cool\",\n        \"setTemperature\": 19,\n        \"currentTemperature\": 10\n    }\n}","outputs":1,"noerr":0,"initialize":"","finalize":"","libs":[],"x":460,"y":340,"wires":[["9b20ef433244b649"]]},{"id":"5521fa2003db28d8","type":"inject","z":"377a5f0516f0271c","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":300,"y":340,"wires":[["3ef640ba27c408b8"]]},{"id":"632123d0d35a7189","type":"function","z":"377a5f0516f0271c","name":"Feedback","func":"var currentMode;\nvar currentTemperature = 21;\nswitch(msg.payload.setMode) {\n    case \"auto\": {\n        if(currentTemperature == msg.payload.setTemperature) {\n            currentMode = \"off\";\n        }\n        else if (currentTemperature > msg.payload.setTemperature) {\n            currentMode = \"cool\";\n        }\n        else {\n            currentMode = \"heat\";\n        }\n        break;\n    }\n    case \"heat\": {\n        if (currentTemperature < msg.payload.setTemperature) {\n            currentMode = \"heat\";\n        }\n        else {\n            currentMode = \"off\";\n        }\n        break;\n    }\n    case \"cool\": {\n        if (currentTemperature > msg.payload.setTemperature) {\n            currentMode = \"cool\";\n        }\n        else {\n            currentMode = \"off\";\n        }\n        break;\n    }\n    case \"off\": {\n        currentMode = \"off\";\n        break;\n    }\n}\n\nreturn {\n    \"topic\": \"set\",\n    \"payload\": {\n        \"setMode\": msg.payload.setMode,\n        currentMode,\n        \"setTemperature\": msg.payload.setTemperature,\n        currentTemperature,\n    }\n}","outputs":1,"noerr":0,"initialize":"","finalize":"","libs":[],"x":620,"y":300,"wires":[["9b20ef433244b649"]]},{"id":"adbc1eef03d1b936","type":"dashbored-widget","name":"Widget","server":"5cc3ad61fa7b73f3","widgetType":"HVAC","widthMultiplier":"1","heightMultiplier":"1","title":"","restoreState":true,"setsState":true,"toggleButton-text":"Toggle Button","toggleButton-onValue":"on","toggleButton-offValue":"off","toggleButton-CSS":".on {\nbackground-color: #32CD32;\ncolor: white;\n}\n.off {\nbackground-color: #f2f2f2;\ncolor: black;\n}\n#button {\nwidth: calc(100% - 10px);\nheight: calc(100% - 10px);\nmargin: 5px;\n}\n#widget {}\n#title {}\n#content {}","buttonSelector-options":[{"label":"Option 0","value":"option_0","onColor":"#32CD32","offColor":"#ff3333"},{"label":"Option 1","value":"option_1","onColor":"#32CD32","offColor":"#ff3333"}],"buttonSelector-CSS":".button {\nwidth: calc(100% - 10px);\nmargin: 5px;\n}\n.on {}\n.off {}","horizontalStack-widgetsHTML":[],"verticalStack-widgetsHTML":[],"volume-mutedValue":"on","volume-unmutedValue":"off","volume-increment":1,"volume-CSS":"#volumeLevelContainer {\ntransform: rotate(180deg);\noverflow: hidden;\nbackground-color: white;\nwidth: 20%;\nheight: 90%;\nmargin-top: 5%;\nmargin-left: 10%;\nmargin-right: 5%;\nfloat: right;\nborder-radius: 10em;\n}\n#volumeLevelTop {\nbackground-color: #01e301;\nwidth: 100%;\nheight: 100%;\n}\n#buttonContainer {\nfloat: right;\nheight: 100%;\nwidth: 60%;\n}\n.button {\ndisplay: block;\nwidth: 100%;\nheight: calc((100%/3) - (2.5px * 3));\npadding: 0;\nmargin-top: 5px;\ntransition: background-color 0.1s;\n}\n.mutedColor {\nbackground-color: red !important;\n}\n.clickColor {\nbackground-color: white !important;\n}","actionButton-text":"Action Button","actionButton-color":"#434343","actionButton-flashColor":"#f2f2f2","actionButton-CSS":"#button {\nwidth: calc(100% - 10px);\nheight: calc(100% - 10px);\nmargin: 5px;\ntransition: background-color 0.1s ease;\n}","HVAC-auto":false,"HVAC-heat":true,"HVAC-cool":true,"HVAC-CSS":".button {\nwidth: calc(100% - 10px);\nmargin: 5px;\n}\n.div {\nheight: 100%;\nwidth: 50%;\nfloat: left;\n}\n.tempDiv {\ntext-align: center;\nwidth: calc(100% - 10px);\npadding: 5px;\n}\n.innerTempDiv {\nbackground-color: gray;\nborder-radius: 20px;\npadding: 20px;\n}\n.button h1 {\nfont-size: 150%;\n}\n.button h2 {\nfont-size: 100%;\nmargin-top: 10px;\n}\n.autoColor {\nbackground-color: rgb(50, 205, 50);\n}\n.heatColor {\nbackground-color: rgb(205, 50, 50);\n}\n.coolColor {\nbackground-color: rgb(50, 100, 205);\n}\n.offColor {\nbackground-color: gray;\n}"},{"id":"5cc3ad61fa7b73f3","type":"dashbored-server","name":"","weatherLat":"-37.8136","weatherLong":"144.9631","weatherUnit":"metric","apiKey":""}]```