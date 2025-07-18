import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoutineSection from "@/components/routine-section";
import { SocialSharing } from "@/components/social-sharing";
import { mockApi } from "@/lib/mockApi";
import { Save, Share2, RotateCcw, Sparkles } from "lucide-react";
import { RoutineStep } from "@/lib/types";

export default function Routine() {
  const [morningSteps, setMorningSteps] = useState<RoutineStep[]>([]);
  const [eveningSteps, setEveningSteps] = useState<RoutineStep[]>([]);
  const skinProfile = JSON.parse(localStorage.getItem('skinProfile') || '{}');
  const routinePref = skinProfile.routinePref || 'standard';
  const [showPrefDropdown, setShowPrefDropdown] = useState(false);
  const routinePrefOptions = [
    { value: 'simple', label: 'Simple (3 easy steps)', desc: ['Cleanser', 'Moisturizer', 'Sunscreen'] },
    { value: 'standard', label: 'Standard (5 steps)', desc: ['Cleanser', 'Serum', 'Moisturizer', 'Sunscreen', 'Toner'] },
    { value: 'advanced', label: 'Advanced (7+ steps)', desc: ['Cleanser', 'Serum', 'Moisturizer', 'Sunscreen', 'Toner', 'Eye Cream', 'Essence'] },
  ];
  const currentPref = routinePrefOptions.find(opt => opt.value === routinePref) || routinePrefOptions[1];

  // Helper to get step count based on preference
  const getStepCount = (type: 'morning' | 'evening') => {
    if (routinePref === 'simple') return 3;
    if (routinePref === 'advanced') return 7;
    return 5;
  };

  // Default steps for each type
  const defaultSteps = {
    morning: [
      { category: 'cleanser', productName: 'CeraVe Hydrating Cleanser', description: 'Gentle daily cleanser' },
      { category: 'serum', productName: 'The Ordinary Niacinamide 10%', description: 'Targeted treatment serum' },
      { category: 'moisturizer', productName: 'Neutrogena Oil-Free Gel', description: 'Hydrating moisturizer' },
      { category: 'sunscreen', productName: 'Neutrogena Ultra Sheer SPF 60', description: 'Broad spectrum protection' },
      { category: 'eye cream', productName: 'L’Oreal Eye Defense', description: 'Brightens and protects eye area' },
      { category: 'toner', productName: 'Pixi Glow Tonic', description: 'Exfoliating toner' },
      { category: 'essence', productName: 'Cosrx Advanced Snail 96', description: 'Hydrating essence' },
    ],
    evening: [
      { category: 'cleanser', productName: 'DHC Deep Cleansing Oil', description: 'Oil cleanser for makeup removal' },
      { category: 'cleanser', productName: 'CeraVe Hydrating Cleanser', description: 'Water-based cleanser' },
      { category: 'treatment', productName: 'The Ordinary Retinol 0.5%', description: 'Anti-aging treatment' },
      { category: 'moisturizer', productName: 'CeraVe PM Facial Lotion', description: 'Nourishing night moisturizer' },
      { category: 'toner', productName: 'Kiehl’s Calendula Toner', description: 'Soothing toner' },
      { category: 'mask', productName: 'Laneige Water Sleeping Mask', description: 'Hydrating overnight mask' },
      { category: 'eye cream', productName: 'L’Oreal Eye Defense', description: 'Brightens and protects eye area' },
    ]
  };

  const handlePrefChange = (val: string) => {
    localStorage.setItem('skinProfile', JSON.stringify({ ...skinProfile, routinePref: val }));
    setShowPrefDropdown(false);
    window.location.reload(); // reload to apply new steps
  };

  const { data: userRoutines } = useQuery({
    queryKey: ['/api/users/1/routines'],
    retry: false,
  });

  const generateRoutineMutation = useMutation({
    mutationFn: async (routineType: 'morning' | 'evening') => {
      const routine = await mockApi.generateRoutine(skinProfile, routineType);
      const steps: RoutineStep[] = routine.steps.map((step: any) => ({
        order: step.order,
        category: step.category,
        description: step.description,
        productName: `Recommended ${step.category}`
      }));
      
      if (routineType === 'morning') {
        setMorningSteps(steps);
      } else {
        setEveningSteps(steps);
      }
    },
    onSuccess: (data, routineType) => {
      // Handle success
    },
  });

  const saveRoutineMutation = useMutation({
    mutationFn: async () => {
      // Save both routines
      if (morningSteps.length > 0) {
        await mockApi.createRoutine({
          userId: 1,
          type: 'morning',
          products: morningSteps
        });
      }
      if (eveningSteps.length > 0) {
        await mockApi.createRoutine({
          userId: 1,
          type: 'evening',
          products: eveningSteps
        });
      }
    },
    onSuccess: () => {
      // Handle success
    },
  });

  const handleReset = () => {
    setMorningSteps([]);
    setEveningSteps([]);
  };

  // Load default routines if none exist
  const loadDefaultRoutines = () => {
    if (morningSteps.length === 0) {
      setMorningSteps(defaultSteps.morning.slice(0, getStepCount('morning')).map((step, i) => ({ ...step, order: i + 1 })));
    }
    if (eveningSteps.length === 0) {
      setEveningSteps(defaultSteps.evening.slice(0, getStepCount('evening')).map((step, i) => ({ ...step, order: i + 1 })));
    }
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Build Your Perfect Routine</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create a personalized skincare routine based on your skin type, concerns, and goals
          </p>
          <div className="mt-4 flex flex-col items-center">
            <button
              type="button"
              className="inline-block bg-white text-glow-purple border border-glow-purple text-sm font-semibold px-4 py-2 rounded-full shadow hover:bg-glow-lavender/30 focus:outline-none focus:ring-2 focus:ring-glow-pink"
              onClick={() => setShowPrefDropdown(v => !v)}
            >
              Routine Preference: {currentPref.label}
            </button>
            {showPrefDropdown && (
              <div className="mt-2 bg-white border border-glow-purple rounded-lg shadow-lg z-10">
                {routinePrefOptions.map(opt => (
                  <div
                    key={opt.value}
                    className={`px-4 py-2 cursor-pointer hover:bg-glow-lavender/30 ${routinePref === opt.value ? 'font-bold text-glow-purple' : ''}`}
                    onClick={() => handlePrefChange(opt.value)}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2 text-xs text-gray-700 text-center">
              <span className="font-semibold">Typical steps:</span> {currentPref.desc.join(', ')}
            </div>
          </div>
        </div>

        {/* AI Generation Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Button
            onClick={() => generateRoutineMutation.mutate('morning')}
            disabled={generateRoutineMutation.isPending}
            className="glow-gradient text-white"
          >
            <Sparkles className="mr-2 w-4 h-4" />
            Generate Morning Routine
          </Button>
          <Button
            onClick={() => generateRoutineMutation.mutate('evening')}
            disabled={generateRoutineMutation.isPending}
            className="glow-gradient text-white"
          >
            <Sparkles className="mr-2 w-4 h-4" />
            Generate Evening Routine
          </Button>
          <Button
            onClick={loadDefaultRoutines}
            variant="outline"
            className="border-glow-purple text-glow-purple"
          >
            Load Sample Routines
          </Button>
          <SocialSharing 
            content={`Check out my personalized skincare routine! ${morningSteps.length > 0 ? `Morning: ${morningSteps.length} steps` : ''} ${eveningSteps.length > 0 ? `Evening: ${eveningSteps.length} steps` : ''} #skincare #glowai`}
            title="Share My Routine"
          />
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Routine Timeline */}
          <div className="grid md:grid-cols-2 gap-8">
            <RoutineSection
              title="Morning Routine"
              icon="sun"
              steps={morningSteps}
              onStepsChange={setMorningSteps}
            />
            
            <RoutineSection
              title="Evening Routine"
              icon="moon"
              steps={eveningSteps}
              onStepsChange={setEveningSteps}
            />
          </div>

          {/* Routine Actions */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => saveRoutineMutation.mutate()}
              disabled={saveRoutineMutation.isPending || (morningSteps.length === 0 && eveningSteps.length === 0)}
              className="glow-gradient text-white px-8 py-4"
            >
              <Save className="mr-2 w-4 h-4" />
              Save Routine
            </Button>
            
            <Button
              variant="outline"
              className="px-8 py-4 border-2 border-glow-purple text-glow-purple"
            >
              <Share2 className="mr-2 w-4 h-4" />
              Share Routine
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReset}
              className="px-8 py-4"
            >
              <RotateCcw className="mr-2 w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
