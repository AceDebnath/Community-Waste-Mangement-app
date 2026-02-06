import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS configuration
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://*.figma.com'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
}));

// Add basic logging
app.use('*', async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`);
  await next();
});

// Health check endpoint
app.get('/make-server-0ac3600c/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    supabaseConfigured: !!(supabaseUrl && supabaseServiceKey)
  });
});

// Initialize Supabase client with service role key
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(
  supabaseUrl || 'missing-url',
  supabaseServiceKey || 'missing-key'
);

// User registration
app.post('/make-server-0ac3600c/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: data.user.email,
      name,
      points: 0,
      level: 1,
      reportsCount: 0,
      badges: [],
      joinedAt: new Date().toISOString()
    });

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup processing error:', error);
    return c.json({ error: 'Failed to process signup' }, 500);
  }
});

// Get waste bin locations with real-time status
app.get('/make-server-0ac3600c/bins', async (c) => {
  try {
    // Get all bins from KV store
    const bins = await kv.getByPrefix('bin:');
    
    // If no bins exist, create some mock data
    if (bins.length === 0) {
      const mockBins = [
        {
          id: 'bin-001',
          location: 'Sector 12, Gate 1',
          coordinates: { lat: 28.5355, lng: 77.3910 },
          type: 'empty',
          capacity: 85,
          fillLevel: 15,
          lastEmptied: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          sensorStatus: 'online',
          batteryLevel: 95
        },
        {
          id: 'bin-002',
          location: 'Sector 15, Block C',
          coordinates: { lat: 28.5375, lng: 77.3930 },
          type: 'full',
          capacity: 100,
          fillLevel: 95,
          lastEmptied: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          sensorStatus: 'online',
          batteryLevel: 78
        },
        {
          id: 'bin-003',
          location: 'Community Center',
          coordinates: { lat: 28.5345, lng: 77.3890 },
          type: 'empty',
          capacity: 120,
          fillLevel: 30,
          lastEmptied: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          sensorStatus: 'online',
          batteryLevel: 89
        },
        {
          id: 'bin-004',
          location: 'Market Square',
          coordinates: { lat: 28.5365, lng: 77.3870 },
          type: 'full',
          capacity: 80,
          fillLevel: 88,
          lastEmptied: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          sensorStatus: 'low_battery',
          batteryLevel: 12
        }
      ];

      // Store mock bins
      for (const bin of mockBins) {
        await kv.set(`bin:${bin.id}`, bin);
      }
      
      return c.json({ bins: mockBins });
    }

    return c.json({ bins });
  } catch (error) {
    console.log('Error fetching bins:', error);
    return c.json({ error: 'Failed to fetch bin data' }, 500);
  }
});

// Submit garbage spot report
app.post('/make-server-0ac3600c/reports', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const { location, coordinates, garbageSize, description, photo } = await c.req.json();
    
    const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const report = {
      id: reportId,
      userId: user.id,
      location,
      coordinates,
      garbageSize,
      description,
      photo,
      status: 'pending',
      priority: garbageSize === 'large' ? 'high' : garbageSize === 'medium' ? 'medium' : 'low',
      submittedAt: new Date().toISOString(),
      upvotes: 0,
      assignedTo: null,
      estimatedCleanupTime: garbageSize === 'large' ? 2 : garbageSize === 'medium' ? 1 : 0.5
    };

    await kv.set(`report:${reportId}`, report);

    // Update user points and stats
    const userData = await kv.get(`user:${user.id}`);
    if (userData) {
      const points = garbageSize === 'large' ? 30 : garbageSize === 'medium' ? 20 : 10;
      userData.points += points;
      userData.reportsCount += 1;
      userData.level = Math.floor(userData.points / 500) + 1;
      
      // Award badges
      if (userData.reportsCount === 10 && !userData.badges.includes('first_ten')) {
        userData.badges.push('first_ten');
        userData.points += 50;
      }
      if (userData.reportsCount === 50 && !userData.badges.includes('clean_champion')) {
        userData.badges.push('clean_champion');
        userData.points += 100;
      }
      
      await kv.set(`user:${user.id}`, userData);
    }

    return c.json({ 
      report,
      pointsEarned: garbageSize === 'large' ? 30 : garbageSize === 'medium' ? 20 : 10
    });
  } catch (error) {
    console.log('Error submitting report:', error);
    return c.json({ error: 'Failed to submit report' }, 500);
  }
});

// Get user reports
app.get('/make-server-0ac3600c/reports/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const userId = c.req.param('userId');
    
    if (user.id !== userId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    const allReports = await kv.getByPrefix('report:');
    const userReports = allReports.filter(report => report.userId === userId);
    
    return c.json({ reports: userReports });
  } catch (error) {
    console.log('Error fetching user reports:', error);
    return c.json({ error: 'Failed to fetch reports' }, 500);
  }
});

// Get all reported spots (for map)
app.get('/make-server-0ac3600c/spots', async (c) => {
  try {
    const reports = await kv.getByPrefix('report:');
    const activeSpots = reports.filter(report => report.status === 'pending' || report.status === 'in_progress');
    
    return c.json({ spots: activeSpots });
  } catch (error) {
    console.log('Error fetching reported spots:', error);
    return c.json({ error: 'Failed to fetch spots' }, 500);
  }
});

// Get user profile
app.get('/make-server-0ac3600c/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    
    if (!userData) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    return c.json({ profile: userData });
  } catch (error) {
    console.log('Error fetching profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Update bin status (IoT sensor simulation)
app.put('/make-server-0ac3600c/bins/:binId', async (c) => {
  try {
    const binId = c.req.param('binId');
    const { fillLevel, batteryLevel, sensorStatus } = await c.req.json();
    
    const bin = await kv.get(`bin:${binId}`);
    
    if (!bin) {
      return c.json({ error: 'Bin not found' }, 404);
    }

    // Update bin status
    bin.fillLevel = fillLevel;
    bin.batteryLevel = batteryLevel || bin.batteryLevel;
    bin.sensorStatus = sensorStatus || bin.sensorStatus;
    bin.type = fillLevel >= 85 ? 'full' : 'empty';
    bin.lastUpdated = new Date().toISOString();

    await kv.set(`bin:${binId}`, bin);

    return c.json({ bin });
  } catch (error) {
    console.log('Error updating bin status:', error);
    return c.json({ error: 'Failed to update bin status' }, 500);
  }
});

// Get truck schedule
app.get('/make-server-0ac3600c/trucks/schedule', async (c) => {
  try {
    let schedule = await kv.get('truck_schedule');
    
    if (!schedule) {
      // Create mock schedule
      schedule = {
        routes: [
          {
            id: 'route-001',
            area: 'Sector 12-15',
            nextPickup: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(), // 14 hours from now
            frequency: 'daily',
            truckId: 'TRK-001',
            estimatedDuration: 2.5,
            status: 'scheduled'
          },
          {
            id: 'route-002', 
            area: 'Market Area',
            nextPickup: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
            frequency: 'twice_daily',
            truckId: 'TRK-002',
            estimatedDuration: 1.5,
            status: 'in_progress'
          }
        ],
        lastUpdated: new Date().toISOString()
      };
      
      await kv.set('truck_schedule', schedule);
    }

    return c.json(schedule);
  } catch (error) {
    console.log('Error fetching truck schedule:', error);
    return c.json({ error: 'Failed to fetch truck schedule' }, 500);
  }
});

// Quiz endpoints
app.get('/make-server-0ac3600c/quiz/questions', async (c) => {
  try {
    let questions = await kv.get('quiz_questions');
    
    if (!questions) {
      questions = [
        {
          id: 1,
          question: "Where should banana peels go?",
          options: ["Wet Waste", "Dry Waste", "Hazardous Waste"],
          correct: 0,
          explanation: "Banana peels are organic waste that decomposes naturally, so they belong in wet waste."
        },
        {
          id: 2,
          question: "How should plastic bottles be disposed?",
          options: ["Wet Waste", "Dry Waste", "Hazardous Waste"],
          correct: 1,
          explanation: "Plastic bottles are recyclable and should go in dry waste."
        },
        {
          id: 3,
          question: "Where do expired medicines belong?",
          options: ["Wet Waste", "Dry Waste", "Hazardous Waste"],
          correct: 2,
          explanation: "Expired medicines can be toxic and require special disposal methods."
        },
        {
          id: 4,
          question: "What type of waste are old newspapers?",
          options: ["Wet Waste", "Dry Waste", "Hazardous Waste"],
          correct: 1,
          explanation: "Newspapers are recyclable paper products that belong in dry waste."
        },
        {
          id: 5,
          question: "Where should used batteries go?",
          options: ["Wet Waste", "Dry Waste", "Hazardous Waste"],
          correct: 2,
          explanation: "Batteries contain toxic chemicals and should be disposed of as hazardous waste."
        }
      ];
      
      await kv.set('quiz_questions', questions);
    }

    // Return random 3 questions
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return c.json({ questions: shuffled.slice(0, 3) });
  } catch (error) {
    console.log('Error fetching quiz questions:', error);
    return c.json({ error: 'Failed to fetch quiz questions' }, 500);
  }
});

// Submit quiz results
app.post('/make-server-0ac3600c/quiz/submit', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const { score, totalQuestions } = await c.req.json();
    
    // Update user points
    const userData = await kv.get(`user:${user.id}`);
    if (userData) {
      const points = score * 10;
      userData.points += points;
      userData.level = Math.floor(userData.points / 500) + 1;
      
      // Award quiz badges
      if (score === totalQuestions && !userData.badges.includes('perfect_score')) {
        userData.badges.push('perfect_score');
        userData.points += 50;
      }
      
      await kv.set(`user:${user.id}`, userData);
    }

    return c.json({ 
      pointsEarned: score * 10,
      badgeEarned: score === totalQuestions ? 'perfect_score' : null
    });
  } catch (error) {
    console.log('Error submitting quiz:', error);
    return c.json({ error: 'Failed to submit quiz' }, 500);
  }
});

Deno.serve(app.fetch);