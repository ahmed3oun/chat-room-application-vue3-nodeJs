const express = require('express');
const app = express();
const cors = require('cors')
//const filetor = require('filetor').filetor
//const path = require('path')
const fs = require('fs')

var connectedUsers = []
/* const socketSessions = [] */

app.use(express.static('public'));
app.use(express.json())
app.use(cors({ origin: 'http://localhost:8080' }))
//create Http Server Which dispateches request to express
const server = require('http').createServer(app);
//Socket allowed to listen for requests: socket and expresss are sharing the same http server
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', function (client) {
    //If a client joins the global room
    client.on('join', function (username) {
        client.username = username;
        console.log(client.username, " is connected ...");
        connectedUsers.push(username)
        console.log("Connected Users ==> : ", connectedUsers);
        client.emit('connected_users', connectedUsers)
        client.broadcast.emit('connected_users', connectedUsers)

        client.on('message', function (data) {
            //broadcast the message to all the Connected clients
            console.log('emit message by ', data);
            client.broadcast.emit('message', data);
            client.emit('message', data);
        });

        client.on('private message', (send_box) => {
            console.log(`
            message: ${send_box.msg} 
            to recepient ${send_box.recepient} 
            by ${client.username}`
            );
            let recepientClient;

            io.sockets.sockets.forEach(_client => {
                if (_client.username === send_box.recepient) {
                    recepientClient = _client
                }
            });

            recepientClient.emit('private message',
                {
                    'recepient': send_box.recepient,
                    'msg': send_box.msg,
                    'from': send_box.from,
                    'dateTime': send_box.dateTime
                }
            );
            client.emit('private message',
                {
                    'recepient': send_box.recepient,
                    'msg': send_box.msg,
                    'from': send_box.from,
                    'dateTime': send_box.dateTime
                }
            );
        })

        client.on('private typing', (data) => {
            let recepientClient;

            io.sockets.sockets.forEach(_client => {
                if (_client.username === data) {
                    recepientClient = _client
                }
            });
            recepientClient.emit('private typing', client.username)
        });

        client.on('typing', () => {
            client.broadcast.emit('typing', client.username)
        });

        client.on('upload', async (file, sender, callback) => {
            console.log(file);
            let fileName = 'user' + new Date().getTime().toString() + "image.png";
            //upload to folder
            fs.writeFile(
                `F:/files/${fileName}`  ,
                file,
                { encoding: 'base64' },
                function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        /* F:\ahmed\PFE2022\tawa.digital.projects\socket-io-server\public\files\user1674575918061image.png */
                        //success
                        /*                     io.sockets.sockets.forEach(_client => {
                                                if (_client.username === send_box.recepient) {
                                                    recepientClient = _client
                                                }
                                            });
                                            */
                        let output = io.emit('uploaded_file', {
                            path: `F:/files/${fileName}`,
                            sender: sender,
                            date: `${new Date().getDate()}-${new Date().getTime()}`,
                            valid: true
                        })

                        /* let output = io.emit('download', {
                            valid: 'true',
                            message: 'success',
                            buffer: file.toString('base64')
                        }) */
                        console.log('io.emit ===> ', output);
                        //return image back to js-client
                        //io.to(socketid).emit('avatar-updated',{valid:'true',message:'success',buffer: data.toString('base64') 
                        //});
                    }
                });
        });
        //Source: https://stackoverflow.com/questions/67954559

        /* let upload = await filetor({
            file: file,
            dir: path.join(__dirname, '/public/files'),
            allowedExtentions: ["*"]
        }) */
        /* fs.writeFile(path.join(__dirname, '/public/files', new Date().getTime().toString(), '.PNG'), file, function (err) {
            if (err) throw err;
            console.log('Saved!');
        }); */
        //console.log(upload);
    })

    client.on('disconnect', () => {
        console.log(client.username, ' disconnected');
        connectedUsers = connectedUsers.filter((username) => username !== client.username)
        console.log("Connected Users ==> : ", connectedUsers);
        client.emit('connected_users', connectedUsers)
        client.broadcast.emit('connected_users', connectedUsers)
    });
});

server.listen(3030, () => {
    console.log("server running on http://localhost:3030");
});

// how to check docker version ?    
