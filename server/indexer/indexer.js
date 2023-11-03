//1 array to store all the names
let contents = [];
const ping = require('ping');

module.exports = (io) => {
	//listening for connection
	io.on('connection', (socket) => {

		//this listen for read filename event
		socket.on('readTest', (data) => {
			let toPush = true;
			const indexedData = {
				id: socket.id,
				ip: socket.request.connection.remoteAddress,
				fileName: data.fileName,
				port: data.port,
				pid: data.pid,
			}
			//if there exists another file with the same public name, it will deny it
			for(let i = 0; i < contents.length; i++){
				if(contents[i].fileName === data.fileName){
					toPush = false;
					socket.emit('readFcode')
					break;
				}
			}
			if(toPush){
				contents.push(indexedData);
			}
		})

		//this listen for query filename event
		socket.on('searchFile', (fileName) => {
			let found = false;
			//search for the exact filename
			for(var content of contents){
				if(content.fileName === fileName){
					found = true;
					socket.emit('fileFound',content);
					break;
				}
			}
			if(!found){
				socket.emit('fileNotFound');
			}
		});

		//this listen for discover hostname event
		socket.on('searchHost', (hostIP) => {
			let found = false;
			let result = [];
			let i = 0;
			//find all of the files that belongs to the host
			while (i < contents.length){
				if(contents[i].ip.split(":")[3] === hostIP){
					found = true;
					result.push(contents[i])
				}
				i++;
			}
			if(!found){
				socket.emit('hostNotFound');
			}
			socket.emit("hostFound", result)
		});

		//this listen to ping hostname event to check whether if a hostname is alive or not
		socket.on('pingHost', (hostIP) => {
			ping.sys.probe(hostIP, (isAlive) => {
				const message = isAlive ? 'Host ' + hostIP + ' is alive' : 'Host ' + hostIP + ' is dead';
				io.emit('pingResult', message);
			});
		});

		//this listen for disconnection to socket and delete all public name belong to that host
		socket.on('disconnect', () => {
			let i = 0
			while (i < contents.length){
				if(contents[i].id === socket.id){
					contents.splice(i,1);
					continue;
				}
				i++;
			}
		});

		//to catch error
		socket.on('connect_error', (error) => {
			console.log(error);
		});
	});
};