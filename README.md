# Tracking-Map-App

The **Tracking-Map App** is a MERN stack application that provides real-time location tracking using an interactive map with a moving marker. It allows users to visualize dynamic movements on a map, which can be useful for tracking deliveries, vehicles, or any other moving entities.

## Features

- **Real-time Tracking**: Displays a moving marker on a map to represent real-time location changes.
- **Interactive Map**: Allows users to pan, zoom, and interact with the map to view different locations.
- **Customizable Marker**: Option to customize marker appearance and behavior.
- **Live Updates**: Fetches and displays location updates dynamically from the backend.
- **Error Handling**: Provides error messages for connectivity issues and other potential problems.
- **User Authentication**: Secure user authentication and authorization using JWT (if applicable).

## Tech Stack

- **Frontend**: React.js, Leaflet (for interactive maps)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time Communication**: Socket.io (if used for real-time updates)
- **Deployment**: Render

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/tracking-map-app.git
    cd tracking-map-app
    ```

2. **Install backend dependencies**:

    ```bash
    cd backend
    npm install
    ```

3. **Install frontend dependencies**:

    ```bash
    cd ../frontend
    npm install
    ```

4. **Start the development servers**:
   - Backend server:
     ```bash
     cd backend
     npm start
     ```
   - Frontend server:
     ```bash
     cd frontend
     npm run dev
     ```

## Set up environment variables

Create a `.env` file in the backend directory and add the following:

- MONGO_URI=your_mongodb_connection_string
- PORT=5000
- FRONTEND_URL=https://tracking-map-app.onrender.com

## Aplication online

- **Tracking-Map-App**: <a href="https://tracking-map-app.onrender.com" _blank >Click here Live Application.</a>



## Deployment
This application is deployed on Render. To deploy your own version:

1. Create a new web service on Render and connect your GitHub repository.
2. Add the necessary environment variables in the Render dashboard.
3. Deploy the application.

## Acknowledgements
- MongoDB
- Express.js
- React
- Node.js
- Render
- Leaflet (for interactive maps)

## Contact
If you have any questions or suggestions, feel free to open an issue or contact me at viahalyadav0987@gmail.com.
