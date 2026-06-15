import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export default function MosqueFinder() {
  const { t } = useTranslation();
  const [locationStatus, setLocationStatus] = useState('pending'); // pending, locating, success, error
  const [mosques, setMosques] = useState([]);
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
      "이슬람 사원", "모스크", "무살라", "기도실", "이슬람 센터", 
      "masjid", "mosque", "musalla", "prayer room", "Islamic center"
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

      setMosques(prev => {
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
    console.log('[MosqueFinder] Retry button clicked — locateUser() called');
    setGeoErrorMsg('');
    setIsRetrying(true);
    setLocationStatus('locating');

    if (!navigator.geolocation) {
      console.error('[MosqueFinder] navigator.geolocation is NOT supported');
      setGeoErrorMsg(t('mosques.geoNotSupported', 'Geolocation is not supported by your browser.'));
      setLocationStatus('error');
      setIsRetrying(false);
      return;
    }

    console.log('[MosqueFinder] Requesting geolocation via getCurrentPosition()...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('[MosqueFinder] Geolocation SUCCESS:', position.coords.latitude, position.coords.longitude);
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
        console.error('[MosqueFinder] Geolocation ERROR:', err.code, err.message);
        let userMsg = '';
        switch (err.code) {
          case 1: // PERMISSION_DENIED
            userMsg = t('mosques.geoDenied', 'Location permission denied. Please enable location access in your browser/device settings and try again.');
            break;
          case 2: // POSITION_UNAVAILABLE
            userMsg = t('mosques.geoUnavailable', 'Location information is unavailable. Please check your GPS/network settings.');
            break;
          case 3: // TIMEOUT
            userMsg = t('mosques.geoTimeout', 'Location request timed out. Please try again.');
            break;
          default:
            userMsg = `${t('mosques.geoUnknown', 'Unknown location error')}: ${err.message}`;
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
      <h2 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>{t('mosques.title', 'Mosque Finder')}</h2>
      
      {locationStatus === 'pending' || locationStatus === 'locating' ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>{t('mosques.locating', 'Detecting your location to find nearby mosques...')}</p>
        </div>
      ) : locationStatus === 'error' ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#ff6b6b' }}>{t('mosques.error', 'Unable to detect location or fetch data. Please check permissions and API key.')}</p>
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
            {isRetrying ? t('mosques.retrying', 'Retrying...') : t('mosques.retry', 'Retry')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {mosques.length === 0 && !isLoading ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p>No mosques or Islamic centers found within 20km.</p>
            </div>
          ) : (
            mosques.map(mosque => (
              <div key={mosque.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <h3 style={{ margin: '0 0 5px 0' }}>{mosque.place_name}</h3>
                  <p style={{ margin: '0 0 5px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {mosque.road_address_name || mosque.address_name}
                  </p>
                  {mosque.phone && (
                    <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem' }}>📞 {mosque.phone}</p>
                  )}
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: '#888' }}>{mosque.category_name}</p>
                  <p style={{ margin: '0', fontWeight: 'bold', color: 'var(--primary-color)' }}>{mosque.distanceKm} km {t('mosques.away', 'away')}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" onClick={() => window.open(mosque.place_url, '_blank')}>
                    Kakao Map
                  </button>
                  <button className="btn btn-outline" onClick={() => window.open(`https://map.kakao.com/link/to/${mosque.id}`, '_blank')}>
                    {t('mosques.directions', 'Directions')}
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
