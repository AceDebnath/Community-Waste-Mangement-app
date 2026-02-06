import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, Plus, MapPin, Trash2, Navigation, X, RefreshCw, Battery, Wifi, WifiOff } from 'lucide-react';
import { getBins, getReports, getCurrentLocation } from '../utils/localData';

interface MapScreenProps {
  onNavigate: (screen: string) => void;
}

type MarkerType = 'empty' | 'full' | 'reported';

interface MapMarker {
  id: string;
  type: MarkerType;
  location: string;
  coordinates?: { lat: number; lng: number };
  x: number;
  y: number;
  lastUpdated?: string;
  reportedBy?: string;
  fillLevel?: number;
  batteryLevel?: number;
  sensorStatus?: string;
  capacity?: number;
}

interface Bin {
  id: string;
  location: string;
  coordinates: { lat: number; lng: number };
  type: 'empty' | 'full';
  capacity: number;
  fillLevel: number;
  lastEmptied: string;
  sensorStatus: string;
  batteryLevel: number;
}

interface ReportedSpot {
  id: string;
  location: string;
  coordinates: { lat: number; lng: number };
  garbageSize: string;
  submittedAt: string;
  userId: string;
}

export function MapScreen({ onNavigate }: MapScreenProps) {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadMapData();
    getUserLocation();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadMapData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getUserLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
    } catch (error) {
      console.error('Error getting user location:', error);
    }
  };

  const loadMapData = async () => {
    try {
      setIsLoading(true);
      
      // Load bins data
      const bins = getBins();
      
      // Load reported spots
      const spots = getReports();

      const newMarkers: MapMarker[] = [];

      // Convert bins to markers
      bins.forEach((bin) => {
        // Convert GPS coordinates to screen position (simplified)
        const x = ((bin.lng - 77.3850) / 0.012) * 100;
        const y = ((28.5400 - bin.lat) / 0.008) * 100;
        
        newMarkers.push({
          id: bin.id,
          type: bin.type,
          location: `Bin ${bin.id}`,
          coordinates: { lat: bin.lat, lng: bin.lng },
          x: Math.max(5, Math.min(95, x)), // Keep within bounds
          y: Math.max(5, Math.min(95, y)),
          lastUpdated: getRelativeTime(bin.lastUpdated),
          fillLevel: bin.fillLevel,
          batteryLevel: 95,
          sensorStatus: 'online',
          capacity: 100,
        });
      });

      // Convert reported spots to markers
      spots.forEach((spot) => {
        const x = ((spot.coordinates.lng - 77.3850) / 0.012) * 100;
        const y = ((28.5400 - spot.coordinates.lat) / 0.008) * 100;
        
        newMarkers.push({
          id: spot.id,
          type: 'reported',
          location: spot.location,
          coordinates: spot.coordinates,
          x: Math.max(5, Math.min(95, x)),
          y: Math.max(5, Math.min(95, y)),
          lastUpdated: getRelativeTime(spot.submittedAt),
          reportedBy: spot.userId,
        });
      });

      setMarkers(newMarkers);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading map data:', error);
      loadFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFallbackData = () => {
    // Fallback data when API is unavailable
    const fallbackMarkers: MapMarker[] = [
      { 
        id: 'fallback-1', 
        type: 'empty', 
        location: 'Sector 12, Gate 1', 
        x: 25, 
        y: 35, 
        lastUpdated: '2 hours ago',
        fillLevel: 15,
        batteryLevel: 95,
        sensorStatus: 'online',
        capacity: 85
      },
      { 
        id: 'fallback-2', 
        type: 'full', 
        location: 'Sector 15, Block C', 
        x: 65, 
        y: 45, 
        lastUpdated: '30 mins ago',
        fillLevel: 95,
        batteryLevel: 78,
        sensorStatus: 'online',
        capacity: 100
      },
      { 
        id: 'fallback-3', 
        type: 'reported', 
        location: 'Main Road, Near Park', 
        x: 45, 
        y: 65, 
        reportedBy: 'Community Member', 
        lastUpdated: '1 hour ago' 
      },
      { 
        id: 'fallback-4', 
        type: 'empty', 
        location: 'Community Center', 
        x: 35, 
        y: 75, 
        lastUpdated: '1 day ago',
        fillLevel: 30,
        batteryLevel: 89,
        sensorStatus: 'online',
        capacity: 120
      },
    ];
    
    setMarkers(fallbackMarkers);
    setLastRefresh(new Date());
  };

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getMarkerColor = (type: MarkerType) => {
    switch (type) {
      case 'empty': return 'bg-green-500 shadow-green-200';
      case 'full': return 'bg-red-500 shadow-red-200';
      case 'reported': return 'bg-yellow-500 shadow-yellow-200';
    }
  };

  const getMarkerIcon = (type: MarkerType) => {
    switch (type) {
      case 'empty': return <Trash2 size={14} className="text-white" />;
      case 'full': return <Trash2 size={14} className="text-white" />;
      case 'reported': return <MapPin size={14} className="text-white" />;
    }
  };

  const getStatusText = (type: MarkerType) => {
    switch (type) {
      case 'empty': return 'Empty Bin';
      case 'full': return 'Full Bin';
      case 'reported': return 'Reported Spot';
    }
  };

  const getMarkerPulse = (type: MarkerType) => {
    if (type === 'full') return 'animate-pulse';
    if (type === 'reported') return 'animate-bounce';
    return '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('home')}
              className="p-2"
            >
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Area Map</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLegend(!showLegend)}
            className="p-2"
          >
            <Navigation size={18} />
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-gray-100 overflow-hidden">
        {/* Enhanced Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-gray-50">
          {/* Main Roads */}
          <div className="absolute top-1/3 left-0 right-0 h-1 bg-gray-400 opacity-60 shadow-sm"></div>
          <div className="absolute top-2/3 left-0 right-0 h-1 bg-gray-400 opacity-60 shadow-sm"></div>
          <div className="absolute left-1/3 top-0 bottom-0 w-1 bg-gray-400 opacity-60 shadow-sm"></div>
          <div className="absolute left-2/3 top-0 bottom-0 w-1 bg-gray-400 opacity-60 shadow-sm"></div>
          
          {/* Secondary Streets */}
          <div className="absolute top-1/6 left-0 right-0 h-0.5 bg-gray-300 opacity-40"></div>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 opacity-40"></div>
          <div className="absolute top-5/6 left-0 right-0 h-0.5 bg-gray-300 opacity-40"></div>
          <div className="absolute left-1/6 top-0 bottom-0 w-0.5 bg-gray-300 opacity-40"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 opacity-40"></div>
          <div className="absolute left-5/6 top-0 bottom-0 w-0.5 bg-gray-300 opacity-40"></div>

          {/* Park Areas */}
          <div className="absolute top-[20%] left-[10%] w-16 h-12 bg-green-200 rounded-lg opacity-50"></div>
          <div className="absolute top-[60%] left-[70%] w-20 h-14 bg-green-200 rounded-lg opacity-50"></div>
          
          {/* Building Blocks */}
          <div className="absolute top-[40%] left-[45%] w-12 h-8 bg-gray-300 rounded opacity-30"></div>
          <div className="absolute top-[25%] left-[65%] w-14 h-10 bg-gray-300 rounded opacity-30"></div>
          <div className="absolute top-[70%] left-[20%] w-16 h-12 bg-gray-300 rounded opacity-30"></div>
        </div>

        {/* Map Markers */}
        {markers.map((marker) => (
          <div key={marker.id} className="absolute z-10" style={{
            left: `${marker.x}%`,
            top: `${marker.y}%`,
            transform: 'translate(-50%, -50%)'
          }}>
            <button
              className={`relative w-8 h-8 rounded-full ${getMarkerColor(marker.type)} border-2 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-200 active:scale-95 ${getMarkerPulse(marker.type)}`}
              onClick={() => setSelectedMarker(marker)}
            >
              {getMarkerIcon(marker.type)}
              {/* Marker ripple effect for active states */}
              {(marker.type === 'full' || marker.type === 'reported') && (
                <div className={`absolute inset-0 rounded-full ${getMarkerColor(marker.type)} opacity-20 scale-150 animate-ping`}></div>
              )}
            </button>
          </div>
        ))}

        {/* User Location Pin */}
        <div className="absolute z-10" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className="relative">
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
            <div className="absolute inset-0 w-4 h-4 bg-blue-600 rounded-full opacity-30 animate-ping"></div>
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="absolute bottom-6 right-6 flex flex-col space-y-3 z-20">
          <Button
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
            onClick={() => {/* Center on user location */}}
          >
            <Navigation size={20} />
          </Button>
          <Button
            className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg"
            onClick={() => onNavigate('report')}
          >
            <Plus size={24} />
          </Button>
        </div>

        {/* Legend */}
        {showLegend && (
          <Card className="absolute top-4 left-4 z-10 shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">Legend</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLegend(false)}
                  className="p-1 h-auto"
                >
                  <X size={14} />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Empty Bin</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-600">Full Bin</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Reported Spot</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-xs text-gray-600">Your Location</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Bar */}
        <Card className="absolute top-4 right-4 z-10 shadow-lg">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{markers.filter(m => m.type === 'empty').length}</div>
              <div className="text-xs text-gray-500">Available</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMapData}
                className="p-1 mt-1 h-auto"
                disabled={isLoading}
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Marker Info */}
      {selectedMarker && (
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <Card className="m-4 border-t-4 border-t-green-600 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${getMarkerColor(selectedMarker.type).split(' ')[0]}`}></div>
                  <h3 className="font-medium text-gray-900">{getStatusText(selectedMarker.type)}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMarker(null)}
                  className="p-1 h-auto"
                >
                  <X size={16} />
                </Button>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center space-x-2">
                  <MapPin size={14} className="text-gray-400" />
                  <p className="text-sm text-gray-600">{selectedMarker.location}</p>
                </div>
                {selectedMarker.lastUpdated && (
                  <p className="text-xs text-gray-500">Updated {selectedMarker.lastUpdated}</p>
                )}
                {selectedMarker.reportedBy && (
                  <p className="text-xs text-gray-500">Reported by {selectedMarker.reportedBy}</p>
                )}
                
                {/* Bin Status Details */}
                {selectedMarker.type !== 'reported' && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {selectedMarker.fillLevel !== undefined && (
                      <div className="text-xs">
                        <span className="text-gray-500">Fill Level:</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                selectedMarker.fillLevel > 80 ? 'bg-red-500' : 
                                selectedMarker.fillLevel > 60 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${selectedMarker.fillLevel}%` }}
                            ></div>
                          </div>
                          <span>{selectedMarker.fillLevel}%</span>
                        </div>
                      </div>
                    )}
                    
                    {selectedMarker.batteryLevel !== undefined && (
                      <div className="text-xs">
                        <span className="text-gray-500">Battery:</span>
                        <div className="flex items-center space-x-1">
                          <Battery size={12} className={
                            selectedMarker.batteryLevel > 50 ? 'text-green-600' : 
                            selectedMarker.batteryLevel > 20 ? 'text-yellow-600' : 'text-red-600'
                          } />
                          <span>{selectedMarker.batteryLevel}%</span>
                        </div>
                      </div>
                    )}
                    
                    {selectedMarker.sensorStatus && (
                      <div className="text-xs col-span-2">
                        <span className="text-gray-500">Sensor:</span>
                        <div className="flex items-center space-x-1">
                          {selectedMarker.sensorStatus === 'online' ? (
                            <Wifi size={12} className="text-green-600" />
                          ) : (
                            <WifiOff size={12} className="text-red-600" />
                          )}
                          <span className="capitalize">{selectedMarker.sensorStatus.replace('_', ' ')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedMarker.type === 'full' && (
                <div className="flex items-center space-x-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg mb-3">
                  <span className="text-base">⚠️</span>
                  <div>
                    <p className="font-medium">Urgent Attention Required</p>
                    <p>This bin is full and needs to be emptied</p>
                  </div>
                </div>
              )}
              
              {selectedMarker.type === 'reported' && (
                <div className="flex items-center space-x-2 text-xs text-yellow-600 bg-yellow-50 p-3 rounded-lg mb-3">
                  <span className="text-base">📍</span>
                  <div>
                    <p className="font-medium">Community Report</p>
                    <p>Garbage spot needs cleanup</p>
                  </div>
                </div>
              )}
              
              {selectedMarker.type === 'empty' && (
                <div className="flex items-center space-x-2 text-xs text-green-600 bg-green-50 p-3 rounded-lg mb-3">
                  <span className="text-base">✅</span>
                  <div>
                    <p className="font-medium">Available for Use</p>
                    <p>This bin is ready to accept waste</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Get Directions
                </Button>
                {selectedMarker.type === 'full' && (
                  <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700">
                    Report Issue
                  </Button>
                )}
                {selectedMarker.type === 'reported' && (
                  <Button size="sm" className="flex-1 bg-yellow-600 hover:bg-yellow-700">
                    Confirm Status
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}