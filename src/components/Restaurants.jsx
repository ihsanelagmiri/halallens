import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export default function Restaurants() {
  const { t } = useTranslation();
  const [locationStatus, setLocationStatus] = useState('pending');
  const [restaurants, setRestaurants] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [geoErrorMsg, setGeoErrorMsg] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchKakaoData = async (coords, pageNum) => {
    setIsLoading(true);
    const apiKey = import.meta.env.VITE_KAKAO_REST_API_KEY;
    if (!apiKey || apiKey === 'your_key_here') {
      alert("Kakao REST API Key is missing. Please add it to the .env file.");
      setIsLoading(false);
      setLocationStatus('error');
      return;
    }

    const keywords = [
      "할랄", "halal", "halal food", "무슬림 친화", "Muslim Friendly", "halal restaurant",
      "터키 음식점", "Turkish restaurant", "우즈베크 음식점", "Uzbek restaurant",
      "파키스탄 음식점", "Pakistani restaurant", "방글라데시 음식점", "Bangladeshi restaurant",
      "아랍 음식점", "Arab restaurant", "중동 음식점", "Middle Eastern restaurant",
      "인도 음식점", "Indian restaurant", "네팔 음식점", "Nepali restaurant",
      "아프간 음식점", "Afghan restaurant", "이슬람 음식점", "Muslim restaurant", "Muslim food"
    ];
    const radius = 20000; // 20km

    try {
      let combinedPlaces = [];
      let anyHasMore = false;

      // Process in chunks of 5 to avoid Kakao rate limits
      for (let i = 0; i < keywords.length; i += 5) {
        const chunk = keywords.slice(i, i + 5);
        const requests = chunk.map(kw => 
          fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(kw)}&x=${coords.lng}&y=${coords.lat}&radius=${radius}&page=${pageNum}&sort=distance`, {
            headers: { Authorization: `KakaoAK ${apiKey}` }
          }).then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          })
        );
        
        const results = await Promise.allSettled(requests);
        for (const result of results) {
          if (result.status === 'fulfilled') {
            const data = result.value;
            if (data.documents) {
              combinedPlaces = [...combinedPlaces, ...data.documents];
            }
            if (data.meta && !data.meta.is_end) {
              anyHasMore = true;
            }
          } else {
            console.error("Kakao fetch failed:", result.reason);
            if (result.reason.message) {
              if (result.reason.message.includes('401')) throw new Error("Unauthorized: Invalid API Key");
              if (result.reason.message.includes('403')) throw new Error("Forbidden: Kakao Local API Service is disabled in your console");
            }
          }
        }
      }

      // Deduplicate by ID
      const uniquePlacesMap = new Map();
      combinedPlaces.forEach(place => {
        if (!uniquePlacesMap.has(place.id)) {
          uniquePlacesMap.set(place.id, {
            ...place,
            // Kakao distance is in meters, convert to km
            distanceKm: (parseInt(place.distance, 10) / 1000).toFixed(1)
          });
        } else {
          // If duplicate exists, keep the one with shorter distance (edge case)
          const existing = uniquePlacesMap.get(place.id);
          if (parseInt(place.distance, 10) < parseInt(existing.distance, 10)) {
            uniquePlacesMap.set(place.id, {
              ...place,
              distanceKm: (parseInt(place.distance, 10) / 1000).toFixed(1)
            });
          }
        }
      });

      let uniquePlaces = Array.from(uniquePlacesMap.values());

      // Sort by distance locally
      uniquePlaces.sort((a, b) => parseFloat(a.distanceKm) - parseFloat(b.distanceKm));

      setRestaurants(prev => {
        if (pageNum === 1) return uniquePlaces;
        
        // Merge with existing and deduplicate
        const allMap = new Map();
        [...prev, ...uniquePlaces].forEach(p => allMap.set(p.id, p));
        return Array.from(allMap.values()).sort((a, b) => parseFloat(a.distanceKm) - parseFloat(b.distanceKm));
      });

      setHasMore(anyHasMore);
      setLocationStatus('success');
    } catch (err) {
      console.error("Kakao API Error:", err);
      setLocationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const locateUser = () => {
    console.log('[Restaurants] Retry button clicked — locateUser() called');
    setGeoErrorMsg('');
    setIsRetrying(true);
    setLocationStatus('locating');

    if (!navigator.geolocation) {
      console.error('[Restaurants] navigator.geolocation is NOT supported');
      setGeoErrorMsg(t('restaurants.geoNotSupported', 'Geolocation is not supported by your browser.'));
      setLocationStatus('error');
      setIsRetrying(false);
      return;
    }

    console.log('[Restaurants] Requesting geolocation via getCurrentPosition()...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('[Restaurants] Geolocation SUCCESS:', position.coords.latitude, position.coords.longitude);
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserCoords(coords);
        setPage(1);
        setIsRetrying(false);
        fetchKakaoData(coords, 1);
      },
      (err) => {
        console.error('[Restaurants] Geolocation ERROR:', err.code, err.message);
        let userMsg = '';
        switch (err.code) {
          case 1: // PERMISSION_DENIED
            userMsg = t('restaurants.geoDenied', 'Location permission denied. Please enable location access in your browser/device settings and try again.');
            break;
          case 2: // POSITION_UNAVAILABLE
            userMsg = t('restaurants.geoUnavailable', 'Location information is unavailable. Please check your GPS/network settings.');
            break;
          case 3: // TIMEOUT
            userMsg = t('restaurants.geoTimeout', 'Location request timed out. Please try again.');
            break;
          default:
            userMsg = `${t('restaurants.geoUnknown', 'Unknown location error')}: ${err.message}`;
        }
        setGeoErrorMsg(userMsg);
        setLocationStatus('error');
        setIsRetrying(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  };

  useEffect(() => {
    locateUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = () => {
    if (userCoords && !isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchKakaoData(userCoords, nextPage);
    }
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
          <p style={{ color: '#ff6b6b' }}>{t('restaurants.error', 'Unable to detect location or fetch data. Please check permissions and API key.')}</p>
          {geoErrorMsg && (
            <p style={{ color: '#ffaa6b', fontSize: '0.85rem', marginTop: '10px', lineHeight: '1.5' }}>
              {geoErrorMsg}
            </p>
          )}
          <button
            className="btn btn-primary"
            onClick={locateUser}
            disabled={isRetrying}
            style={{ marginTop: '15px', opacity: isRetrying ? 0.6 : 1, cursor: isRetrying ? 'wait' : 'pointer' }}
          >
            {isRetrying ? t('restaurants.retrying', 'Retrying...') : t('restaurants.retry', 'Retry')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {restaurants.length === 0 && !isLoading ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p>No halal or Muslim-friendly restaurants found within 20km.</p>
            </div>
          ) : (
            restaurants.map(restaurant => (
              <div key={restaurant.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <h3 style={{ margin: '0 0 5px 0' }}>{restaurant.place_name}</h3>
                  <p style={{ margin: '0 0 5px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {restaurant.road_address_name || restaurant.address_name}
                  </p>
                  {restaurant.phone && (
                    <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem' }}>📞 {restaurant.phone}</p>
                  )}
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: '#888' }}>{restaurant.category_name}</p>
                  <p style={{ margin: '0', fontWeight: 'bold', color: 'var(--primary-color)' }}>{restaurant.distanceKm} km {t('restaurants.away', 'away')}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" onClick={() => window.open(restaurant.place_url, '_blank')}>
                    Kakao Map
                  </button>
                  <button className="btn btn-outline" onClick={() => window.open(`https://map.kakao.com/link/to/${restaurant.id}`, '_blank')}>
                    {t('restaurants.directions', 'Directions')}
                  </button>
                </div>
              </div>
            ))
          )}

          {hasMore && (
            <button 
              className="btn btn-primary" 
              onClick={loadMore} 
              disabled={isLoading}
              style={{ padding: '15px', marginTop: '10px', width: '100%' }}
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
