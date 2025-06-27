import { useState } from "react";
import { Share2, Instagram, Facebook, Twitter, Calendar, BarChart3, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockApi } from "@/lib/mockApi";
import type { SocialAccount, SocialPost } from "@shared/schema";

interface SocialSharingProps {
  routineId?: number;
  tipId?: number;
  content: string;
  title: string;
}

interface SocialAccountsProps {
  userId: number;
}

export function SocialAccounts({ userId }: SocialAccountsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery<SocialAccount[]>({
    queryKey: [`/api/users/${userId}/social-accounts`],
  });

  const { data: socialStats } = useQuery({
    queryKey: [`/api/users/${userId}/social-posts`],
    select: (posts: SocialPost[]) => {
      const totalReach = 47300; // Mock data based on design
      const weeklyGrowth = 23;
      
      return {
        totalReach,
        weeklyGrowth,
        platforms: [
          {
            name: "Instagram",
            followers: "12.5K",
            engagement: "8.2%",
            icon: Instagram,
            connected: true,
            color: "bg-pink-100 text-pink-600"
          },
          {
            name: "Facebook", 
            followers: "8.9K",
            engagement: "5.7%",
            icon: Facebook,
            connected: true,
            color: "bg-blue-100 text-blue-600"
          },
          {
            name: "X (Twitter)",
            followers: "6.2K", 
            engagement: "4.1%",
            icon: Twitter,
            connected: false,
            color: "bg-gray-100 text-gray-600"
          }
        ]
      };
    }
  });

  const connectMutation = useMutation({
    mutationFn: async (platform: string) => {
      return mockApi.connectSocialAccount({
        userId,
        platform,
        accountId: `${platform}_${userId}`,
        status: "connected"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/social-accounts`] });
      toast({
        title: "Account Connected",
        description: "Social media account connected successfully!"
      });
    }
  });

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-pink-600" />
            Total Reach This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-pink-600">
              {socialStats?.totalReach.toLocaleString() || "47.3K"}
            </span>
            <Badge variant="secondary" className="bg-pink-100 text-pink-700">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{socialStats?.weeklyGrowth || 23}% vs last week
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Social Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Social Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialStats?.platforms.map((platform) => (
            <div key={platform.name} className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${platform.color}`}>
                  <platform.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{platform.name}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Followers: {platform.followers}</span>
                    <span>Engagement: {platform.engagement}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                {platform.connected ? (
                  <Badge variant="default" className="bg-green-100 text-green-700">
                    Connected
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => connectMutation.mutate(platform.name.toLowerCase())}
                    disabled={connectMutation.isPending}
                  >
                    {connectMutation.isPending ? "Connecting..." : "Connect"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Connect Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Connect Your Accounts
          </CardTitle>
          <CardDescription>
            Connect your social media accounts to automatically share your skincare content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {["instagram", "facebook", "twitter"].map((platform) => {
            const isConnected = accounts.some(acc => acc.platform === platform && acc.status === "connected");
            return (
              <div key={platform} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {platform === "instagram" && <Instagram className="h-5 w-5 text-pink-600" />}
                  {platform === "facebook" && <Facebook className="h-5 w-5 text-blue-600" />}
                  {platform === "twitter" && <Twitter className="h-5 w-5 text-gray-600" />}
                  <span className="font-medium capitalize">{platform}</span>
                </div>
                {isConnected ? (
                  <Badge variant="default" className="bg-green-100 text-green-700">
                    Connected
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => connectMutation.mutate(platform)}
                    disabled={connectMutation.isPending}
                  >
                    Connect
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export function SocialSharing({ routineId, tipId, content, title }: SocialSharingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [postContent, setPostContent] = useState(content);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      return mockApi.createSocialPost(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/1/social-posts"] });
      setIsOpen(false);
      toast({
        title: "Post Scheduled",
        description: "Your content has been scheduled for sharing!"
      });
    }
  });

  const handleShare = () => {
    if (!selectedPlatforms.length) {
      toast({
        title: "Select Platforms",
        description: "Please select at least one platform to share to.",
        variant: "destructive"
      });
      return;
    }

    selectedPlatforms.forEach(platform => {
      createPostMutation.mutate({
        userId: 1,
        platform,
        content: postContent,
        routineId,
        tipId,
        scheduledFor: scheduledDate ? new Date(scheduledDate) : new Date(),
        status: scheduledDate ? "scheduled" : "published"
      });
    });
  };

  const platforms = [
    { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-600" },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-600" },
    { id: "twitter", name: "X (Twitter)", icon: Twitter, color: "text-gray-600" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share to Social Media</DialogTitle>
          <DialogDescription>
            Share your {routineId ? "routine" : "tip"} across your social platforms
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="content">Post Content</Label>
            <Textarea
              id="content"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Write your post content..."
              className="mt-1"
            />
          </div>

          <div>
            <Label>Select Platforms</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {platforms.map(platform => (
                <label
                  key={platform.id}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlatforms([...selectedPlatforms, platform.id]);
                      } else {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id));
                      }
                    }}
                    className="rounded"
                  />
                  <platform.icon className={`h-5 w-5 ${platform.color}`} />
                  <span>{platform.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="schedule">Schedule Post (Optional)</Label>
            <Input
              id="schedule"
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleShare}
              disabled={createPostMutation.isPending}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              {createPostMutation.isPending ? "Sharing..." : scheduledDate ? "Schedule Post" : "Share Now"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}