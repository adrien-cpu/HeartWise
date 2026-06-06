import { FC } from 'react';

interface MapComponentProps {
    center: [number, number];
    zoom: number;
    markers?: Array<{
        position: [number, number];
        popup?: string;
    }>;
}

declare const MapComponent: FC<MapComponentProps>;
export default MapComponent; 