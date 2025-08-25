import express from "express"
import http from "http"
import { Server } from "socket.io"
export const app = express()
export const server = http.createServer(app)
/*
// START DB

//const express = require('express');
import db from './db.js'

//const app = express();

app.use(express.json());

app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).send('Database error');
    res.json(results);
  });
});

//app.listen(3000, () => console.log('Server running on port 3000'));

// END DB
*/
const io = new Server(server, { cors: {origin: "*" } })

app.use(express.static("public"))

const rooms = {}

io.on("connection", socket => {
    console.log("Client connected: " + socket.id)

    socket.on("joinRoom", roomCode => {
        if (!rooms[roomCode]) {
            rooms[roomCode] = {
                hexArray: [], // fill defaults later
                nodes: { content: [], x: [], y: [], size: [] },
                tiles: {},
                empty: true
            }
            console.log(`Room ${roomCode} created`)
        }
        else {
            socket.emit("initState", rooms[roomCode])
        }
        socket.join(roomCode)
    })

    socket.on("tileChange", ({roomId, row, col, color}) => {
        if (!rooms[roomId]) return
        const key = `${row},${col}`
        rooms[roomId].tiles[key] = color
        rooms[roomId].empty = false
        if (!rooms[roomId].hexArray[row]) {
            rooms[roomId].hexArray[row] = []
        }
        rooms[roomId].hexArray[row][col] = color
        socket.to(roomId).emit("tileChange", { row, col, color })
    })

    socket.on("changeNodes", ({roomId, nodePackage}) => {
        if (!rooms[roomId]) return
        rooms[roomId].nodes = nodePackage
        socket.to(roomId).emit("changeNodes", {nodePackage})
    })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`)
})