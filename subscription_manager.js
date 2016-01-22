var UI = require('ui');
var Vibe = require('ui/vibe');


module.exports = SubscriptionManager;

function SubscriptionManager(title, icon, subtitle, body, unsubscribed_label, subscribed_label, reset_downclicks_required){
  this.properties = {unsubscribed_label: "Unsubscribed", subscribed_label: "Subscribed", reset_downclicks_required: 3, title: "", icon: "", subtitle: "", body: "Press the middle button to configure subscriptions."};
  
  if(typeof title == "object"){
    for(var k in title){
      this.properties[k] = title[k];
    }
  } else {
    this.properties.title = title === null ? this.properties.title : title;
    this.properties.icon = icon === null ? this.properties.icon : icon;
    this.properties.subtitle = subtitle === null ? this.properties.subtitle : subtitle;
    this.properties.body = body === null ? this.properties.body : body;
    this.properties.unsubscribed_label = unsubscribed_label === null ? this.properties.unsubscribed_label : unsubscribed_label;
    this.properties.subscribed_label = subscribed_label === null ? this.properties.subscribed_label : subscribed_label;
    this.properties.reset_downclicks_required = reset_downclicks_required === null ? this.properties.reset_downclicks_required : reset_downclicks_required;
  }
  
  this.topics = [];
  this.main = null;
  this.mainMenu = null;
  this.resetDownClicks = 0;
}

SubscriptionManager.prototype.start = function(){
  this.initSubscriptions();
};

SubscriptionManager.prototype.finishInit = function(){
  
  this.main = new UI.Card({
    title: this.properties.title,
    icon: this.properties.icon,
    subtitle: this.properties.subtitle,
    body: this.properties.body
  });

  
  //This is what you see after hitting the select button
  this.mainMenu = new UI.Menu({
    sections:[
      {
        title: "Subscriptions",
        items: this.topics
      }
    ]
  });

  this.main.on('click', 'select', function(e) {
    this.resetDownClicks = 0;
    this.showTopicsMenu();
  }.bind(this));

  //if we click down on the main screen, increment our down click count
  this.main.on('click','down',function(e){
    this.resetDownClicks++;
  }.bind(this));

  //if we click up on the main screen, reset our down click count
  this.main.on('click','up',function(e){
    this.resetDownClicks=0;
  }.bind(this));
  
  //if we long click the select option, AFTER clicking down exactly RESET_DOWNCLICKS_REQUIRED times
  //then reset everything - this includes unsubscribing from all topics
  this.main.on('longClick','select',function(e){
    if(this.resetDownClicks == this.properties.reset_downclicks_required){
      Vibe.vibrate('double');
      this.resetAll();
    }
    this.resetDownClicks=0;
  }.bind(this));

  //show the main window
  this.main.show();

};

SubscriptionManager.prototype.addTopics = function(topics){
  for(var i=0;i<topics.length;i++){
    this.addTopic(topics[i]);
  }
};

SubscriptionManager.prototype.addTopic = function(id, title, icon, subscribed, subtitle){
  var topic = {id: "", title: "", icon: "", subscribed: false, subtitle: this.properties.unsubscribed_label};
  if(typeof id == "object"){
    for(var k in id){
      topic[k] = id[k];
    }
  } else {
    topic.id = id === null ? topic.id : id;
    topic.title = title === null ? topic.title : title;
    topic.icon = icon === null ? topic.icon : icon;
    topic.subscribed = subscribed === null ? topic.subscribed : subscribed;
    if(subtitle === null){
      topic.subtitle =  topic.subscribed ? this.properties.subscribed_label : this.properties.unsubscribed_label;
    } else {
     topic.subtitle = subtitle;
    }
  }
  this.topics.push(topic);
  return topic;
};

SubscriptionManager.prototype.initSubscriptions = function(){
    Pebble.timelineSubscriptions(
      function (subscribed) {
        if(subscribed !== null && subscribed.length > 0){
          //iterate over our internal topic list
          for(var i = 0;i<this.topics.length;i++){
            //if the subscriptions contains the ID of the current topic, that means
            //we are subscribed to it.
            if(subscribed.indexOf(this.topics[i].id) >= 0){
              this.topics[i].subscribed = true;
              this.topics[i].subtitle = this.properties.subscribed_label;
            } else {
              this.topics[i].subscribed = false;
              this.topics[i].subtitle = this.properties.unsubscribed_label;

            }
          }
        }
        this.finishInit();
      }.bind(this),
      function (errorString) {
        console.log('Error getting subscriptions: ' + errorString);
        
      }
    );
};


SubscriptionManager.prototype.showTopicsMenu =function(){
  this.mainMenu.items(0,this.topics);
  this.mainMenu.on("select",this.toggleSubscription.bind(this));
  this.mainMenu.show();
};

//toggles the topic between subscribed and unsubscribed
SubscriptionManager.prototype.toggleSubscription = function(event){
  if(this.isSubscribed(event)){
    this.unsubscribe(event);    
  } else {
    this.subscribe(event);
  }
};

//determined if the event
//represents a menu item of a subscribed topic
SubscriptionManager.prototype.isSubscribed = function(event){
  var topic = this.getTopic(event);
  return topic.subscribed;
};


//subscribes/unsubscribes from the topic
//makes the API call, and if successful,
//will update the status and menu items subtitle
SubscriptionManager.prototype.subUnsub = function(event,callback,subscribed,label){
  var item = this.getTopic(event);
  callback(item.id,
        function(){
          item.subscribed = subscribed;
          item.subtitle = label;
          this.mainMenu.item(event.sectionIndex,event.itemIndex,item); 
        }.bind(this),
        function(error){
          console.log("Updating "+item.id+" to "+label+" failed: "+error);
        }
  );
};


SubscriptionManager.prototype.unsubscribe = function(event){
  this.subUnsub(event,Pebble.timelineUnsubscribe,false,this.properties.unsubscribed_label);
};

//does the opposite of unsubscribe
SubscriptionManager.prototype.subscribe = function(event){
  this.subUnsub(event,Pebble.timelineSubscribe,true,this.properties.subscribed_label);
};

//returns our topic given the id
SubscriptionManager.prototype.getTopic = function(topic){
  if(typeof topic != "object"){ //we were passed in the id, so find it in our array
    for(var i =0;i<this.topics.length;i++){
      if(this.topics[i].id == topic){
        return this.topics[i];
      }
    }
  } else if(typeof topic.menu == "undefined"){ //this is a topic object, just return it
    return topic;
  } else { //we got an event object, so we need to extract the topic
    var menu = topic.menu;
    return menu.item(topic.sectionIndex,topic.itemIndex);
  }
  
  return null;
};

SubscriptionManager.prototype.resetAll = function(){
  for(var i=0;i<this.topics.length;i++){
    this.unsubscribe(this.topics[i]);
  }
};


  
  
