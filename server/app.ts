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
io.on("connection", socket => {
    let gameState = []
    console.log(socket.id + ' ==== connected');
    socket.on('join', roomData => {
        console.log(roomData)
        Array.from(socket.rooms)
            .filter(it => it !== socket.id)
            .forEach(id => {
                socket.leave(id);
                socket.removeAllListeners("emitMessage");
            });
        socket.join(roomData);
        console.log("Joined room: " + roomData);
        socket.on("emitMessage", message => {
            Array.from(socket.rooms)
                .filter(it => it !== socket.id)
                .forEach(id => {
                    socket.to(id).emit('onMessage', message, function (err, success) {
                        gameState.push(message)
                    });
                });
        });

        socket.on("disconnect", () => {
            console.log(socket.id + ' ==== diconnected');
            socket.removeAllListeners();
        });
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

