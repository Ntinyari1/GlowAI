import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { mockApi } from "@/lib/mockApi";

interface TipCardProps {
  tip: {
    id: number;
    title: string;
    content: string;
    category: string;
    timeOfDay?: string;
    imageUrl?: string;
    likes: number;
  };
}

export default function TipCard({ tip }: TipCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();

  const likeMutation = useMutation({
    mutationFn: async () => {
      await mockApi.likeTip(tip.id);
    },
    onSuccess: () => {
      setIsLiked(true);
      queryClient.invalidateQueries({ queryKey: ['/api/tips'] });
    },
  });

  const getTimeOfDayColor = (timeOfDay?: string) => {
    switch (timeOfDay) {
      case 'morning':
        return 'bg-yellow-100 text-yellow-800';
      case 'afternoon':
        return 'bg-orange-100 text-orange-800';
      case 'evening':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tip.title,
        text: tip.content,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`${tip.title}: ${tip.content}`);
      toast({
        title: "Tip copied!",
        description: "The tip has been copied to your clipboard.",
      });
    }
  };

  return (
    <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow">
      {tip.imageUrl && (
        <img 
          src={tip.imageUrl} 
          alt={tip.title}
          className="w-full h-48 object-cover"
        />
      )}
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge className={`text-xs font-semibold px-3 py-1 ${getTimeOfDayColor(tip.timeOfDay)}`}>
            {tip.timeOfDay ? tip.timeOfDay.charAt(0).toUpperCase() + tip.timeOfDay.slice(1) : tip.category}
          </Badge>
          <span className="text-gray-500 text-sm">Just now</span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{tip.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{tip.content}</p>
        
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending || isLiked}
            className={`flex items-center space-x-2 ${
              isLiked ? 'text-red-500' : 'text-glow-pink hover:text-glow-purple'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{tip.likes + (isLiked ? 1 : 0)}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-gray-500 hover:text-glow-pink"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
