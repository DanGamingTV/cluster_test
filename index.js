const cluster = require('cluster');
const os = require('os');
require('dotenv').config()
const runExpressServer = require('./app');
const internalIp = require('internal-ip');
const isSyncServer = true;
const syncServer = `${process.env.MYIP}:${process.env.MYPORT}`
// Check if current process is master.
if (cluster.isMaster) {
  // Get total CPU cores.
  var nodes = {};
  const cpuCount = os.cpus().length;

  // Spawn a worker for every core.
  for (let j = 0; j < cpuCount; j++) {
    cluster.fork();
  }
if (isSyncServer) {
  const WebSocket = require('ws');

const wss = new WebSocket.Server({
  port: process.env.MYPORT,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024 // Size (in bytes) below which messages
    // should not be compressed.
  }
});
wss.on('connection', ws => {
  ws.allowed = false
  console.log(`WS: Got connection`)
  ws.on('message', message => {
    console.log(`WS: Got message ${message}`)
    var prsed = JSON.parse(message)
    if(prsed.e == "NODE_CONNECT") {
      if(prsed.d.AUTH == process.env.KEY) {
        nodes[`${prsed.d.PID}`] = {/* ip: prsed.d.INT_IP,  */pid: prsed.d.PID}
        ws.allowed = true;
        ws.pid = prsed.d.PID;
        console.log(`WS: Authenticated new node: ${JSON.stringify(nodes[`${ws.pid}`])}`)
        ws.send(JSON.stringify({"e": "START_EXPRESS", "d": {"port": process.env.EXPRESS_PORT}}))
      } else {
        ws.allowed = false;
        delete nodes[`${ws.pid}`]
        ws.close()
      }
    }
  });

  ws.on('close', evt => {
    console.log(`WS: oops! worker ${ws.pid} died :( launching a new one`)
    cluster.fork()
  })
})
}


} else {


  runExpressServer(syncServer, process.env.KEY)

  
}

// Cluster API has a variety of events.
// Here we are creating a new process if a worker die.
cluster.on('exit', function (worker) {
  console.log(`Worker ${worker.id} died'`);
  console.log(`Staring a new one...`);
  cluster.fork();
});