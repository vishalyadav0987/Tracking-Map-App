import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import carIconUrl from './assests/gps-navigation.png'
import 'leaflet-control-geocoder';

const socket = io('http://localhost:5000'); // Connect to your backend server

// Define the custom car icon
const carIcon = new L.Icon({
  iconUrl: carIconUrl, // URL or imported image for the car
  iconSize: [80, 80], // Size of the car icon
  iconAnchor: [20, 40], // Anchor of the icon
  popupAnchor: [0, -40], // Popup anchor relative to the iconAnchor
});

const finalDestination = { lat: 28.6827471, lng: 77.0542594 };
const initialDestination = { lat: 31.2679714, lng: 75.7027308 };

function App() {
  const [location, setLocation] = useState(null); // Initial map center
  const [trackedUserLocation, setTrackedUserLocation] = useState({ lat: 28.6827471, lng: 77.0542594 });   // Location to track
  const [route, setRoute] = useState([]); // The calculated route
  const [trackingUserId, setTrackingUserId] = useState('user456');        // The user to be tracked
  const userId = 'user123';                                               // Current user ID
  const [placeNameInitial, setPlaceNameInitial] = useState(''); // Store the place name
  const [placeNameTrack, setPlaceNameTrack] = useState(''); // Store the place name
  const [placeNameFinal, setPlaceNameFinal] = useState(''); // Store the place name

  useEffect(() => {
    // Get user's current location and send to the server
    const geoId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(latitude, longitude);
        setLocation({ lat: latitude, lng: longitude });
        socket.emit('updateLocation', { userId, latitude, longitude, trackingUserId });

        // Perform reverse geocoding to get the place name
        reverseGeocode(latitude, longitude);
      },
      (error) => console.error('Error getting location:', error),
      { enableHighAccuracy: true }
    );

    // Listen for location updates from the server
    socket.on('locationUpdate', (data) => {
      // setTrackedUserLocation({ lat: data.latitude, lng: data.longitude });
    });

    // Tell server that this client wants to track a specific user
    socket.emit('trackUser', trackingUserId);

    const placeNameInitialP = reverseGeocode(initialDestination.lat, initialDestination.lng);
    placeNameInitialP.then((loc) => setPlaceNameInitial(loc)).catch((err) => {
      console.log(err);
      setPlaceNameInitial("Not found");
    });

    const placeNameFinalP = reverseGeocode(finalDestination.lat, finalDestination.lng);
    placeNameFinalP.then((loc) => setPlaceNameFinal(loc)).catch((err) => {
      console.log(err);
      setPlaceNameFinal("Not found");
    });

    return () => {
      navigator.geolocation.clearWatch(geoId);
      socket.off('locationUpdate');
    };
  }, [trackingUserId]);

  // Function to perform reverse geocoding
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();

      if (data && data.display_name) {
        setPlaceNameTrack(data.display_name); // Set the detailed address Track
        return data.display_name;
      } else {
        setPlaceNameTrack('Location not found');
        return "Location not found";
      }
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
    }
  };

  console.log("Final destination: ", trackedUserLocation, "\n", "Initial destination: ", location, "\n", "Where i am: ", { lat: 31.2678133, lng: 75.7004373 });
  console.log(placeNameFinal, placeNameInitial, placeNameTrack);

  return (
    <div>
      {/* 31.2678133,75.7004373 */}
      <h1>Location Tracker</h1>
      {
        location && (
          <MapContainer
            center={{ lat: 31.2678133, lng: 75.7004373 }}
            zoom={13}
            style={{ height: '100vh', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/en-us/arcgis/about-arcgis/overview">Esri</a>'
            />
            {/* Real-time Moving Marker for the Current User */}
            {
              location && placeNameTrack && <MovingMarker location={location} startPoint={{ lat: 31.2678133, lng: 75.7004373 }} placeNameTrack={placeNameTrack} />
            }
            {/* Current User's Location */}
            <Marker position={initialDestination}>
              <Popup>{placeNameInitial && placeNameInitial}</Popup>
            </Marker>
            {/* Tracked User's Location */}
            {trackedUserLocation && (
              <>
                <Marker position={finalDestination}>
                  <Popup>{placeNameFinal && placeNameFinal}</Popup>
                </Marker>
                {/* asdfghjkl */}
                <Routing start={initialDestination} end={finalDestination} />
              </>
            )}
          </MapContainer>
        )
      }
    </div>
  );
}

// Component for Moving Marker with Distance-Based Line
// Component for Moving Marker with Continuous Path Line
// Component for Moving Marker with Path Line
function MovingMarker({ location, startPoint, placeNameTrack }) {
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const map = useMap();
  const [path, setPath] = useState([]);

  useEffect(() => {
    if (!location) return;

    // Initialize or update the marker
    if (!markerRef.current) {
      markerRef.current = L.marker([location.lat, location.lng], { icon: carIcon }).addTo(map).bindPopup(placeNameTrack);
    } else {
      markerRef.current.setLatLng([location.lat, location.lng]);
      map.setView([location.lat, location.lng], map.getZoom()); // Center the map on the marker
    }

    // Update the path and polyline
    setPath((prevPath) => {
      const newPath = [startPoint, ...prevPath, [location.lat, location.lng]];

      if (!polylineRef.current) {
        // Create a new polyline with blue color
        polylineRef.current = L.polyline(newPath, {
          color: 'blue',
          weight: 5
        }).addTo(map);
      } else {
        // Update the existing polyline
        polylineRef.current.setLatLngs(newPath);
      }

      return newPath;
    });

  }, [location, map, startPoint]);

  return null; // This component does not render anything directly
}

// Component to handle route drawing
function Routing({ start, end }) {
  const map = useMap();

  useEffect(() => {
    if (!start || !end) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
      routeWhileDragging: false,
      lineOptions: {
        styles: [{ color: 'red', weight: 5 }] // Set color and weight for the route line
      },
      createMarker: () => null // Disable default markers at waypoints
    }).addTo(map);

    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl); // Properly remove the routing control
      }
    };
  }, [map, start, end]);

  return null;
}

export default App;

// .on('routesfound', function (e) {
//   const routeCoordinates = e.routes[0].coordinates.map(coord => ({
//     lat: coord.lat,
//     lng: coord.lng,
//   }));
//   setRoute(routeCoordinates); // Save the calculated route for the moving marker
// })
