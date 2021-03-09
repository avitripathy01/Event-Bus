const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
const subscribers = new Map();
const eventsStore = [];

class EventData{

    constructor(eventType, eventData){
        this.time = new Date().getTime();
        this.eventType = eventType;
        this.eventData = eventData;
    }
    toString(){
        return `Event ${this.eventType} occured at ${time}`;
    }
}
 
app.post('/add-subscribers', (req, res) =>{
 
   if(subscribers.has(req.body.type)){
        let sub = subscribers.get(req.body.type);
        console.log('sub list');
        sub.push(req.body.subscriberAddress);
   }else{
        subscribers.set(req.body.type, []);
        subscribers.get(req.body.type).push(req.body.subscriberAddress);
   }
   res.send('Subscriber added successfully');
});

app.get('/list-events', (req, res) =>{
     
    if(subscribers.size !== 0){
        const keys = [];
        for (let key of subscribers.keys()){
            keys.push(key);
        }
        res.send('Registered events :: '+ keys);
        return;
    }
    res.send( 'No events registered with the events bus');

});

app.post('/events', (req, res) =>{
     
    if(req.body.type && subscribers.has(req.body.type)){
        let subscriberList = subscribers.get(req.body.type);
        stampEvent(req.body.type, req.body.data);
        for(let subscriber of subscriberList){
            informSubscriber(subscriber, req.body.type, req.body.data);
            
        }
        res.send('Events posted to bus');
    } 
    
});

app.get('/events', (req, res) =>{
     
     res.send(eventsStore);
    
});

 
const informSubscriber = async (subscriber, type, data) =>{
    try{
        await axios.post(subscriber, {type: type, data: data});
    }catch(error){
            console.log(error);
    }

};
const stampEvent = (type, data) =>{
    eventsStore.push(new EventData(type, data));

}
app.listen(3000, () =>{
    console.log('Listening on express server !');
});