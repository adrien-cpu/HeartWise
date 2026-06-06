'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

interface MapProps {
    center: [number, number];
    zoom: number;
    markers?: Array<{
        position: [number, number];
        popup?: string;
    }>;
}

// Import Leaflet components dynamically to avoid SSR issues
const MapWithNoSSR = dynamic<MapProps>(() => import('./MapComponent'), {
    ssr: false,
    loading: () => <div style={{ height: '100%', width: '100%', backgroundColor: '#f0f0f0' }} />
}) as React.ComponentType<MapProps>;

export default function Map(props: MapProps) {
    return <MapWithNoSSR {...props} />;
} 