import { useState } from "react";
import { Calendar, Clock, Share2, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialAccounts, SocialSharing } from "@/components/social-sharing";
import { useQuery } from "@tanstack/react-query";
import type { SocialPost } from "@shared/schema";

export default function Social() {
  const userId = 1; // Current user ID

  const { data: posts = [], isLoading } = useQuery<SocialPost[]>({
    queryKey: [`/api/users/${userId}/social-posts`],
  });

  const { data: scheduledPosts = [] } = useQuery<SocialPost[]>({
    queryKey: [`/api/users/${userId}/scheduled-posts`],
  });

  // Mock scheduled posts based on design
  const mockScheduledPosts = [
    {
      id: 1,
      platform: "instagram",
      content: "Morning skincare routine for dry skin in winter ❄️✨",
      scheduledFor: "2:00 PM Today",
      status: "scheduled" as const,
      type: "Tip"
    },
    {
      id: 2,
      platform: "lovable",
      content: "Review: The Ordinary Hyaluronic Acid - Is it worth the hype? 🤔",
      scheduledFor: "6:00 PM Today",
      status: "scheduled" as const,
      type: "Review"
    },
    {
      id: 3,
      platform: "twitter",
      content: "Quick tip: Double cleansing method for makeup removal 💄",
      scheduledFor: "9:00 AM Tomorrow",
      status: "scheduled" as const,
      type: "Tip"
    }
  ];

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "instagram":
        return "bg-pink-100 text-pink-600";
      case "facebook":
        return "bg-blue-100 text-blue-600";
      case "twitter":
        return "bg-gray-100 text-gray-600";
      case "lovable":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Media Automation</h1>
          <p className="text-gray-600 mt-2">
            Our AI automatically shares your personalized skincare content across all your social platforms, 3 times daily for maximum engagement
          </p>
        </div>
        <SocialSharing 
          content="Check out my new skincare routine! 🌟" 
          title="Share Content"
        />
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Social Performance</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Posts</TabsTrigger>
          <TabsTrigger value="accounts">Connect Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <SocialAccounts userId={userId} />
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Scheduled Posts</h2>
            <Button className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Schedule New Post
            </Button>
          </div>

          <div className="space-y-4">
            {mockScheduledPosts.map((post) => (
              <Card key={post.id} className="border-l-4 border-l-pink-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge 
                          variant="secondary" 
                          className={getPlatformColor(post.platform)}
                        >
                          {post.type}
                        </Badge>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.scheduledFor}
                        </span>
                        <Badge variant="outline" className="capitalize">
                          {post.platform}
                        </Badge>
                      </div>
                      <p className="text-gray-900 font-medium mb-2">{post.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <SocialAccounts userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}