const { listen } = require("engine.io");
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var fs = require("fs");
const { dirname } = require("path");

const connections = [null, null];

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html")
});

app.get("/single", function(req, res){
    res.sendFile(__dirname + "/single/index.html");
});

app.get("/multi", function(req, res){
    res.sendFile(__dirname + "/multi/indexx.html");
});


io.sockets.on("connection", function(socket){
    let playerSunkenShips = 0;
    let playerIndex = -1;
    for(const i in connections){
        if(connections[i] == null){
            playerIndex = i
            break;
        }
    }
    console.log("Welcome player " + playerIndex)

    socket.emit("playerNumber", playerIndex);
    
    if(playerIndex == -1){
        return;
    }

    if(playerIndex == 0){
        socket.emit("yourTurn", true);
    }

    connections[playerIndex] = false;

    socket.on("disconnect", function(){
        connections[playerIndex] = null;
    })

    socket.on("fieldToCheck", function(fieldID){
        socket.broadcast.emit("fieldToCheckFromServer", fieldID);
    })

    socket.on("fieldChecked", function(response){
        socket.broadcast.emit("fieldCheckedFromServer", response);
        if(response[1] == true){
            socket.emit("yourTurn", false);
            socket.broadcast.emit("yourTurn", true);
        } else {
            socket.emit("yourTurn", true);
            socket.broadcast.emit("yourTurn", false);
        }
        if(response[2] == true){
            playerSunkenShips++;
            if(playerSunkenShips == 10){
                socket.emit("endAndWinOrLose", false);
                socket.broadcast.emit("endAndWinOrLose", true);
            }
        }
    })

    socket.on("playerStatus", function(status){
        socket.broadcast.emit("playerStatusFromServer", status)
    })
})


server.listen(8080);