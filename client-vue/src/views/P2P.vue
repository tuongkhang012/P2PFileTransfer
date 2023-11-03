<template>
    <body>
        <h1>Welcome to P2P client App</h1>

        <div class="container my-3 p-3 border border-primary rounded-3">
          <h1> P2P SERVICE </h1>
          <div class="row">
            <div class="col mx-1 border border-dark rounded-3">
              <div class="row">
                <h2>PUBLISH</h2>
                <p class="text-center">
                  Upload the file you want to publish.
                </p>
              </div>
              <div>
                <form class="form-group" ref="fileForm" @submit.prevent="publishFile">
                  <div class="row text-start">
                    <label> Upload file:
                      <input class="form-control" type="file" ref="fileInput" />
                    </label>
                  </div>
                  <div class="row text-start">
                    <label> File public name:
                      <input class="form-control" v-model="fileInputName" placeholder="Enter the file name" type="text">
                    </label>
                  </div>
                  <button class="btn btn-primary my-3" type="submit">Submit</button>
                </form>
              </div>
            </div>
            <div class="col mx-1 border border-dark rounded-3">
              <div class="row">
                <div class="flow-text">
                  <h2>FETCH</h2>
                    <p class="text-center">
                      Enter the name of the file you want to get. Larger files may take longer to load, please wait patiently without refreshing the page.
                    </p>
                  </div>
                </div>
              <form class="form-group" ref="getFileForm" @submit.prevent="getFile" id="queryForm">
                <div class="row text-start">
                  <label> File name:
                    <input class="form-control" v-model="queryFileName" placeholder="Enter the file name" type="text">
                  </label>
                </div>
                <button class="btn btn-primary my-3" type="submit">Submit</button>
              </form>
            </div>
          </div>

          <div class="container my-3 p-3 border border-warning rounded-3">
            <h1> RESULT </h1>
            <div class="row">
              <div class="col mx-1 border border-dark rounded-3">
                Published files:
                  <div v-for="(file, index) in localDirectory" :key="index">
                    <div class="row text-start">
                      <p>
                        <strong>{{ index+1 }}:</strong>
                        <br/> Publish name: {{ file.publicName }}
                        <br/> Local name: {{ file.name }}
                      </p>
                    </div>
                  </div>
              </div>
              <div class="col mx-1 border border-dark rounded-3">
                Download link:
                <div v-if="fileDownload.length > 0" v-for="(file, index) in fileDownload" :key="index">
                  <div class="row text-start">
                    <p>
                      <strong>{{ index+1 }}:</strong>
                      <br/> From: {{file.ip}}
                      <br/> Link: <a :href="file.data" :download="file.name">{{ file.name }}</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="container mb-3 p-3 border border-primary rounded-3">
          <div class="row" v-if="showButtons">
            <h1> ADMIN ZONE </h1>
            <div class="col mx-1 border border-dark rounded-3">
              <div class="row">
                <h2>Discover</h2>
                <p class="text-center">
                  Find the published file of one hostname.
                </p>
              </div>
              <form ref="queryHostForm" class="form-group" @submit.prevent="discoverHost">
                <div class="row text-start">
                  <label>
                    Discover:
                    <input class="form-control" type="text" v-model="queryHostname" placeholder="Enter hostname">
                  </label>
                </div>
                <button class="btn btn-primary my-3" type="submit">Find</button>
              </form>
            </div>
            <div class="col mx-1 border border-dark rounded-3">
              <div class="row">
                <h2>PING</h2>
                <p class="text-center">
                  Ping hostname.
                </p>
              </div>
              <form ref="pingHostForm" class="form-group" @submit.prevent="pingHost">
                <div class="row text-start">
                  <label class="text-start">
                    Ping:
                    <input class="form-control" type="text" v-model="pingHostname" placeholder="Enter hostname">
                  </label>
                </div>
                <button class="btn btn-primary my-3" type="submit">Ping</button>
              </form>
            </div>

            <div class="container my-3 p-3 border border-warning rounded-3">
              <h1> RESULT </h1>
              <div class="row">
                <div class="col mx-1 border border-dark rounded-3">
                  Published files from queried host:
                  <div v-for="(file, index) in hostDirectory" :key="index">
                    <div class="row text-start">
                      <p>
                        <strong>{{ index+1 }}:</strong>
                        <br/> From: {{ file.ip.split(":")[3] }}
                        <br/> Publish name: {{ file.fileName }}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="col mx-1 border border-dark rounded-3">
                  Ping message:
                  <div v-if="pingmsg">
                    <div class="row text-start">
                      <p>
                        {{ pingmsg }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row" v-else>
            <form class="form-group">
              <label>
                Admin Password:
                <input class="form-control" type="password" v-model="password" placeholder="Enter password">
              </label>
              <button class="btn m-2 btn-danger" @click="checkPassword">Submit</button>
            </form>
          </div>
        </div>

    </body>
    </template>
    
    <script>
    import Peer from 'peerjs';
    import io from 'socket.io-client';
    
    export default {
      name: 'HelloWorld',
      data() {
        return {
          password: "",
          showButtons: false,
          serverUrl: `http://${process.env.VUE_APP_SOCKET_ADDRESS}:${process.env.VUE_APP_SOCKET_PORT}`,
          centralSocket: null,
          peer: null,
          localDirectory: [],
          hostDirectory: [],
          pingmsg: "",
          fileInputName: "",
          queryHostname: "",
          pingHostname: "",
          toSend: {
            pid: "",
            fileName: "",
            port: "",
          },
          queryFileName: "",
          fileDownload: [],
          fileInfo: {
            file: null,
            ip: "",
          }
        };
      },
      created() {
        //socket-client
        this.centralSocket = io(this.serverUrl);
        //create peer for each instance of client
        this.peer = new Peer([Math.floor(Date.now() / 1000)]);
    
        //this listen for incoming peer
        this.peer.on('connection', (conn) => {
          //listen for data being sent to us
          conn.on('data', (data) => {
            for(var file of this.localDirectory){
              if(file.publicName === data.fileName){
                this.fileInfo.file = file;
                this.fileInfo.ip = data.ip.split(':')[3];

                conn.send(this.fileInfo)
                break;
              }
            }
          });
        });
    
        //this listen to socket emit on file found
        this.centralSocket.on('fileFound', (client) => {
          console.timeEnd("findFile")
          const conn = this.peer.connect(client.pid);
    
          //open connection between peer
          conn.on("open", () => {
            conn.send(client)
    
            conn.on("data", (data) => {
              //condense file into blob and send
              const blob = new Blob([data.file.data], { type: 'text/plain' });
              this.fileDownload.push({ name: data.file.name, data: URL.createObjectURL(blob), ip: data.ip });
              console.timeEnd("getFile")
              
              conn.close();
            })
          });
        });
    
        //when query fails
        this.centralSocket.on('fileNotFound', () => {
          window.alert('File not found on any of the clients');
        });

        //when hostfind fails
        this.centralSocket.on('hostNotFound', () => {
          window.alert("Host hasn't published any files or doesn't exist");
        });

        //when query fails
        this.centralSocket.on('hostFound', (data) => {
          this.hostDirectory = data;
        });

        //when found identical name
        this.centralSocket.on('readFcode', () => {
          this.localDirectory.pop()
          window.alert("This publish name is already in use! Please change the name!");
        })

        this.centralSocket.on('pingResult', (msg) => {
          this.pingmsg = msg;
        })
      },
      methods: {
        //publish file
        publishFile() {
          console.time("publish")
            //read file input
            const fileInput = this.$refs.fileInput;
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const reader = new FileReader();

                //if the user didn't insert a new name, get the local name instead
                if(!this.fileInputName){
                  this.toSend.fileName = file.name;
                }
                else {
                  this.toSend.fileName = this.fileInputName
                }

                //store file to local directory on each client (not server)
                console.time("uploadFile")
                reader.onload = (event) => {
                    this.localDirectory.push({ name: file.name, publicName: this.toSend.fileName , data: event.target.result });
                };

                //read file
                reader.readAsArrayBuffer(file);
                console.timeEnd("uploadFile")
            }
            else {
              window.alert("Please upload a file!")
              return false;
            }

            this.toSend.pid = this.peer.id;
            this.toSend.port = 8080;

            //emit event for the server to get this file information
            this.centralSocket.emit('readTest', this.toSend);
            this.$refs.fileForm.reset();
            console.timeEnd("publish")
        },
    
        getFile() {
          //query for file
          console.time("findFile")
          console.time("getFile")
          if(!this.queryFileName){
            window.alert("File name can't be empty")
            return false;
          }
    
          //emit event for the server to search for this filename
          this.centralSocket.emit('searchFile', this.queryFileName);
    
          this.$refs.getFileForm.reset();
        },

        checkPassword() {
          this.showButtons = this.password === process.env.VUE_APP_ADMIN_PASSWORD
        },

        discoverHost() {
          //emit event for the server to find files belonging to this hostname
          this.centralSocket.emit('searchHost', this.queryHostname)
          this.$refs.queryHostForm.reset();
        },

        pingHost() {
          //emit event for the server to ping this hostname
          this.centralSocket.emit('pingHost', this.pingHostname)
          this.$refs.pingHostForm.reset();
        }
      },
    }
    </script>
    
    <style scoped>
    
    </style>
    