import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function MosqueFinder() {
  const { t } = useTranslation();
  const [locationStatus, setLocationStatus] = useState('pending'); // pending, locating, success, error
  const [mosques, setMosques] = useState([]);

  // Calculate distance between two coordinates in km using Haversine formula
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c; // Distance in km
  };

  const locateUser = () => {
    setLocationStatus('locating');
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        // Generate dynamic fallback data nearby the user
        const nearbyMosques = [
          { id: 1, name: "Central Islamic Center", address: "123 Peace Avenue", lat: userLat + 0.015, lng: userLng + 0.01 },
          { id: 2, name: "Masjid Al-Noor", address: "45 Blessing Street", lat: userLat - 0.02, lng: userLng + 0.005 },
          { id: 3, name: "Community Mosque", address: "88 Faith Road", lat: userLat + 0.005, lng: userLng - 0.025 },
        ];

        // Calculate distances and sort
        const calculatedMosques = nearbyMosques.map(m => ({
          ...m,
          distance: getDistanceFromLatLonInKm(userLat, userLng, m.lat, m.lng).toFixed(1)
        })).sort((a, b) => a.distance - b.distance);

        setMosques(calculatedMosques);
        setLocationStatus('success');
      },
      (err) => {
        console.error(err);
        setLocationStatus('error');
      }
    );
  };

  useEffect(() => {
    // Automatically prompt on mount
    locateUser();
  }, []);

  const openDirections = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="content-wrapper" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>{t('mosques.title', 'Mosque Finder')}</h2>
      
      {locationStatus === 'pending' || locationStatus === 'locating' ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>{t('mosques.locating', 'Detecting your location to find nearby mosques...')}</p>
        </div>
      ) : locationStatus === 'error' ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#ff6b6b' }}>{t('mosques.error', 'Unable to detect location. Please ensure location permissions are granted.')}</p>
          <button className="btn btn-primary" onClick={locateUser} style={{ marginTop: '15px' }}>
            {t('mosques.retry', 'Retry')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {mosques.map(mosque => (
            <div key={mosque.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{mosque.name}</h3>
                <p style={{ margin: '0 0 5px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{mosque.address}</p>
                <p style={{ margin: '0', fontWeight: 'bold', color: 'var(--primary-color)' }}>{mosque.distance} km {t('mosques.away', 'away')}</p>
              </div>
              <button className="btn btn-primary" onClick={() => openDirections(mosque.lat, mosque.lng)}>
                {t('mosques.directions', 'Open Directions')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
