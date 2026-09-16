import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass } from 'lucide-react';

// Custom SVG HTML div icons matching SafeCircle's rose and emerald theme
const createCustomPinIcon = (type = 'start') => {
  const isStart = type === 'start';
  const bgColor = isStart ? '#e11d48' : '#059669'; // Rose for Start, Emerald for Destination
  const label = isStart ? 'ORIGIN' : 'DEST';

  const html = `
    <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
      <div style="
        background: ${bgColor};
        color: white;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.5px;
        padding: 3px 7px;
        border-radius: 9999px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        border: 2px solid white;
        white-space: nowrap;
        font-family: sans-serif;
      ">
        ${label}
      </div>
      <div style="
        width: 10px;
        height: 10px;
        background: ${bgColor};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        margin-top: -2px;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'safepath-custom-pin',
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

// Component to adjust map view bounds to encompass the route
const MapBoundsFitter = ({ waypoints }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !waypoints || waypoints.length === 0) return;
    try {
      const bounds = L.latLngBounds(waypoints);
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
    } catch (e) {
      console.warn('Could not fit map bounds:', e);
    }
  }, [map, waypoints]);

  return null;
};

const SafePathMap = ({
  startLocation,
  destination,
  routes = [],
  selectedRouteId,
  onSelectRoute
}) => {
  // Validate coordinates
  const hasStartCoords = startLocation?.latitude && startLocation?.longitude;
  const hasDestCoords = destination?.latitude && destination?.longitude;

  if (!hasStartCoords || !hasDestCoords) {
    return (
      <div className="h-[380px] w-full rounded-2xl bg-stone-50 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 border border-rose-100">
          <Compass className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-stone-800 mb-1">
          Map Coordinates Unavailable
        </h4>
        <p className="text-xs text-stone-500 max-w-sm mb-2">
          Geocoding coordinates were not provided for <strong>{startLocation?.name || 'Origin'}</strong> or <strong>{destination?.name || 'Destination'}</strong>.
        </p>
        <p className="text-[11px] text-stone-400">
          SafePath route options can still be reviewed and selected using the route cards below.
        </p>
      </div>
    );
  }

  const startPos = [startLocation.latitude, startLocation.longitude];
  const destPos = [destination.latitude, destination.longitude];

  // Collect all points to calculate global bounds
  const allWaypoints = [startPos, destPos];
  routes.forEach(r => {
    if (r.waypoints && Array.isArray(r.waypoints)) {
      allWaypoints.push(...r.waypoints);
    }
  });

  const centerLat = (startLocation.latitude + destination.latitude) / 2;
  const centerLng = (startLocation.longitude + destination.longitude) / 2;

  return (
    <div className="relative h-[420px] w-full rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs z-0">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ background: '#f6f4f2' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsFitter waypoints={allWaypoints} />

        {/* Start Marker */}
        <Marker position={startPos} icon={createCustomPinIcon('start')}>
          <Popup>
            <div className="p-1 text-xs">
              <strong className="text-rose-600 block uppercase tracking-wider font-bold">
                Origin
              </strong>
              <div className="font-semibold text-stone-800">{startLocation.name}</div>
              <div className="text-[10px] text-stone-400">
                {startLocation.latitude.toFixed(4)}, {startLocation.longitude.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker position={destPos} icon={createCustomPinIcon('dest')}>
          <Popup>
            <div className="p-1 text-xs">
              <strong className="text-emerald-600 block uppercase tracking-wider font-bold">
                Destination
              </strong>
              <div className="font-semibold text-stone-800">{destination.name}</div>
              <div className="text-[10px] text-stone-400">
                {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Polylines for each route alternative */}
        {routes.map((route) => {
          const isSelected = route.id === selectedRouteId;
          const isSafePath = route.routeType === 'SAFEPATH';

          // Color palette: Selected = Rose, Unselected SafePath = Light Rose / Salmon, Unselected Shortest = Stone Gray
          const color = isSelected
            ? '#e11d48'
            : isSafePath
              ? '#fda4af'
              : '#a8a29e';

          const weight = isSelected ? 6 : 4;
          const opacity = isSelected ? 0.95 : 0.65;
          const dashArray = isSelected ? undefined : '5, 8';

          return (
            <Polyline
              key={route.id}
              positions={route.waypoints}
              pathOptions={{
                color,
                weight,
                opacity,
                dashArray,
                lineCap: 'round',
                lineJoin: 'round'
              }}
              eventHandlers={{
                click: () => onSelectRoute && onSelectRoute(route.id)
              }}
            >
              <Popup>
                <div className="p-1 text-xs space-y-1">
                  <div className="font-bold text-stone-900">{route.name}</div>
                  <div className="text-[11px] text-stone-500">
                    {route.estimatedDuration} · {route.distance}
                  </div>
                  <div className="text-[10px] font-semibold text-rose-600">
                    {route.contextualEstimate}
                  </div>
                  <button
                    onClick={() => onSelectRoute && onSelectRoute(route.id)}
                    className="mt-1.5 w-full py-1 px-2 rounded-lg bg-rose-600 text-white text-[10px] font-bold cursor-pointer hover:bg-rose-700 transition-colors"
                  >
                    {isSelected ? '✓ Currently Selected' : 'Select This Route'}
                  </button>
                </div>
              </Popup>
            </Polyline>
          );
        })}
      </MapContainer>

      {/* Floating Map Legend */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl border border-stone-200/80 shadow-xs text-[11px] space-y-1">
        <div className="font-bold text-stone-800 text-[10px] uppercase tracking-wider mb-1">
          Route Map
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 rounded-full bg-rose-600 inline-block" />
          <span className="text-stone-700 font-medium">Selected Route</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 rounded-full bg-stone-400 inline-block border-t border-dashed" />
          <span className="text-stone-500">Alternative Options</span>
        </div>
      </div>
    </div>
  );
};

export default SafePathMap;
