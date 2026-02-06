// Local data management without backend
export interface User {
  id: string;
  email: string;
  name: string;
  points: number;
  level: number;
  reportsCount: number;
  badges: string[];
}

export interface Bin {
  id: string;
  type: 'empty' | 'full' | 'medium';
  lat: number;
  lng: number;
  fillLevel: number;
  lastUpdated: string;
}

export interface Report {
  id: string;
  userId: string;
  location: string;
  coordinates: { lat: number; lng: number };
  garbageSize: 'small' | 'medium' | 'large';
  description: string;
  photo?: string;
  submittedAt: string;
  status: 'pending' | 'resolved';
  pointsEarned: number;
}

export interface TruckRoute {
  id: string;
  area: string;
  nextPickup: string;
  frequency: string;
  truckId: string;
  estimatedDuration: number;
  status: string;
}

// Initialize user data from localStorage or create default
const DEFAULT_USER: User = {
  id: 'user-001',
  email: 'user@example.com',
  name: 'EcoClean User',
  points: 560,
  level: 2,
  reportsCount: 28,
  badges: ['1', '2', '3', '5'],
};

export const getUser = (): User => {
  const stored = localStorage.getItem('ecoclean_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return DEFAULT_USER;
    }
  }
  localStorage.setItem('ecoclean_user', JSON.stringify(DEFAULT_USER));
  return DEFAULT_USER;
};

export const updateUser = (updates: Partial<User>): User => {
  const current = getUser();
  const updated = { ...current, ...updates };
  localStorage.setItem('ecoclean_user', JSON.stringify(updated));
  return updated;
};

// Mock bins data
const MOCK_BINS: Bin[] = [
  {
    id: 'bin-001',
    type: 'empty',
    lat: 28.5355,
    lng: 77.3910,
    fillLevel: 25,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'bin-002',
    type: 'empty',
    lat: 28.5365,
    lng: 77.3920,
    fillLevel: 40,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'bin-003',
    type: 'full',
    lat: 28.5345,
    lng: 77.3900,
    fillLevel: 95,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'bin-004',
    type: 'empty',
    lat: 28.5375,
    lng: 77.3930,
    fillLevel: 15,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'bin-005',
    type: 'medium',
    lat: 28.5350,
    lng: 77.3915,
    fillLevel: 65,
    lastUpdated: new Date().toISOString(),
  },
];

export const getBins = (): Bin[] => {
  return MOCK_BINS;
};

// Reports management
export const getReports = (): Report[] => {
  const stored = localStorage.getItem('ecoclean_reports');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }
  return [];
};

export const addReport = (reportData: Omit<Report, 'id' | 'userId' | 'submittedAt' | 'status' | 'pointsEarned'>): Report => {
  const reports = getReports();
  const user = getUser();
  
  const pointsMap = {
    small: 10,
    medium: 20,
    large: 30,
  };
  
  const newReport: Report = {
    ...reportData,
    id: `report-${Date.now()}`,
    userId: user.id,
    submittedAt: new Date().toISOString(),
    status: 'pending',
    pointsEarned: pointsMap[reportData.garbageSize],
  };
  
  reports.push(newReport);
  localStorage.setItem('ecoclean_reports', JSON.stringify(reports));
  
  // Update user points and reports count
  updateUser({
    points: user.points + newReport.pointsEarned,
    reportsCount: user.reportsCount + 1,
    level: Math.floor((user.points + newReport.pointsEarned) / 500) + 1,
  });
  
  return newReport;
};

export const getUserReports = (userId: string): Report[] => {
  const reports = getReports();
  return reports.filter(r => r.userId === userId).sort((a, b) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
};

// Truck schedule
export const getTruckSchedule = (): { routes: TruckRoute[] } => {
  return {
    routes: [
      {
        id: 'route-001',
        area: 'Sector 15, Block A',
        nextPickup: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        frequency: 'daily',
        truckId: 'TRK-001',
        estimatedDuration: 2,
        status: 'scheduled',
      },
      {
        id: 'route-002',
        area: 'Community Center Area',
        nextPickup: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        frequency: 'daily',
        truckId: 'TRK-002',
        estimatedDuration: 1.5,
        status: 'scheduled',
      },
    ],
  };
};

// GPS simulation
export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const baseLat = 28.5355;
      const baseLng = 77.3910;
      const randomOffset = 0.01;
      
      resolve({
        lat: baseLat + (Math.random() - 0.5) * randomOffset,
        lng: baseLng + (Math.random() - 0.5) * randomOffset,
      });
    }, 1000);
  });
};

// Quiz questions
export const getQuizQuestions = () => {
  return {
    questions: [
      {
        id: 1,
        question: 'Which of these items belongs in the recyclable waste bin?',
        options: ['Plastic bottles', 'Food waste', 'Batteries', 'Broken glass'],
        correctAnswer: 'Plastic bottles',
      },
      {
        id: 2,
        question: 'What color bin is typically used for organic waste?',
        options: ['Blue', 'Green', 'Red', 'Yellow'],
        correctAnswer: 'Green',
      },
      {
        id: 3,
        question: 'How should you dispose of electronic waste?',
        options: [
          'Regular trash bin',
          'Recyclable bin',
          'E-waste collection center',
          'Organic waste bin',
        ],
        correctAnswer: 'E-waste collection center',
      },
    ],
  };
};

export const submitQuizScore = (score: number, totalQuestions: number): number => {
  const user = getUser();
  const pointsEarned = score * 5;
  
  const badges = [...user.badges];
  if (score === totalQuestions && !badges.includes('perfect_score')) {
    badges.push('perfect_score');
  }
  
  updateUser({
    points: user.points + pointsEarned,
    badges,
  });
  
  return pointsEarned;
};
