const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173', // Your frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://Todoapp:qnY_3f7cYquJnj7@todoapp.itvgavl.mongodb.net/Tracker-App?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.error('MongoDB connection error:', error));

const locationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Location = mongoose.model('Location', locationSchema);

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('updateLocation', async (data) => {
    const { userId, latitude, longitude, trackingUserId } = data;
    try {
      await Location.create({ userId, latitude, longitude });

      // Emit location update to the user tracking this user
      io.to(trackingUserId).emit('locationUpdate', data);
    } catch (error) {
      console.error('Error updating location:', error);
      socket.emit('locationError', { message: 'Error updating location' });
    }
  });

  socket.on('trackUser', (trackingUserId) => {
    socket.join(trackingUserId);
    console.log(`User ${socket.id} is tracking ${trackingUserId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
