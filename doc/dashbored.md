# The Dashbored
Is a "website" served which contains pages, and widgets.

### Options
* `Page`: Allows for easy creation of a page. Type in the name and icon [Font Awesome v4](https://fontawesome.com/v4/icons/) and it will be copied to the clipboard to add to the HTML field
* `Widget`: Allows for easy generation of widgets. Select the widgets you wish to add and it will be copied to the clipboard to add to the HTML field
* `HTML`: The HTML of the dashbored. Use the above page and widget helpers to generate the page
* `CSS`: The CSS of the dashbored. Some tags are added by default, however you can override CSS by looking at each element using your browser's inspector
* `Server`: The server to add this dashbored to
* `Path`: Where the dashbored will end up. `http://localhost:1880/<path>` Default is `http://localhost:1880/dashbored`
* `Password`: The password for the dashbored. Must be numbers ONLY. Leave empty to disable
* `Header Image`: The image "logo" to display in the header
* `Header Title`: The text to display in the header
* `Show Clock`: Should the clock be shown in the header
* `Show Weather`: Should the weather information be shown in the header
* `Show Lock Button`: Always show the unlock/lock button
* `Show header`: Should the header be visible
* `Show navigation`: Should the navigation bar be visibile
* `Navigation Bar Position`: Where should the navigation bar be generated.
* `Widget Width`: The base widget width. The widget size will multiply this value
* `Widget Height`: The base widget height. The widget size will multiply this value
* `Header Size`: The size of the header
* `Navigation Size`: The size of the navigation bar

### Widget
Is an element that can be added to a dashbored or dashboreds which automatically generates itself on the dashbored.
See [supported widgets](https://github.com/haydendonald/NodeRed-Dashbored/blob/main/doc/widgetTypes.md) for available types.

* The following can be used to add a widget created in NodeRed to the dashbored: `<widget id=""></widget>`
* The following can be used to generate a temporary widget into the dashbored: `<widget id="" type="" title="">`

where (* = required):

* `id*`: the id of the widget node in NodeRed (For a generated widget this must be unique)
* `locked-access`: Should this be accessible if the dashbored is locked (`"yes", "no", "password"`)
* `always-password`: This will always ask for password regardless of the lock status (`"yes", "no"`)
* `ask`: When clicked should it ask before proceeding (`"yes", "no"`)
* `ask-text`: The text displayed in the ask popup
* `widthMultiplier`: The width multiplier of the widget
* `heightMultiplier`: The height multiplier of the widget
* `title`: The title for the widget
* `name`: The name of the widget
* `type`: The type of widget to generate (only used for generation of a temporary widget)
* `restoreState`: The name of the widget (only used by generation of a temporary widget)
* `setsState`: The name of the widget (only used by generation of a temporary widget)

For the generated widget extra parameters can be added to set the widget settings, for example a toggle button's text can be set using:
`<widget id="" type="toggleButton" text="TEXT"></widget>`

### Page
Is a page within a dashbored with a button on the navigation bar which contains widgets and other elements.

`<page name="" icon=""></page>`
* `name`: The name of the page, this is displayed in the navigation menu
* `icon`: The icon of the page, this is also displayed in the navigation menu (Icons are from [Font Awesome v4](https://fontawesome.com/v4/icons/))
* `navigation-visibility`: Should this be visible in the navigation menu (`"yes", "no"`)
* `locked-access`: Should this be accessible if the dashbored is locked (`"yes", "no", "password"`)
* `always-password`: This will always ask for password regardless of the lock status (`"yes", "no"`)

# The Dashbored Node
This node allows access to the dashbored in the flow

### Options
* `Dashbored`: The dashbored

### Input
The dashbored will respond to the following inputs
```
{
    payload: {
        id: id, //The id of the dashbored to effect (If not set will effect all)
        action: action //The action to perform
    }
}
```
Actions are as follows:
* `lock`: Lock the dashbored
* `unlock`: Unlock the dashbored
* `reload`: Force reload the dashbored


### Output
The dashbored will output the following message
```
{
    topic: "event", //The event
    payload: {
        id: id, //The id of the dashbored
        sessionId: id //The session id
    }
}
```
Events are as follows:
* `unlock`: A dashbored was unlocked
* `lock`: A dashbored was locked
* `session`: A new session was created
* `other`: The raw message from a widget or something else, can be useful for accessing custom widgets etc

# CSS Classes
Below are some CSS classes can be used to change aspects of the dashbored look
* `.background`: The background color
* `.bgRed`: The red background color
* `.bgGreen`: The green background color
* `.bgBlue`: The blue background color
* `.bgYellow`: The yellow background color
* `button`: The default button style
* `#header`: The header
* `#nav`: The navigation bar
* `#message`: The message popup
* `#ask`: The are you sure dialog
* `#loader`: The loading animation


