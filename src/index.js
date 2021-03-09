const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const subscribers = new Map();
const eventsStore = [];

class EventData {

    constructor(eventType, eventData) {
        this.time = new Date().getTime();
        this.eventType = eventType;
        this.eventData = eventData;
    }
    
    toString() {
        return `Event ${this.eventType} occured at ${time}`;
    }
}

app.post('/add-subscribers', (req, res) => {

    if (subscribers.has(req.body.type)) {
        let sub = subscribers.get(req.body.type);
        console.log('sub list');
        sub.push(req.body.subscriberAddress);
    } else {
        subscribers.set(req.body.type, []);
        subscribers.get(req.body.type).push(req.body.subscriberAddress);
    }
    res.send('Subscriber added successfully');
});

app.get('/list-events', (req, res) => {

    if (subscribers.size !== 0) {
        const keys = [];
        for (let key of subscribers.keys()) {
            keys.push(key);
        }
        res.send('Registered events :: ' + keys);
        return;
    }
    res.send('No events registered with the events bus');

});

app.post('/events', (req, res) => {

    if (req.body.type && subscribers.has(req.body.type)) {
        let subscriberList = subscribers.get(req.body.type);
        stampEvent(req.body.type, req.body.data);
        for (let subscriber of subscriberList) {
            informSubscriber(subscriber, req.body.type, req.body.data);

        }
        res.send('Events posted to bus');
    }

});

const displayEventsDataList = (store) => {
    let message = '<ul>';
    for (let msg of store) {
        message += `<li>${msg}</li>`;
    }
    message += '</ul>';
    return `<div>Event message list </div><br/><div>${message}</div>`
};
app.get('/events', (req, res) => {
    res.send(displayEventsDataList(eventsStore));
});

app.get('/get-past-events/:timeline', (req, res) => {

    const pastEvents = eventsStore.filter(evt => {
        return evt.timeline <= req.params.timeline;
    });
    res.send(displayEventsDataList(pastEvents));
});
app.get('/get-format', (req, res) => {
    const postEvents = `{
        "type": "EVENT_CREATED", 
        "data": "abcd"
       }`;

    const postEventFormat = `Post Event Format 
    ${postEvents};
    `;

    const addSubscribers = `
        {
            "type": "UPDATED", 
            "subscriberAddress": "http://localhost:3000/send"
           }
    `;
    const addSubScriberFormat = `Add subscriber Format 
           ${addSubscribers}
    `;
    res.send(`<div>${postEventFormat}</div><div>${addSubScriberFormat}</div>`);

});

app.get('/', (req, res) => {

    const responseString = `<div><h2>Find the list of the subscribed events at <a href="/list-events">here</a></h2></div>
    <div><h2>Find the list of the events <a href="/events">here</a></h2></div>
    <div><h2>To add subscriber, make  post requests to the server using the format <a href="/get-format">here</a></h2></div>
    <div><h2>To emit events, post requests to the server using the format <a  href="/get-format">here</a></h2></div>
    `
    res.send(responseString);
});



const informSubscriber = async (subscriber, type, data) => {
    try {
        await axios.post(subscriber, { type: type, data: data });
    } catch (error) {
        console.log(error);
    }

};
const stampEvent = (type, data) => {
    eventsStore.push(new EventData(type, data));

}
app.listen(3000, () => {
    console.log('Node express listening on 3000 !');
});