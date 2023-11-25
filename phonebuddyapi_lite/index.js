require('dotenv').config();
const express = require('express');
const twilio = require('twilio')
const app = express();
const fs = require('fs');
app.use(express.urlencoded({ extended : true }));

const socketMap = new Map();
const initialCallResponse = new twilio.twiml.VoiceResponse();
initialCallResponse.pause({ length: 10 });
const callXML = initialCallResponse.toString();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// handling preflight request(cors)
app.all('*', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS);
    res.setHeader('Access-Conrol-Allow-Headers', 'Content-Type, X-Custom-Header')
    next();
});

app.post('/api', async (req, res) => {
    res.sendStatus(200);
    let {amd, numbers} = req.body;
});

app.get('/token', async (req, res) => {
    let token = getToken('guest');
    res.json({token});
})

app.get('/twilio/webhook', async (req, res) => {
    res.sendStatus(200);
    let {CallSid, CallStatus} = req.query;
    console.log('status change', CallSid, CallStatus);
    emit(CallSid, CallStatus);
    if(CallStatus == 'busy' || CallStatus == 'no-answer' ||
       CallStatus == 'cancelled' || CallStatus == 'completed') {
        socketMap.delete(CallSid);
    }
});

app.post('/twilio/webhook', async (req, res) => {
    res.sendStatus(200);
    let {CallSid, AnsweredBy} = req.body;
    console.log('amd', CallSid, AnsweredBy);
    emit(CallSid, 'in-progress', AnsweredBy);
});

app.post('/call', async (req, res) => {
    var phoneNumber = req.body.phoneNumber;
    var callerId = process.env.TWILIO_PHONE_NUMBER;
    var twiml = new twilio.twiml.VoiceResponse();
    var dial = twiml.dial({callerId : callerId});
    dial.number({}, phoneNumber);
    res.send(twiml.toString());
})

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is listening at ${process.env.PORT}`);
});

const io = require('socket.io')(server, {
    cors : { origin : process.env.CORS }
});

io.on('connection', socket => {
    socket.on('api', (msg) => {
        // make calls
        let { amd, numbers } = msg;
        console.log(amd, numbers);
        numbers.forEach((number) => {
            makeCall(amd, number)
            .then(e => {
                set(e.sid, socket, number);
                // emit(e.sid, 'initiated');
            })
            // console.log('dialer...', number);
        });
    });
    socket.on('token', () => {
        // try {
        //     var token = fs.readFileSync('./token.json', { encoding: 'utf-8' });
        // } catch (error) {
        //     var token = getToken('guest');
        //     fs.writeFile('./token.json', token, { encoding: 'utf-8' }, () => {});
        // }
        let token = getToken('guest');
        socket.emit('token', {token});
    })
})
io.on('disconnect', (e) => {
    console.log('disconnected', e);
})

/**
 * makes a call from twilio client
 * @param {boolean} amd 
 * @param {string} number 
 */
function makeCall(amd, number) {
    return client.calls.create({
        to : number,
        from : process.env.TWILIO_PHONE_NUMBER,
        twiml : callXML,
        machineDetection : amd? "Enable" : "none",
        asyncAmd : amd,
        asyncAmdStatusCallback : process.env.SYSTEM_AGNOSTIC_URL + '/twilio/webhook',
        statusCallback : process.env.SYSTEM_AGNOSTIC_URL + '/twilio/webhook',
        statusCallbackMethod : 'GET',
        statusCallbackEvent : [
          "initiated",
          "ringing",
          "answered",
          "completed",
        ]
    });
}

/**
 * Sets record to socket if none exists
 * Emits busy call status back to socket if entry exists
 * @param {string} to - Number used as key for socket record
 */
function set(sid, socket, to) {
    if(socketMap.has(to)) 
        socket.emit('api', {to, callStatus : 'busy'});
    socketMap.set(sid, {socket, to});
}

/**
 * Emits data to corresponding socket entry
 * @param {string} to - Number used as key for socket record
 * @param {string} callStatus
 * @param {string} answeredBy
 */
function emit(sid, callStatus, answeredBy) {
    if(!socketMap.has(sid)) return 0;
    // console.log('has sid', sid);
    let entry = socketMap.get(sid);
    entry.socket.emit('api', {to: entry.to, callStatus, answeredBy});
}

/**
 * Returns a twilio access token
 * @param {string} clientName 
 */
function getToken(clientName) {
    console.log('generating new token...');
    let accessToken = new twilio.jwt.AccessToken
    (process.env.TWILIO_ACCOUNT_SID, 
     process.env.TWILIO_API_KEY, 
     process.env.TWILIO_API_SECRET);
    accessToken.identity = clientName;
  
    let grant = new twilio.jwt.AccessToken.VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_APP_SID,
      incomingAllow: true,
    });
    accessToken.addGrant(grant);
    return accessToken.toJwt();
}