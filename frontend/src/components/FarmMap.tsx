"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ImageOverlay, useMap, Rectangle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Next.js
const icon = L.icon({
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Helper to auto-fit bounds
function BoundsFitter({ bounds }: { bounds: L.LatLngBoundsExpression }) {
    const map = useMap();
    useEffect(() => {
        if (bounds) map.fitBounds(bounds);
    }, [map, bounds]);
    return null;
}

interface FarmMapProps {
    farms: any[];
    activeLayer: string; // 'ndvi', 'rgb', etc.
}

const FarmMap: React.FC<FarmMapProps> = ({ farms, activeLayer }) => {
    // Default to New Delhi if no farms
    const center: [number, number] = [28.6139, 77.2090];
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Client-side only fix
        setMounted(true);
        // Fix leaflet icon issue programmatically if needed
        // (This is a common hack but using custom icon above is cleaner)
        (async function init() {
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });
        })();
    }, []);

    if (!mounted) return <div className="h-full w-full bg-muted animate-pulse rounded-3xl" />;

    return (
        <MapContainer
            center={center}
            zoom={13}
            className="w-full h-full rounded-3xl z-0"
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Satellite Layer option (Esri World Imagery) - usually looks better for agriculture */}
            {/* <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
      /> */}

            {farms.map((farm) => {
                const lat = farm.location?.lat || center[0];
                const lng = farm.location?.lng || center[1];
                const lastAnalysis = farm.analysisHistory?.[farm.analysisHistory.length - 1];

                return (
                    <React.Fragment key={farm._id}>
                        <Marker position={[lat, lng]}>
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-bold">{farm.name}</h3>
                                    <p className="text-sm">{farm.cropType} - {farm.size} Acres</p>
                                    {lastAnalysis && (
                                        <div className="mt-2 text-xs">
                                            <p>Last Analysis: {new Date(lastAnalysis.date).toLocaleDateString()}</p>
                                            <p>Health: <span className={lastAnalysis.healthStatus.includes('Critical') ? 'text-red-500 font-bold' : 'text-green-500'}>{lastAnalysis.healthStatus}</span></p>
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>

                        {/* If there is an image URL in the last analysis and it's valid, overlay it */}
                        {lastAnalysis?.imageUrl && activeLayer !== 'rgb' && (
                            <>
                                <ImageOverlay
                                    url={lastAnalysis.imageUrl}
                                    bounds={[
                                        [lat - 0.002, lng - 0.002],
                                        [lat + 0.002, lng + 0.002]
                                    ]}
                                    className={(activeLayer === 'ndvi' || activeLayer === 'pest') ? 'opacity-90 mix-blend-multiply' : ''}
                                />

                                {/* Render Detections (Bounding Boxes) */}
                                {lastAnalysis.detections && lastAnalysis.detections.map((det: any, i: number) => {
                                    // Parse resolution if available to normalize box
                                    let imgW = 640;
                                    let imgH = 640;
                                    if (lastAnalysis.metadata?.resolution) {
                                        const [w, h] = lastAnalysis.metadata.resolution.split('x').map(Number);
                                        imgW = w || 640;
                                        imgH = h || 640;
                                    }

                                    const [x1, y1, x2, y2] = det.box;

                                    // Interpolate to LatLng bounds
                                    // TopLat = lat + 0.002, BottomLat = lat - 0.002
                                    // LeftLng = lng - 0.002, RightLng = lng + 0.002
                                    const latRange = 0.004;
                                    const lngRange = 0.004;
                                    const topLat = lat + 0.002;
                                    const leftLng = lng - 0.002;

                                    // y is from top (0) to bottom (H)
                                    // lat is from top (higher) to bottom (lower)
                                    const boxTop = topLat - (y1 / imgH) * latRange;
                                    const boxBottom = topLat - (y2 / imgH) * latRange;
                                    const boxLeft = leftLng + (x1 / imgW) * lngRange;
                                    const boxRight = leftLng + (x2 / imgW) * lngRange;

                                    // Determine color based on label/severity
                                    const color = det.severity === 'High' ? 'red' : 'orange';

                                    return (
                                        <Rectangle
                                            key={i}
                                            bounds={[[boxTop, boxLeft], [boxBottom, boxRight]]}
                                            pathOptions={{ color, fillOpacity: 0.1, weight: 1 }}
                                        >
                                            <Popup>
                                                <div className="text-xs">
                                                    <p className="font-bold">{det.label}</p>
                                                    <p>{(det.confidence * 100).toFixed(1)}%</p>
                                                </div>
                                            </Popup>
                                        </Rectangle>
                                    );
                                })}
                            </>
                        )}
                    </React.Fragment>
                );
            })}
        </MapContainer>
    );
};

export default FarmMap;
