import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const socket = io('http://localhost:5000');

const Map = () => {
    const [position, setPosition] = useState(null);


    useEffect(() => {
        socket.on('locationUpdate', (data) => {
            setPosition([data.latitude, data.longitude]);
        });

        return () => {
            socket.off('locationUpdate');
        };
    }, []);
    console.log(position)

    return (
        <>
            {
                position && (
                    <MapContainer center={position} zoom={16} style={{ height: '100vh', width: '100%' }}>
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution='&copy; <a href="https://www.esri.com/en-us/arcgis/about-arcgis/overview">Esri</a>'
                        />

                        {position && (
                            <Marker position={position}>
                                <Popup>Latitude: {position[0]}, Longitude: {position[1]}</Popup>
                            </Marker>
                        )}
                    </MapContainer>
                )
            }
        </>
    );
};

export default Map;
