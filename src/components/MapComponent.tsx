'use client';

import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
    center: [number, number];
    zoom: number;
    markers?: Array<{
        position: [number, number];
        popup?: string;
    }>;
}

const MapComponent = ({ center, zoom, markers = [] }: MapComponentProps) => {
    const [map, setMap] = useState<L.Map | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        const mapInstance = L.map(mapRef.current).setView(center, zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance);

        setMap(mapInstance);

        return () => {
            mapInstance.remove();
        };
    }, [center, zoom]);

    useEffect(() => {
        if (!map) return;

        // Clear existing markers
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Add new markers
        markers.forEach((marker) => {
            const markerInstance = L.marker(marker.position).addTo(map);
            if (marker.popup) {
                markerInstance.bindPopup(marker.popup);
            }
        });
    }, [map, markers]);

    return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
};

export default MapComponent; 