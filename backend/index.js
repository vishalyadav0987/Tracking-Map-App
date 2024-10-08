const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Your frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
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


if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(frontendPath));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(frontendPath, "index.html"))
  })
}


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
