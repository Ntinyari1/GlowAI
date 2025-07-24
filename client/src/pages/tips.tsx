import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TipCard from "@/components/tip-card";
import { queryClient } from "@/lib/queryClient";
import { Sparkles } from "lucide-react";
import { generateFreshTip, getDailyTip } from "@/services/gpt2Service";
import { X } from "lucide-react";

export default function Tips() {
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>("all");
  const [showProfile, setShowProfile] = useState(true);
  const skinProfile = JSON.parse(localStorage.getItem('skinProfile') || '{}');

  const fetchTips = async (skinType: string, limit?: number) => {
    const params = new URLSearchParams();
    if (skinType) {
      params.append('skinType', skinType);
    }
    if (limit) {
      params.append('limit', limit.toString());
    }
    const res = await fetch(`/api/tips?${params.toString()}`);
    if (!res.ok) {
      throw new Error('Failed to fetch tips');
    }
    return await res.json();
  };

  const { data: tips, isLoading } = useQuery({
    queryKey: ['/api/tips', skinProfile.skinType],
    queryFn: () => fetchTips(skinProfile.skinType),
    retry: false,
  });

  const [generatedTips, setGeneratedTips] = useState<any[]>([]);

  const generateTipMutation = useMutation({
    mutationFn: async (timeOfDay: string) => {
      try {
        // Use frontend GPT-2 service instead of backend API
        const tipContent = await generateFreshTip(skinProfile.skinType, timeOfDay);
        
        // Create and return a new tip object that matches the expected format for TipCard
        return {
          id: Date.now(), // Use timestamp as a temporary ID
          title: `${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} Tip`,
          content: tipContent,
          category: 'ai_generated',
          timeOfDay: timeOfDay,
          likes: 0,
          isNew: true // Flag to identify newly generated tips
        };
      } catch (error) {
        console.error('Error generating tip:', error);
        throw error;
      }
    },
    onSuccess: (newTip) => {
      // Add the new tip to our local state
      setGeneratedTips(prev => [newTip, ...prev]);
      // Also invalidate the query to refresh the list from the server
      queryClient.invalidateQueries({ queryKey: ['/api/tips'] });
    },
  });

  

  // Combine server tips with locally generated tips
  const allTips = [
    ...(tips || []),
    ...generatedTips
  ];

  const filteredTips = allTips.filter((tip: any) => {
    return selectedTimeOfDay === "all" || tip.timeOfDay === selectedTimeOfDay;
  }) || [];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Today's Skincare Wisdom</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Fresh AI-generated tips personalized for your skin's unique needs
          </p>
        </div>
        {/* Skin Profile Summary */}
        {showProfile && skinProfile && skinProfile.skinType && (
          <div className="mb-8 p-6 bg-white/80 rounded-xl shadow text-center relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              aria-label="Close profile summary"
              onClick={() => setShowProfile(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Skin Profile</h2>
            <div className="mb-2"><strong>Skin Type:</strong> {skinProfile.skinType}</div>
            {skinProfile.concerns && skinProfile.concerns.length > 0 && (
              <div className="mb-2"><strong>Concerns:</strong> {skinProfile.concerns.join(', ')}</div>
            )}
        {skinProfile.age && (
          <div className="mb-2"><strong>Age:</strong> {skinProfile.age}</div>
        )}
            {skinProfile.goals && skinProfile.goals.length > 0 && (
              <div className="mb-2"><strong>Goals:</strong> {skinProfile.goals.join(', ')}</div>
            )}
          </div>
        )}
        {!showProfile && skinProfile && skinProfile.skinType && (
          <div className="mb-8 flex justify-center">
            <Button variant="outline" size="sm" onClick={() => setShowProfile(true)}>
              Show Skin Profile
            </Button>
          </div>
        )}

        {/* Generate New Tip */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Button
            onClick={() => generateTipMutation.mutate('morning')}
            disabled={generateTipMutation.isPending}
            className="glow-gradient text-white"
          >
            <Sparkles className="mr-2 w-4 h-4" />
            Generate Morning Tip
          </Button>
          <Button
            onClick={() => generateTipMutation.mutate('afternoon')}
            disabled={generateTipMutation.isPending}
            className="glow-gradient text-white"
          >
            <Sparkles className="mr-2 w-4 h-4" />
            Generate Afternoon Tip
          </Button>
          <Button
            onClick={() => generateTipMutation.mutate('evening')}
            disabled={generateTipMutation.isPending}
            className="glow-gradient text-white"
          >
            <Sparkles className="mr-2 w-4 h-4" />
            Generate Evening Tip
          </Button>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Badge
            variant={selectedTimeOfDay === "all" ? "default" : "secondary"}
            className={`cursor-pointer px-6 py-2 ${
              selectedTimeOfDay === "all" ? "glow-gradient text-white" : "hover:bg-gray-100"
            }`}
            onClick={() => setSelectedTimeOfDay("all")}
          >
            All Tips
          </Badge>
          <Badge
            variant={selectedTimeOfDay === "morning" ? "default" : "secondary"}
            className={`cursor-pointer px-6 py-2 ${
              selectedTimeOfDay === "morning" ? "glow-gradient text-white" : "hover:bg-gray-100"
            }`}
            onClick={() => setSelectedTimeOfDay("morning")}
          >
            Morning
          </Badge>
          <Badge
            variant={selectedTimeOfDay === "afternoon" ? "default" : "secondary"}
            className={`cursor-pointer px-6 py-2 ${
              selectedTimeOfDay === "afternoon" ? "glow-gradient text-white" : "hover:bg-gray-100"
            }`}
            onClick={() => setSelectedTimeOfDay("afternoon")}
          >
            Afternoon
          </Badge>
          <Badge
            variant={selectedTimeOfDay === "evening" ? "default" : "secondary"}
            className={`cursor-pointer px-6 py-2 ${
              selectedTimeOfDay === "evening" ? "glow-gradient text-white" : "hover:bg-gray-100"
            }`}
            onClick={() => setSelectedTimeOfDay("evening")}
          >
            Evening
          </Badge>
        </div>

        {/* Tips Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-2xl mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTips.map((tip: any) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>
        )}

        {filteredTips.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No tips found. Generate some personalized tips above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
