const express = require('express');
const WebSocket = require('ws');
const internalIp = require('internal-ip');
const e = require('express');
let infolog = (data) => {
  console.log(`${process.pid}: ${data}`)
}
function sendEvent(event, data) {
  return JSON.stringify({"e": event, "d": data})
}

const app = express();
  // Just a basic route
  app.get('/', function (req, res) {
    res.send(`Hello from PID ${process.pid}`);
    infolog(`Get on ${req.baseUrl} from ${req.ip}`)
  });

module.exports = (socket, auth) => {
 /*  (async ()=> {
    var myIp = await internalIp.v4() */
  
  const ws = new WebSocket(`ws://${socket}`, {
  perMessageDeflate: false
});
infolog(`Connected to socket "ws://${socket}"`)
ws.on('open', open => {
  infolog("WS opened")
  //infolog(`DEBUG: sending stuffs ${JSON.stringify({"PID": process.pid, /* "INT_IP": myIp, */ "AUTH": auth})}`)
  ws.send(sendEvent("NODE_CONNECT", {"PID": process.pid, /* "INT_IP": myIp, */ "AUTH": auth}))
  ws.on('message', message => {
    var prs = JSON.parse(message)
    if(prs.e = "START_EXPRESS") {
      app.listen(prs.d.port)
    } else if(prs.e = "STOP_EXPRESS") {
      app.close()
    }
  })
  
  

})
/* })  */
}
infolog('Application running!');