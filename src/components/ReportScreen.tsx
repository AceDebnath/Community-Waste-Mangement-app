import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Camera, MapPin, Upload, CheckCircle, Loader2, Navigation } from 'lucide-react';
import { getCurrentLocation, addReport } from '../utils/localData';

interface ReportScreenProps {
  onNavigate: (screen: string) => void;
}

export function ReportScreen({ onNavigate }: ReportScreenProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [description, setDescription] = useState('');
  const [garbageSize, setGarbageSize] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    setIsLocating(true);
    try {
      const coords = await getCurrentLocation();
      setCoordinates(coords);
      
      // Reverse geocoding simulation (in real app, use Google Maps API)
      const locationNames = [
        'Sector 15, Block A, Near Main Gate',
        'Community Center, Main Road',
        'Market Square, Shopping Complex',
        'School Street, Bus Stop',
        'Park Avenue, Garden Area'
      ];
      
      const randomLocation = locationNames[Math.floor(Math.random() * locationNames.length)];
      setLocation(randomLocation);
    } catch (error) {
      console.error('Error detecting location:', error);
      setLocation('Unable to detect location');
    } finally {
      setIsLocating(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!coordinates) {
      alert('Location not detected. Please try refreshing location.');
      return;
    }

    if (!garbageSize) {
      alert('Please select the garbage area size.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const report = addReport({
        location,
        coordinates,
        garbageSize: garbageSize as 'small' | 'medium' | 'large',
        description,
        photo: photo || undefined,
      });

      setPointsEarned(report.pointsEarned);
      setIsSubmitted(true);
      
      // Auto navigate back after success
      setTimeout(() => {
        setIsSubmitted(false);
        onNavigate('map');
      }, 3000);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Report Submitted!</h2>
            <p className="text-gray-600">Thank you for helping keep our community clean.</p>
            <p className="text-sm text-gray-500 mt-2">+{pointsEarned} points earned</p>
            <div className="mt-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                📍 Location recorded • 📸 Photo uploaded • ⭐ Points awarded
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('map')}
            className="p-2"
          >
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Report Garbage Spot</h1>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Photo Upload */}
        <Card>
          <CardContent className="p-4">
            <Label className="text-gray-900 mb-3 block">Upload Photo</Label>
            
            {photo ? (
              <div className="relative">
                <img 
                  src={photo} 
                  alt="Uploaded garbage spot" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setPhoto(null)}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        capture="camera"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Camera size={20} className="text-green-600" />
                        </div>
                        <span className="text-sm text-gray-600">Camera</span>
                      </div>
                    </label>
                    
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Upload size={20} className="text-green-600" />
                        </div>
                        <span className="text-sm text-gray-600">Gallery</span>
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Take a photo or choose from gallery</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-gray-900">Location</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={detectLocation}
                disabled={isLocating}
                className="p-2"
              >
                {isLocating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Navigation size={16} />
                )}
              </Button>
            </div>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
                className="pl-10"
                disabled={isLocating}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                {coordinates ? 
                  `GPS: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}` : 
                  'Getting GPS coordinates...'
                }
              </p>
              {coordinates && (
                <span className="text-xs text-green-600">📍 Located</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardContent className="p-4">
            <Label className="text-gray-900 mb-3 block">Description (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the garbage spot (e.g., type of waste, accessibility, urgency)"
              className="min-h-[80px]"
            />
          </CardContent>
        </Card>

        {/* Garbage Area Size */}
        <Card>
          <CardContent className="p-4">
            <Label className="text-gray-900 mb-3 block">Garbage Area Size</Label>
            <Select value={garbageSize} onValueChange={setGarbageSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (few items)</SelectItem>
                <SelectItem value="medium">Medium (bag size)</SelectItem>
                <SelectItem value="large">Large (requires truck)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!photo || !garbageSize || !coordinates || isSubmitting}
          className="w-full py-3"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Submitting Report...
            </>
          ) : (
            'Submit Report'
          )}
        </Button>

        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>By submitting, you earn points and help keep our community clean.</p>
          <div className="flex items-center justify-center space-x-4 text-green-600">
            <span>Small: +10 pts</span>
            <span>Medium: +20 pts</span>
            <span>Large: +30 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}