import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface LocationMapProps {
    latitude: number;
    longitude: number;
    zoom?: number;
    height?: string;
}

const LocationMap = ({ latitude, longitude, zoom = 13, height = '400px' }: LocationMapProps) => {
    const [map, setMap] = useState<L.Map | null>(null);

    useEffect(() => {
        if (map) {
            map.setView([latitude, longitude], zoom);
        }
    }, [map, latitude, longitude, zoom]);

    return (
        <div style={{ height, width: '100%', position: 'relative' }}>
            <MapContainer
                center={[latitude, longitude]}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                whenCreated={setMap}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[latitude, longitude]}>
                    <Popup>
                        Position actuelle
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default LocationMap; 