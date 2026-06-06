'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correction pour les icônes Leaflet dans Next.js
const defaultIcon = L.icon({
    iconUrl: '/images/marker-icon.png',
    iconRetinaUrl: '/images/marker-icon-2x.png',
    shadowUrl: '/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapProps {
    center: [number, number];
    zoom?: number;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

export default function Map({ center, zoom = 13, style = { height: '400px', width: '100%' }, children }: MapProps) {
    useEffect(() => {
        // Correction pour les icônes Leaflet dans Next.js
        L.Marker.prototype.options.icon = defaultIcon;
    }, []);

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={style}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {children}
        </MapContainer>
    );
}

export { Marker, Popup }; 