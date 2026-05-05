import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Map as MapIcon, Navigation, Phone, Calendar, Hospital, Pill, Search, Crosshair, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

// Fix Leaflet marker icons by using CDN
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Place {
  id: number;
  name: string;
  type: 'hospital' | 'pharmacy' | 'clinic';
  lat: number;
  lng: number;
  address: string;
  phone: string;
}

// Mock data for health facilities in Almaty/Astana (user's context)
const MOCK_PLACES: Place[] = [
  { id: 1, name: 'Центральная городская больница', type: 'hospital', lat: 43.2389, lng: 76.9455, address: 'ул. Панфилова 13', phone: '+7 (727) 123-4567' },
  { id: 2, name: 'Аптека "Биосфера"', type: 'pharmacy', lat: 43.2500, lng: 76.9400, address: 'пр. Абая 45', phone: '+7 (727) 987-6543' },
  { id: 3, name: 'Клиника "МедСервис"', type: 'clinic', lat: 43.2450, lng: 76.9550, address: 'ул. Сатпаева 12', phone: '+7 (727) 444-5566' },
  { id: 4, name: 'Городская поликлиника №5', type: 'hospital', lat: 43.2300, lng: 76.9300, address: 'ул. Розыбакиева 80', phone: '+7 (727) 222-3311' },
  { id: 5, name: 'Аптека "Europharm"', type: 'pharmacy', lat: 43.2600, lng: 76.9200, address: 'пр. Достык 10', phone: '+7 (727) 555-7788' },
];

function RecenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 14);
  }, [coords, map]);
  return null;
}

export default function HealthMap() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'hospital' | 'pharmacy' | 'clinic'>('all');
  const [userLocation, setUserLocation] = useState<[number, number]>([43.2389, 76.9455]); // Default Almaty
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const filteredPlaces = MOCK_PLACES.filter(p => filter === 'all' || p.type === filter);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  };

  return (
    <div className="flex flex-col gap-6 h-full min-h-[500px]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">{t.nav.map}</h1>
          <p className="text-slate-500 font-medium">Ближайшие медицинские учреждения рядом с вами</p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-x-auto w-full lg:w-auto scrollbar-hide">
          {(['all', 'hospital', 'clinic', 'pharmacy'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0",
                filter === type 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              )}
            >
              {type === 'all' ? 'Все' : type === 'hospital' ? 'Больницы' : type === 'clinic' ? 'Клиники' : 'Аптеки'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[500px] lg:h-[calc(100vh-280px)]">
        {/* Map Container */}
        <div className="flex-1 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl relative order-1 lg:order-1">
          <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%' }} {...({} as any)}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              {...({} as any)}
            />
            <RecenterMap coords={userLocation} />
            
            {filteredPlaces.map(place => (
              <Marker key={place.id} position={[place.lat, place.lng]} {...({} as any)} eventHandlers={{ click: () => setSelectedPlace(place) }}>
                <Popup className="custom-popup" {...({} as any)}>
                  <div className="p-3 min-w-[220px]">
                    <div className="flex items-center gap-2 mb-2">
                      {place.type === 'hospital' ? <Hospital size={16} className="text-red-500" /> : <Pill size={16} className="text-blue-500" />}
                      <h4 className="font-bold text-sm m-0">{place.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">{place.address}</p>
                    <div className="flex flex-col gap-1.5">
                      <a href={`tel:${place.phone}`} className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <Phone size={14} /> {place.phone}
                      </a>
                      <button 
                        onClick={() => navigate('/booking')}
                        className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider text-white bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none"
                      >
                        <Calendar size={14} /> Записаться
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            <Marker position={userLocation} icon={L.divIcon({
              className: 'user-marker',
              html: '<div class="w-5 h-5 bg-blue-500 rounded-full border-4 border-white shadow-xl animate-pulse"></div>'
            })} />
          </MapContainer>

          <button 
            onClick={handleLocate}
            className="absolute bottom-6 right-6 z-[1000] p-4 bg-white dark:bg-slate-900 text-blue-600 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 hover:scale-110 active:scale-95 transition-all"
          >
            {isLoading ? <Activity className="animate-spin text-blue-600" /> : <Crosshair size={24} />}
          </button>
        </div>

        {/* Sidebar List */}
        <div className="w-full lg:w-80 flex flex-col gap-4 order-2 lg:order-2 overflow-y-auto pr-2 scrollbar-hide">
          <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest px-2">Список организаций</h3>
          <div className="space-y-3">
            {filteredPlaces.map(place => (
              <motion.div
                key={place.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setUserLocation([place.lat, place.lng])}
                className={cn(
                  "p-4 bg-white dark:bg-slate-900 rounded-3xl border cursor-pointer transition-all shadow-sm",
                  selectedPlace?.id === place.id 
                    ? "border-blue-600 ring-2 ring-blue-100 dark:ring-blue-900/20" 
                    : "border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    place.type === 'hospital' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                  )}>
                    {place.type === 'hospital' ? <Hospital size={16} /> : <Pill size={16} />}
                  </div>
                  <h4 className="font-bold text-sm leading-tight">{place.name}</h4>
                </div>
                <p className="text-[11px] text-slate-500 mb-2 truncate">{place.address}</p>
                <div className="flex gap-2">
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold text-slate-500">
                    {place.type === 'hospital' ? 'Больница' : place.type === 'clinic' ? 'Клиника' : 'Аптека'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
