import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Droplets, Newspaper, AlertTriangle, Trophy } from 'lucide-react';

interface SegregationScreenProps {
  onNavigate: (screen: string) => void;
}

interface WasteItem {
  icon: string;
  name: string;
  description: string;
}

const wetWasteItems: WasteItem[] = [
  { icon: '🍎', name: 'Fruit Peels', description: 'Apple, banana, orange peels' },
  { icon: '🥬', name: 'Vegetable Scraps', description: 'Onion peels, leftover vegetables' },
  { icon: '🍚', name: 'Food Leftovers', description: 'Cooked rice, bread, curry' },
  { icon: '☕', name: 'Tea Leaves', description: 'Used tea bags, coffee grounds' },
  { icon: '🌸', name: 'Garden Waste', description: 'Fallen leaves, small branches' },
];

const dryWasteItems: WasteItem[] = [
  { icon: '📰', name: 'Paper', description: 'Newspapers, magazines, cardboard' },
  { icon: '🥤', name: 'Plastic Bottles', description: 'Water bottles, containers' },
  { icon: '🥫', name: 'Metal Cans', description: 'Aluminum cans, tin containers' },
  { icon: '🍾', name: 'Glass', description: 'Bottles, jars, broken glass' },
  { icon: '👕', name: 'Textiles', description: 'Old clothes, fabric scraps' },
];

const hazardousWasteItems: WasteItem[] = [
  { icon: '🔋', name: 'Batteries', description: 'All types of batteries' },
  { icon: '💡', name: 'CFL Bulbs', description: 'Compact fluorescent lights' },
  { icon: '🧴', name: 'Chemicals', description: 'Paint, pesticides, cleaning products' },
  { icon: '💊', name: 'Medicines', description: 'Expired medications' },
  { icon: '📱', name: 'Electronics', description: 'Phones, chargers, small devices' },
];

export function SegregationScreen({ onNavigate }: SegregationScreenProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const quizQuestions = [
    {
      question: "Where should banana peels go?",
      options: ["Wet Waste", "Dry Waste", "Hazardous Waste"],
      correct: 0
    },
    {
      question: "How should plastic bottles be disposed?",
      options: ["Wet Waste", "Dry Waste", "Hazardous Waste"],
      correct: 1
    },
    {
      question: "Where do expired medicines belong?",
      options: ["Wet Waste", "Dry Waste", "Hazardous Waste"],
      correct: 2
    }
  ];

  const handleQuizAnswer = (selectedAnswer: number) => {
    if (selectedAnswer === quizQuestions[currentQuestion].correct) {
      setScore(score + 1);
    }

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setQuizComplete(false);
    setShowQuiz(false);
  };

  if (showQuiz) {
    if (quizComplete) {
      return (
        <div className="flex flex-col h-full">
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetQuiz}
                className="p-2"
              >
                <ArrowLeft size={18} />
              </Button>
              <h1 className="text-lg font-semibold text-gray-900">Quiz Results</h1>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Trophy size={64} className="text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Quiz Complete!</h2>
              <p className="text-2xl font-bold text-green-600 mb-2">
                {score}/{quizQuestions.length}
              </p>
              <p className="text-gray-600 mb-4">
                {score === quizQuestions.length 
                  ? "Perfect! You're a waste segregation expert!"
                  : score >= quizQuestions.length / 2
                  ? "Good job! Keep learning about waste segregation."
                  : "Keep practicing! Review the guide and try again."
                }
              </p>
              <p className="text-sm text-gray-500 mb-6">+{score * 10} points earned</p>
              <div className="space-y-2">
                <Button onClick={resetQuiz} className="w-full">
                  Back to Guide
                </Button>
                <Button variant="outline" onClick={() => setCurrentQuestion(0)} className="w-full">
                  Retake Quiz
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetQuiz}
                className="p-2"
              >
                <ArrowLeft size={18} />
              </Button>
              <h1 className="text-lg font-semibold text-gray-900">Knowledge Quiz</h1>
            </div>
            <span className="text-sm text-gray-500">
              {currentQuestion + 1}/{quizQuestions.length}
            </span>
          </div>
        </div>

        <div className="flex-1 p-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                {quizQuestions[currentQuestion].question}
              </h2>
              <div className="space-y-3">
                {quizQuestions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left justify-start py-4"
                    onClick={() => handleQuizAnswer(index)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const WasteCategory = ({ items, icon: CategoryIcon, title, color }: {
    items: WasteItem[];
    icon: any;
    title: string;
    color: string;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 mb-4">
        <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center`}>
          <CategoryIcon size={16} className="text-white" />
        </div>
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      {items.map((item, index) => (
        <Card key={index}>
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

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
            <h1 className="text-lg font-semibold text-gray-900">Segregation Guide</h1>
          </div>
          <Button
            size="sm"
            onClick={() => setShowQuiz(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Trophy size={16} className="mr-2" />
            Quiz
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <Tabs defaultValue="wet" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="wet" className="flex items-center space-x-1">
              <Droplets size={16} />
              <span>Wet</span>
            </TabsTrigger>
            <TabsTrigger value="dry" className="flex items-center space-x-1">
              <Newspaper size={16} />
              <span>Dry</span>
            </TabsTrigger>
            <TabsTrigger value="hazardous" className="flex items-center space-x-1">
              <AlertTriangle size={16} />
              <span>Hazardous</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wet" className="space-y-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <h3 className="font-medium text-green-900 mb-2">Wet Waste</h3>
                <p className="text-sm text-green-700">
                  Biodegradable waste that decomposes naturally. Should be composted.
                </p>
              </CardContent>
            </Card>
            <WasteCategory
              items={wetWasteItems}
              icon={Droplets}
              title="Examples"
              color="bg-green-600"
            />
          </TabsContent>

          <TabsContent value="dry" className="space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-medium text-blue-900 mb-2">Dry Waste</h3>
                <p className="text-sm text-blue-700">
                  Non-biodegradable waste that can be recycled or reused.
                </p>
              </CardContent>
            </Card>
            <WasteCategory
              items={dryWasteItems}
              icon={Newspaper}
              title="Examples"
              color="bg-blue-600"
            />
          </TabsContent>

          <TabsContent value="hazardous" className="space-y-4">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <h3 className="font-medium text-red-900 mb-2">Hazardous Waste</h3>
                <p className="text-sm text-red-700">
                  Toxic waste requiring special handling and disposal methods.
                </p>
              </CardContent>
            </Card>
            <WasteCategory
              items={hazardousWasteItems}
              icon={AlertTriangle}
              title="Examples"
              color="bg-red-600"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}