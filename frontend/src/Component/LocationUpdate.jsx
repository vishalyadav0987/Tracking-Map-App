import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const LocationUpdater = () => {
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition((position) => {
                console.log(position);

                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);

                socket.emit('updateLocation', {
                    userId: 'user1', // Replace with actual user ID
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            });
            navigator.geolocation.getCurrentPosition((pos) => {
                console.log(pos);

            }, (err) => {
                console.log(err)
            })
        }
    }, []);

    return (
        <div>
            <p>Latitude: {latitude}</p>
            <p>Longitude: {longitude}</p>
        </div>
    );
};

export default LocationUpdater;
