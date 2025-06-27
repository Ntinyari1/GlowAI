import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, CheckCircle, Star, Calendar, Lightbulb, Heart } from "lucide-react";
import { UserStats } from "@/lib/types";

export default function Dashboard() {
  // Get user profile from localStorage for demo
  const skinProfile = JSON.parse(localStorage.getItem('skinProfile') || '{}');
  
  // Mock user stats - in a real app, this would come from the API
  const userStats: UserStats = {
    tipsCompleted: 87,
    productsReviewed: 23,
    dayStreak: 42
  };

  const { data: userActivity } = useQuery({
    queryKey: ['/api/users/1/activity'],
    retry: false,
  });

  const recentActivities = [
    {
      type: 'completed_tip',
      description: 'Completed morning routine tip',
      timeAgo: '2 hours ago',
      icon: Lightbulb,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      type: 'saved_product',
      description: 'Saved CeraVe Hydrating Cleanser',
      timeAgo: '5 hours ago',
      icon: Heart,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      type: 'reviewed_product',
      description: 'Reviewed The Ordinary Niacinamide',
      timeAgo: '1 day ago',
      icon: Star,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    }
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Your Personal Dashboard</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Track your skincare journey with personalized insights and recommendations</p>
        </div>
        
        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-none">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 glow-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="text-white w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Welcome Back!</h3>
                  <p className="text-gray-600">
                    {skinProfile.skinType ? `${skinProfile.skinType} Skin` : 'Complete your profile'}
                  </p>
                </div>
                
                {skinProfile.skinType ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Skin Type</span>
                      <Badge className="capitalize">{skinProfile.skinType}</Badge>
                    </div>
                    {skinProfile.concerns && skinProfile.concerns.length > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Main Concerns</span>
                        <span className="font-medium text-gray-800 text-sm text-right">
                          {skinProfile.concerns.slice(0, 2).join(', ')}
                        </span>
                      </div>
                    )}
                    {skinProfile.goals && skinProfile.goals.length > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Goals</span>
                        <span className="font-medium text-gray-800 text-sm text-right">
                          {skinProfile.goals[0]}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-600">
                    <p className="mb-4">Complete your skin profile to get personalized recommendations</p>
                  </div>
                )}
                
                <Button className="w-full mt-6 glow-gradient-soft text-glow-purple font-semibold">
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Overview */}
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Your Glow Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="text-green-600 w-8 h-8" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{userStats.tipsCompleted}</p>
                    <p className="text-gray-600">Tips Completed</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Star className="text-blue-600 w-8 h-8" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{userStats.productsReviewed}</p>
                    <p className="text-gray-600">Products Reviewed</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Calendar className="text-purple-600 w-8 h-8" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{userStats.dayStreak}</p>
                    <p className="text-gray-600">Day Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => {
                    const IconComponent = activity.icon;
                    return (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-10 h-10 ${activity.bgColor} rounded-full flex items-center justify-center`}>
                          <IconComponent className={`${activity.iconColor} w-5 h-5`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{activity.description}</p>
                          <p className="text-sm text-gray-600">{activity.timeAgo}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
