import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GeographicData } from '@/types/dashboard';
import MapWrapper from './MapWrapper';

// Fix Leaflet default marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface GeographicMapProps {
  data: GeographicData;
  title?: string;
}

export default function GeographicMap({ data, title }: GeographicMapProps) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [MapContainer, setMapContainer] = useState<any>(null);
  const [TileLayer, setTileLayer] = useState<any>(null);
  const [GeoJSON, setGeoJSON] = useState<any>(null);
  const [Tooltip, setTooltip] = useState<any>(null);

  useEffect(() => {
    // Dynamically import Leaflet components to avoid SSR issues
    import('react-leaflet').then((mod) => {
      setMapContainer(() => mod.MapContainer);
      setTileLayer(() => mod.TileLayer);
      setGeoJSON(() => mod.GeoJSON);
      setTooltip(() => mod.Tooltip);
    });

    // Load GeoJSON file
    fetch('/Digos_City.geojson')
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.error('Error loading GeoJSON:', err));
  }, []);

  const getColor = (farmerCount: number) => {
    const maxCount = Math.max(...data.by_barangay.map((b) => b.farmer_count), 1);
    const intensity = farmerCount / maxCount;
    return `rgba(59, 130, 246, ${0.2 + intensity * 0.8})`;
  };

  const style = (feature: any) => {
    const barangayName = feature.properties.name || feature.properties.BRGY_NAME || '';
    const barangayData = data.by_barangay.find((b) => b.barangay === barangayName);
    const farmerCount = barangayData?.farmer_count || 0;

    return {
      fillColor: getColor(farmerCount),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const barangayName = feature.properties.name || feature.properties.BRGY_NAME || '';
    const barangayData = data.by_barangay.find((b) => b.barangay === barangayName);
    const farmerCount = barangayData?.farmer_count || 0;
    const totalArea = barangayData?.total_area || 0;

    if (layer.bindTooltip) {
      layer.bindTooltip(`
        <div class="font-semibold">${barangayName}</div>
        <div>Farmers: ${farmerCount}</div>
        <div>Total Area: ${totalArea.toFixed(2)} ha</div>
      `);
    }
  };

  if (!MapContainer || !TileLayer || !GeoJSON || !geoJsonData) {
    return (
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        {title && <h3 className="mb-4 font-semibold">{title}</h3>}
        <div className="flex h-96 items-center justify-center">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      {title && <h3 className="mb-4 font-semibold">{title}</h3>}
      <MapWrapper>
        <MapContainer center={[6.7383, 125.3478]} zoom={12} style={{ height: '500px', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON data={geoJsonData} style={style} onEachFeature={onEachFeature} />
          
        </MapContainer>
       
      </MapWrapper>
    <div className="mt-4 flex items-center gap-2 text-sm">
        <span className="font-semibold">Legend:</span>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}></div>
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.6)' }}></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4" style={{ backgroundColor: 'rgba(59, 130, 246, 1)' }}></div>
          <span>High</span>
        </div>
      </div>
    </div>
     
  );
}
