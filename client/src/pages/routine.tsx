import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoutineSection from "@/components/routine-section";
import { SocialSharing } from "@/components/social-sharing";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Save, Share2, RotateCcw, Sparkles } from "lucide-react";
import { RoutineStep } from "@/lib/types";

export default function Routine() {
  const [morningSteps, setMorningSteps] = useState<RoutineStep[]>([]);
  const [eveningSteps, setEveningSteps] = useState<RoutineStep[]>([]);
  const skinProfile = JSON.parse(localStorage.getItem('skinProfile') || '{}');

  const { data: userRoutines } = useQuery({
    queryKey: ['/api/users/1/routines'],
    retry: false,
  });

  const generateRoutineMutation = useMutation({
    mutationFn: async (routineType: 'morning' | 'evening') => {
      const response = await apiRequest('POST', '/api/ai/generate-routine', {
        skinType: skinProfile.skinType || 'normal',
        concerns: skinProfile.concerns || [],
        goals: skinProfile.goals || [],
        routineType
      });
      return response.json();
    },
    onSuccess: (data, routineType) => {
      const steps: RoutineStep[] = data.steps.map((step: any) => ({
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
  });

  const saveRoutineMutation = useMutation({
    mutationFn: async () => {
      // Save both routines
      if (morningSteps.length > 0) {
        await apiRequest('POST', '/api/routines', {
          userId: 1,
          type: 'morning',
          products: morningSteps
        });
      }
      if (eveningSteps.length > 0) {
        await apiRequest('POST', '/api/routines', {
          userId: 1,
          type: 'evening',
          products: eveningSteps
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/routines'] });
    },
  });

  const handleReset = () => {
    setMorningSteps([]);
    setEveningSteps([]);
  };

  // Load default routines if none exist
  const loadDefaultRoutines = () => {
    if (morningSteps.length === 0) {
      setMorningSteps([
        { order: 1, category: "cleanser", productName: "CeraVe Hydrating Cleanser", description: "Gentle daily cleanser" },
        { order: 2, category: "serum", productName: "The Ordinary Niacinamide 10%", description: "Targeted treatment serum" },
        { order: 3, category: "moisturizer", productName: "Neutrogena Oil-Free Gel", description: "Hydrating moisturizer" },
        { order: 4, category: "sunscreen", productName: "Neutrogena Ultra Sheer SPF 60", description: "Broad spectrum protection" },
      ]);
    }
    
    if (eveningSteps.length === 0) {
      setEveningSteps([
        { order: 1, category: "cleanser", productName: "DHC Deep Cleansing Oil", description: "Oil cleanser for makeup removal" },
        { order: 2, category: "cleanser", productName: "CeraVe Hydrating Cleanser", description: "Water-based cleanser" },
        { order: 3, category: "treatment", productName: "The Ordinary Retinol 0.5%", description: "Anti-aging treatment" },
        { order: 4, category: "moisturizer", productName: "CeraVe PM Facial Lotion", description: "Nourishing night moisturizer" },
      ]);
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
