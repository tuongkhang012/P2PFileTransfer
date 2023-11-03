const app = require('express')();
const http = require('http').createServer(app);
const indexer = require('./indexer/indexer');
const port = 3000;
const os = require('os');
//this for the host ip address
const networkInterfaces = os.networkInterfaces();

let ipadr = "";
for (let interface in networkInterfaces) {
    for (let details of networkInterfaces[interface]) {
        if (details.family === 'IPv4' && !details.internal) {
            ipadr = details.address;
        }
    }
}
const io = require('socket.io')(http, {
  cors: {
    origins: [`http://${ipadr}:8080`]
  }
})

//the socket is listening through here
indexer(io);

http.listen(port, () => {
  console.log(`Central server is hosting on port: ${port}`);
});