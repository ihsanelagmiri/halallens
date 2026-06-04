import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Restaurants() {
  const { t } = useTranslation();
  const [locationStatus, setLocationStatus] = useState('pending');
  const [restaurants, setRestaurants] = useState([]);

  // Calculate distance between two coordinates in km using Haversine formula
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c;
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
        const nearbyRestaurants = [
          { id: 1, name: "Halal Grill House", address: "321 Spice Lane", lat: userLat - 0.012, lng: userLng + 0.015 },
          { id: 2, name: "Crescent Kitchen", address: "99 Savory Blvd", lat: userLat + 0.022, lng: userLng - 0.008 },
          { id: 3, name: "Medina Cafe & Restaurant", address: "44 Oasis Street", lat: userLat + 0.008, lng: userLng + 0.025 },
        ];

        // Calculate distances and sort
        const calculatedRestaurants = nearbyRestaurants.map(r => ({
          ...r,
          distance: getDistanceFromLatLonInKm(userLat, userLng, r.lat, r.lng).toFixed(1)
        })).sort((a, b) => a.distance - b.distance);

        setRestaurants(calculatedRestaurants);
        setLocationStatus('success');
      },
      (err) => {
        console.error(err);
        setLocationStatus('error');
      }
    );
  };

  useEffect(() => {
    locateUser();
  }, []);

  const openDirections = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="content-wrapper" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>{t('restaurants.title', 'Halal Restaurants')}</h2>
      
      {locationStatus === 'pending' || locationStatus === 'locating' ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>{t('restaurants.locating', 'Detecting your location to find nearby restaurants...')}</p>
        </div>
      ) : locationStatus === 'error' ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#ff6b6b' }}>{t('restaurants.error', 'Unable to detect location. Please ensure location permissions are granted.')}</p>
          <button className="btn btn-primary" onClick={locateUser} style={{ marginTop: '15px' }}>
            {t('restaurants.retry', 'Retry')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {restaurants.map(restaurant => (
            <div key={restaurant.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{restaurant.name}</h3>
                <p style={{ margin: '0 0 5px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{restaurant.address}</p>
                <p style={{ margin: '0', fontWeight: 'bold', color: 'var(--primary-color)' }}>{restaurant.distance} km {t('restaurants.away', 'away')}</p>
              </div>
              <button className="btn btn-primary" onClick={() => openDirections(restaurant.lat, restaurant.lng)}>
                {t('restaurants.directions', 'Open Directions')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
