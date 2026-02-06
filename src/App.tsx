import { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { MapScreen } from './components/MapScreen';
import { ReportScreen } from './components/ReportScreen';
import { SegregationScreen } from './components/SegregationScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { Home, Map, Plus, BookOpen, User } from 'lucide-react';

type Screen = 'home' | 'map' | 'report' | 'guide' | 'profile';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={setCurrentScreen} />;
      case 'map':
        return <MapScreen onNavigate={setCurrentScreen} />;
      case 'report':
        return <ReportScreen onNavigate={setCurrentScreen} />;
      case 'guide':
        return <SegregationScreen onNavigate={setCurrentScreen} />;
      case 'profile':
        return <ProfileScreen onNavigate={setCurrentScreen} />;
      default:
        return <HomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 safe-area-pb">
        <div className="flex justify-around">
          <button
            onClick={() => setCurrentScreen('home')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              currentScreen === 'home'
                ? 'text-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </button>

          <button
            onClick={() => setCurrentScreen('map')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              currentScreen === 'map'
                ? 'text-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Map size={20} />
            <span className="text-xs mt-1">Map</span>
          </button>

          <button
            onClick={() => setCurrentScreen('report')}
            className="flex flex-col items-center py-2 px-3 rounded-lg bg-green-600 text-white"
          >
            <Plus size={20} />
            <span className="text-xs mt-1">Report</span>
          </button>

          <button
            onClick={() => setCurrentScreen('guide')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              currentScreen === 'guide'
                ? 'text-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen size={20} />
            <span className="text-xs mt-1">Guide</span>
          </button>

          <button
            onClick={() => setCurrentScreen('profile')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              currentScreen === 'profile'
                ? 'text-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User size={20} />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}