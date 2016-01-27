# PebbleJSSubscriptionManager
Module for creating watched based interfaces for managing subscriptions to timeline topics managed by your app.

## How To Use:

### 0) Install

Save the files to your src/ directory, or install in the src/ directory using npm: `npm install pebble-subscription-manager`

### 1) Load the module with require:

If the files are in your src/ directory:
```javascript
var SubscriptionManager = require("subscription_manager");
```

If you installed via npm:
```javascript
var SubscriptionManager = require("node_modules/pebble-subscription-manager/subscription_manager");
```


### 2) Initialize module

The constructor takes the following arguments:

Parameter | Type | Default | Description
--------- | ---- | ------- | -----------
title | string | &lt;empty string&gt; | The title used on the main screen.
icon | string | &lt;empty string&gt; | An icon to be used on the main screen.
subtitle | string | &lt;empty string&gt; | The subtitle to be used on the main screen.
body | string | Press the middle button to configure subscriptions. | The body text to be used on the main screen.
unsubscribed_label | string | Unsubscribed | The label to be shown on the menu to indicate un-subscribed topics.
subscribed_label | string | Subscribed | The label to be shown on the menu to indicate subscribed topics.
reset_downclicks_required | integer | 3 | More on this below

The options can be passed in as parameters in the order above, or as a hash. Any null parameters or missing hash properties will be set to the default values.

```javascript
var sm = new SubscriptionManager("My App",null,"Subscription Manager");
```
```javascript
var sm = new SubscriptionManager({title: "My App", subtitle: "Subscription Manager"});
```
### 3) Add topics

A topic has the following properties:

Property | Type | Default | Description
-------- | ---- | ------- | -----------
id | string | &lt;empty string&gt; | The ID of the topic that will be used by your app to determine which pins to show.
title | string | &lt;empty string&gt; | The name of the title that will be shown in the selection menu.
icon | string | &lt;empty string&gt; | An icon that can be shown next to the title in the selection menu.
subscribed | boolean | false | Whether or not to the topic is subscribed to by the user. You probably want to leave this as false when adding a topic.
subtitle | string | &lt;unsubscribed_label&gt; | What to show as the subtitle on the selection menu. You probably want to leave this as-is.

You can add a single topic by calling the `addTopic` method. Parameters can be specified individually in the order above, or as a hash. Any null parameters or missing hash properties will be set to the default values.

```javascript
sm.addTopic("sports-topic","Sports")
```
```javascript
sm.addTopic({id: "sports-topic", title: "Sports"});
```

You can add multiple topics by passing in an array of topic hashes. This is equivalent to calling addTopic with each array item.

```javascript
var topics = [
  {id: "sports-topic", title: "Sports"},
  {id: "history-topic", title: "History"}
];
sm.addTopics(topics);
```

### 4) Start it
```javascript
sm.start()
```

This will kick off the initialization process, which pulls in a list of currently subscribed topics and sets them to `true`. This is why you probably don't want to specify the value of `subscribed` when adding a topic.

After that it will load the actual screens. The user presses the middle button on the first screen to be presented with a list of topics. Selecting a topic and then pressing the middle button will toggle the status of that subscription.

## Reset
This is mainly for debugging, but there is no reason you can't expose it to users. When on the main screen, if you press the down button a certain number of times (see `reset_downclicks_required`) followed by a long-click of the middle button, you will be un-subscribed from all topics. If at any point in the down click process, you press another button, it will reset the click count. 

## Example
The following app shows what the screens will look like:

[eCribbage Tournaments](https://apps.getpebble.com/en_US/application/559dc7b7807f3e76f10000a4)
