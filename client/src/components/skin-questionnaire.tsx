import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { SkinProfile } from "@/lib/types";

interface SkinQuestionnaireProps {
  onClose: () => void;
  onComplete?: (profile: SkinProfile) => void;
}

export default function SkinQuestionnaire({ onClose, onComplete }: SkinQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [skinType, setSkinType] = useState<string>("");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [age, setAge] = useState<string>("");
  const [goals, setGoals] = useState<string[]>([]);

  const handleConcernChange = (concern: string, checked: boolean) => {
    if (checked) {
      setConcerns([...concerns, concern]);
    } else {
      setConcerns(concerns.filter(c => c !== concern));
    }
  };

  const handleGoalChange = (goal: string, checked: boolean) => {
    if (checked) {
      setGoals([...goals, goal]);
    } else {
      setGoals(goals.filter(g => g !== goal));
    }
  };

  const handleComplete = () => {
    const profile: SkinProfile = {
      skinType: skinType as any,
      concerns,
      age: age ? parseInt(age) : undefined,
      goals,
    };
    
    // Store in localStorage for now
    localStorage.setItem('skinProfile', JSON.stringify(profile));
    
    if (onComplete) {
      onComplete(profile);
    }
    onClose();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return skinType !== "";
      case 2:
        return concerns.length > 0;
      case 3:
        return age !== "";
      case 4:
        return goals.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Discover Your Skin Type
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-gray-600 text-center">
            Answer a few questions to get personalized skincare recommendations
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="glow-gradient h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>

          {/* Step 1: Skin Type */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                How does your skin feel after cleansing?
              </h3>
              <RadioGroup value={skinType} onValueChange={setSkinType}>
                <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-xl hover:border-glow-pink cursor-pointer transition-colors">
                  <RadioGroupItem value="dry" id="dry" />
                  <Label htmlFor="dry" className="cursor-pointer">Tight and dry</Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-xl hover:border-glow-pink cursor-pointer transition-colors">
                  <RadioGroupItem value="normal" id="normal" />
                  <Label htmlFor="normal" className="cursor-pointer">Comfortable and balanced</Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-xl hover:border-glow-pink cursor-pointer transition-colors">
                  <RadioGroupItem value="combination" id="combination" />
                  <Label htmlFor="combination" className="cursor-pointer">Oily in some areas, dry in others</Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-xl hover:border-glow-pink cursor-pointer transition-colors">
                  <RadioGroupItem value="oily" id="oily" />
                  <Label htmlFor="oily" className="cursor-pointer">Still oily and greasy</Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-xl hover:border-glow-pink cursor-pointer transition-colors">
                  <RadioGroupItem value="sensitive" id="sensitive" />
                  <Label htmlFor="sensitive" className="cursor-pointer">Easily irritated or reactive</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Concerns */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                What are your main skin concerns?
              </h3>
              <div className="space-y-3">
                {[
                  'Acne and breakouts',
                  'Fine lines and aging',
                  'Dark spots and hyperpigmentation',
                  'Sensitivity and redness',
                  'Large pores',
                  'Dryness and dehydration',
                  'Dullness'
                ].map(concern => (
                  <div key={concern} className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-glow-pink cursor-pointer transition-colors">
                    <Checkbox
                      id={concern}
                      checked={concerns.includes(concern)}
                      onCheckedChange={(checked) => handleConcernChange(concern, checked as boolean)}
                    />
                    <Label htmlFor={concern} className="cursor-pointer">{concern}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Age */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                What's your age range?
              </h3>
              <RadioGroup value={age} onValueChange={setAge}>
                {[
                  { value: '18', label: '18-25' },
                  { value: '26', label: '26-35' },
                  { value: '36', label: '36-45' },
                  { value: '46', label: '46-55' },
                  { value: '56', label: '55+' }
                ].map(({ value, label }) => (
                  <div key={value} className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-xl hover:border-glow-pink cursor-pointer transition-colors">
                    <RadioGroupItem value={value} id={value} />
                    <Label htmlFor={value} className="cursor-pointer">{label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 4: Goals */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                What are your skincare goals?
              </h3>
              <div className="space-y-3">
                {[
                  'Clear, acne-free skin',
                  'Anti-aging and prevention',
                  'Even skin tone',
                  'Hydrated, plump skin',
                  'Reduced sensitivity',
                  'Minimized pores',
                  'Glowing, radiant skin'
                ].map(goal => (
                  <div key={goal} className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-glow-pink cursor-pointer transition-colors">
                    <Checkbox
                      id={goal}
                      checked={goals.includes(goal)}
                      onCheckedChange={(checked) => handleGoalChange(goal, checked as boolean)}
                    />
                    <Label htmlFor={goal} className="cursor-pointer">{goal}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < 4 ? (
              <Button
                className="glow-gradient text-white"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
              >
                Next
              </Button>
            ) : (
              <Button
                className="glow-gradient text-white"
                onClick={handleComplete}
                disabled={!canProceed()}
              >
                Get My Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
