import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, User, Award, Star, Target, TrendingUp, Calendar } from 'lucide-react';
import { getUser, getUserReports } from '../utils/localData';

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

const badges = [
  { id: 1, name: 'Clean Champion', icon: '🏆', description: '50+ reports submitted', earned: true, color: 'bg-yellow-100 text-yellow-800' },
  { id: 2, name: 'Eco Warrior', icon: '🌱', description: 'Quiz master', earned: true, color: 'bg-green-100 text-green-800' },
  { id: 3, name: 'Community Helper', icon: '🤝', description: '25+ spots reported', earned: true, color: 'bg-blue-100 text-blue-800' },
  { id: 4, name: 'Streak Master', icon: '🔥', description: '7-day reporting streak', earned: false, color: 'bg-gray-100 text-gray-500' },
  { id: 5, name: 'Perfect Score', icon: '💯', description: 'Ace all quizzes', earned: true, color: 'bg-purple-100 text-purple-800' },
  { id: 6, name: 'Monthly Legend', icon: '📅', description: '100+ reports in a month', earned: false, color: 'bg-gray-100 text-gray-500' },
];

const monthlyStats = [
  { month: 'Jan', reports: 8, points: 160 },
  { month: 'Feb', reports: 12, points: 240 },
  { month: 'Mar', reports: 15, points: 300 },
  { month: 'Apr', reports: 18, points: 360 },
  { month: 'May', reports: 22, points: 440 },
  { month: 'Jun', reports: 28, points: 560 },
];

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const [user, setUser] = useState<any>(null);
  const [userReports, setUserReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = () => {
      const userData = getUser();
      if (userData) {
        setUser(userData);
        loadUserReports(userData.id);
      }
      setIsLoading(false);
    };

    loadUserData();
  }, []);

  const loadUserReports = (userId: string) => {
    if (!userId) return;
    
    try {
      const reports = getUserReports(userId);
      setUserReports(reports);
    } catch (error) {
      console.error('Error loading user reports:', error);
    }
  };

  const currentLevel = user?.level || 1;
  const pointsToNextLevel = (currentLevel * 500) - (user?.points || 0);
  const levelProgress = (((user?.points || 0) % 500) / 500) * 100;

  if (!user) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="text-gray-600 mb-2">Loading profile...</div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* User Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">Level {currentLevel}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{user.reportsCount}</div>
              <p className="text-sm text-gray-600">Total Reports</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{user.points}</div>
              <p className="text-sm text-gray-600">Points Earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Level Progress</h3>
              <span className="text-sm text-gray-600">Level {currentLevel}</span>
            </div>
            <Progress value={levelProgress} className="mb-2" />
            <p className="text-xs text-gray-500">
              {pointsToNextLevel} points to Level {currentLevel + 1}
            </p>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <TrendingUp size={18} className="text-green-600" />
              <span>Recent Activity</span>
            </h3>
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="text-sm text-gray-500">Loading activity...</div>
                </div>
              ) : userReports.length > 0 ? (
                userReports.slice(0, 3).map((report, index) => (
                  <div key={report.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        report.garbageSize === 'large' ? 'bg-red-500' :
                        report.garbageSize === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-sm text-gray-600">Reported {report.garbageSize} garbage spot</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        +{report.garbageSize === 'large' ? 30 : report.garbageSize === 'medium' ? 20 : 10} pts
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(report.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <div className="text-sm text-gray-500">No activity yet</div>
                  <Button 
                    onClick={() => onNavigate('report')} 
                    size="sm" 
                    className="mt-2"
                  >
                    Make your first report
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <Award size={18} className="text-green-600" />
              <span>Badges</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge) => {
                const earned = user.badges.includes(badge.id.toString()) || 
                              (badge.id === 1 && user.reportsCount >= 50) ||
                              (badge.id === 2 && user.badges.includes('perfect_score')) ||
                              (badge.id === 3 && user.reportsCount >= 25);
                
                return (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-lg border ${
                      earned
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <h4 className="text-sm font-medium text-gray-900">{badge.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                      {earned && (
                        <Badge className={`mt-2 ${badge.color}`} variant="secondary">
                          Earned
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Progress */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <Calendar size={18} className="text-green-600" />
              <span>Monthly Progress</span>
            </h3>
            <div className="space-y-2">
              {monthlyStats.slice(-3).map((stat, index) => (
                <div key={stat.month} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{stat.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">{stat.reports} reports</span>
                    <span className="text-sm font-medium text-green-600">{stat.points} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Community Rank */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <Target size={18} className="text-green-600" />
              <span>Community Ranking</span>
            </h3>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">#12</div>
              <p className="text-sm text-gray-600">out of 1,247 members</p>
              <p className="text-xs text-gray-500 mt-2">Keep up the great work!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
