const express = require("express");
const chalk = require("chalk");
const app = express();
// Socket IO
const socketIo = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
    }
});
var rooms = [];
var gameState = []
io.on("connection", socket => {
    
    console.log(socket.id + ' ==== connected');
    socket.on('create', function(id) {
        socket.join(id);
        rooms.push({room: id, players: [socket.id], gameState: ["", "", "", "", "", "", "", "", ""], turn: "x"});
        console.log(chalk.green(socket.id + ' ==== created room ' + id));
        rooms.forEach(r => { 
            if (r.room === id) {
                // Sending the rooms to the client
                socket.emit('onMessage', r);
            }
        })
    });
    socket.on('join', id => {
        socket.join(id);
        rooms.forEach(r => { 
            if (r.room === id) {
                r.players.push(socket.id);
                // Sending the rooms to the client
                socket.emit('onMessage', r);
                Array.from(socket.rooms)
                .filter(it => it !== socket.id)
                .forEach(id => {
                    socket.to(id).emit('onMessage', r, function (err, success) {
                    });
                });
            }
        })
        console.log(chalk.green(socket.id + ' ==== joined room ' + id));   
    });
    socket.on("emitMessage", message => {
        Array.from(socket.rooms)
            .filter(it => it !== socket.id)
            .forEach(id => {
                socket.to(id).emit('onMessage', message, function (err, success) {
                    console.log(message)
                    // gameState.push(message)  
                });
            });
    });
    socket.on("disconnect", () => {
        console.log(socket.id + ' ==== diconnected');
        socket.removeAllListeners();
    });
});


server.listen(process.env.PORT || 3001, () => {
    console.log(
        "%s App is running at http://localhost:%d in %s mode",
        chalk.green("✓"),
        process.env.PORT,
        process.env.MODE
    );
    console.log("  Press CTRL-C to stop\n");
});

