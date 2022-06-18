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
const winState = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ]

io.on("connection", socket => {
    
    console.log(chalk.green(socket.id + ' ==== connected'));
    socket.on('create', function(id) {
        socket.join(id);
        rooms.push({
            room: id, 
            players: [socket.id], 
            gameState: ["", "", "", "", "", "", "", "", ""], 
            turn: "x",
            winner: ""
        });
        console.log(chalk.green(socket.id + ' ==== created room ' + id));
        rooms.forEach(r => { 
            if (r.room === id) {
                // Sending the rooms to the client
                socket.emit('updateBoard', r);
            }
        })
    });
    socket.on('join', id => {
        socket.join(id);
        rooms.forEach(r => { 
            if (r.room === id) {
                r.players.push(socket.id);
                // Sending the rooms to the client
                socket.emit('updateBoard', r);
                Array.from(socket.rooms)
                .filter(it => it !== socket.id)
                .forEach(id => {
                    socket.to(id).emit('updateBoard', r, function (err, success) {
                    });
                });
            }
        })
        console.log(chalk.green(socket.id + ' ==== joined room ' + id));   
    });
    socket.on('newGame', id => {
        console.log(id)
        rooms.forEach(r => { 
            if (r.room === id) {
                // Sending the rooms to the client
                r.gameState = ["", "", "", "", "", "", "", "", ""];
                socket.emit('updateBoard', r);
                Array.from(socket.rooms)
                .filter(it => it !== socket.id)
                .forEach(id => {
                    socket.to(id).emit('updateBoard', r, function (err, success) {
                    });
                });
            }
        })
        console.log(chalk.green(socket.id + ' ==== reseted the game ' + id));   
    });
    socket.on("lobbyData", message => {
        Array.from(socket.rooms)
            .filter(it => it !== socket.id)
            .forEach(id => {
                socket.to(id).emit('updateBoard', message, function (err, success) {
                    winState.forEach(state => {
                        if(state.every(i => (message?.gameState[i]) === "x")){
                            message.winner = "x";
                        }
                        else if(state.every(i => (message?.gameState[i]) === "o")){
                            message.winner = "o";
                        }
                    })
                    io.in(id).emit('updateBoard', message)
                });
            });
    });
    socket.on("disconnect", () => {
        console.log(chalk.red(socket.id + ' ==== diconnected'));
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

