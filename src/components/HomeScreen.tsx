import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Truck, MapPin, Recycle, Clock, AlertTriangle } from 'lucide-react';
import { getUser, getBins, getTruckSchedule, getReports } from '../utils/localData';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [user, setUser] = useState(getUser());
  const [truckSchedule, setTruckSchedule] = useState(getTruckSchedule());
  const [binsData, setBinsData] = useState(getBins());
  const [reportsData, setReportsData] = useState(getReports());

  useEffect(() => {
    // Refresh data when screen is shown
    setUser(getUser());
    setTruckSchedule(getTruckSchedule());
    setBinsData(getBins());
    setReportsData(getReports());
  }, []);

  const getNextPickupTime = () => {
    if (!truckSchedule?.routes) return 'No schedule available';
    
    const nextRoute = truckSchedule.routes
      .filter(route => route.status === 'scheduled')
      .sort((a, b) => new Date(a.nextPickup).getTime() - new Date(b.nextPickup).getTime())[0];
    
    if (!nextRoute) return 'No upcoming pickups';
    
    const pickupDate = new Date(nextRoute.nextPickup);
    const now = new Date();
    const diffHours = Math.ceil((pickupDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Within the hour';
    if (diffHours < 24) return `In ${diffHours} hours`;
    return `Tomorrow at ${pickupDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getBinStats = () => {
    if (!binsData) return { empty: 0, full: 0, total: 0 };
    
    const empty = binsData.filter(bin => bin.type === 'empty').length;
    const full = binsData.filter(bin => bin.type === 'full').length;
    
    return { empty, full, total: binsData.length };
  };

  const binStats = getBinStats();
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <Recycle size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">EcoClean</h1>
            {user && <p className="text-sm text-gray-600">Welcome back, {user.name}</p>}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {user && (
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">{user.points}</div>
              <div className="text-xs text-gray-500">Level {user.level}</div>
            </div>
          )}
        </div>
      </div>

      {/* Truck Alert */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Truck size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Next Pickup</h3>
              <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                <Clock size={14} />
                <span>{getNextPickupTime()}</span>
              </div>
              {truckSchedule?.routes && (
                <p className="text-xs text-gray-500 mt-1">
                  {truckSchedule.routes.find(r => r.status === 'scheduled')?.area || 'All areas'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Preview */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 flex items-center space-x-2">
              <MapPin size={18} className="text-green-600" />
              <span>Nearby Bins & Spots</span>
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('map')}
              className="text-green-600 hover:text-green-700"
            >
              View All
            </Button>
          </div>
          
          {/* Mock Map Preview */}
          <div className="bg-gray-100 rounded-lg h-32 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-4">
                {/* Green markers (empty bins) */}
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                
                {/* Red marker (full bin) */}
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                
                {/* Yellow marker (reported spot) */}
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            
            <div className="absolute bottom-2 left-2 bg-white rounded px-2 py-1 text-xs shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Empty</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Full</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Reported</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segregation Guide */}
      <Card>
        <CardContent className="p-4">
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-center space-x-3 py-6 hover:bg-green-50 hover:text-green-700"
            onClick={() => onNavigate('guide')}
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Recycle size={20} className="text-green-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Segregation Guide</h3>
              <p className="text-sm text-gray-500">Learn how to sort your waste</p>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Real-time Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="border-green-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-green-600">{binStats.empty}</div>
                <p className="text-xs text-gray-500">Available Bins</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Truck size={16} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={binStats.full > 0 ? "border-red-200" : "border-gray-200"}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-lg font-semibold ${binStats.full > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {binStats.full}
                </div>
                <p className="text-xs text-gray-500">Full Bins</p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                binStats.full > 0 ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <AlertTriangle size={16} className={binStats.full > 0 ? 'text-red-600' : 'text-gray-600'} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personal Stats */}
      {user && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-semibold text-green-600">{user.reportsCount}</div>
              <p className="text-xs text-gray-500">Reports Made</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-semibold text-green-600">{user.points}</div>
              <p className="text-xs text-gray-500">Points Earned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-semibold text-green-600">{user.badges.length}</div>
              <p className="text-xs text-gray-500">Badges Won</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}