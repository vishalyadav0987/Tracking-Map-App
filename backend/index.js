const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:5173', // Your frontend URL
        methods: ['GET', 'POST'],
        credentials: true, // Allows cookies to be sent
    },
});

mongoose.connect('mongodb+srv://Todoapp:qnY_3f7cYquJnj7@todoapp.itvgavl.mongodb.net/Tracker-App?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

const locationSchema = new mongoose.Schema({
    userId: String,
    latitude: Number,
    longitude: Number,
    timestamp: { type: Date, default: Date.now }
});

const Location = mongoose.model('Location', locationSchema);

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('updateLocation', async (data) => {
        const { userId, latitude, longitude } = data;
        await Location.create({ userId, latitude, longitude });
        io.emit('locationUpdate', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(5000, () => {
    console.log('Server running on port 5000');
});
