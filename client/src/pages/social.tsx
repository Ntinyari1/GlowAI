import { useState } from "react";
import { Calendar, Clock, Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SocialPlatform = 'facebook' | 'instagram' | 'twitter';

type SocialAccount = {
  id: string;
  platform: SocialPlatform;
  username: string;
  connected: boolean;
  followers?: number;
  avatar?: string;
};

type ScheduledPost = {
  id: string;
  content: string;
  platform: 'facebook' | 'instagram' | 'twitter';
  scheduledFor: Date;
  status: 'scheduled' | 'published' | 'failed';
  mediaUrl?: string;
};

export default function Social() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | ''>('');
  const [postContent, setPostContent] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Mock data for social accounts
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    {
      id: '1',
      platform: 'facebook',
      username: 'user_facebook',
      connected: false,
      followers: 0
    },
    {
      id: '2',
      platform: 'instagram',
      username: 'user_instagram',
      connected: false,
      followers: 0
    },
    {
      id: '3',
      platform: 'twitter',
      username: 'user_twitter',
      connected: false,
      followers: 0
    }
  ]);

  // Mock data for scheduled posts
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);

  const handleConnectAccount = (platform: SocialPlatform) => {
    // OAuth endpoints for each platform
    const oauthEndpoints = {
      facebook: 'https://www.facebook.com/v12.0/dialog/oauth',
      instagram: 'https://api.instagram.com/oauth/authorize',
      twitter: 'https://twitter.com/i/oauth2/authorize'
    };

    // In a real app, you would use your actual OAuth client IDs and redirect URIs
    const clientIds = {
      facebook: 'YOUR_FACEBOOK_APP_ID',
      instagram: 'YOUR_INSTAGRAM_APP_ID',
      twitter: 'YOUR_TWITTER_CLIENT_ID'
    };

    const redirectUris = {
      facebook: `${window.location.origin}/auth/facebook/callback`,
      instagram: `${window.location.origin}/auth/instagram/callback`,
      twitter: `${window.location.origin}/auth/twitter/callback`
    };

    // OAuth parameters for each platform
    const oauthParams = {
      facebook: new URLSearchParams({
        client_id: clientIds.facebook,
        redirect_uri: redirectUris.facebook,
        state: JSON.stringify({ platform }), // Include platform in state for callback
        scope: 'pages_show_list,pages_read_engagement,pages_manage_posts',
        response_type: 'code',
        auth_type: 'rerequest',
        display: 'popup',
      }),
      instagram: new URLSearchParams({
        client_id: clientIds.instagram,
        redirect_uri: redirectUris.instagram,
        scope: 'user_profile,user_media',
        response_type: 'code',
        state: JSON.stringify({ platform }),
      }),
      twitter: new URLSearchParams({
        client_id: clientIds.twitter,
        redirect_uri: redirectUris.twitter,
        response_type: 'code',
        state: JSON.stringify({ platform }),
        scope: 'tweet.read users.read offline.access',
        code_challenge: 'challenge', // In a real app, implement PKCE
        code_challenge_method: 'plain',
      })
    };

    // Open the OAuth login page in a new window
    const width = 600;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const authWindow = window.open(
      `${oauthEndpoints[platform]}?${oauthParams[platform].toString()}`,
      `${platform}OAuth`, 
      `toolbar=no, location=no, directories=no, status=no, menubar=no, 
      scrollbars=no, resizable=no, copyhistory=no, width=${width}, 
      height=${height}, top=${top}, left=${left}`
    );

    // In a real app, you would listen for the OAuth callback
    // and update the account status when authorization is complete
    // For now, we'll simulate a successful connection after a short delay
    const checkAuthStatus = () => {
      // Check if authWindow was successfully opened
      if (!authWindow || authWindow.closed) {
        // If the window was closed or failed to open, don't proceed
        return;
      }
      
      // Close the auth window and update the account status
      try {
        authWindow.close();
        setAccounts(accounts.map(acc => 
          acc.platform === platform 
            ? { ...acc, connected: true, followers: Math.floor(Math.random() * 1000) + 100 } 
            : acc
        ));
      } catch (error) {
        console.error('Error during OAuth flow:', error);
      }
    };
    
    // Check after a short delay
    setTimeout(checkAuthStatus, 2000);
  };

  const handleDisconnectAccount = (platform: SocialPlatform) => {
    setAccounts(accounts.map(acc => 
      acc.platform === platform ? { ...acc, connected: false, followers: 0 } : acc
    ));
  };

  const handleSchedulePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent || !scheduledTime || !selectedPlatform) return;

    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      content: postContent,
      platform: selectedPlatform,
      scheduledFor: new Date(scheduledTime),
      status: 'scheduled'
    };

    setScheduledPosts([...scheduledPosts, newPost]);
    setPostContent('');
    setScheduledTime('');
    setSelectedPlatform('');
    setIsCreatingPost(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'bg-blue-100 text-blue-600';
      case 'instagram': return 'bg-gradient-to-r from-pink-500 to-yellow-500 text-white';
      case 'twitter': return 'bg-blue-400 text-white';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Media</h1>
          <p className="text-gray-600 mt-1">
            Manage your social media presence and scheduled posts
          </p>
        </div>
        <Dialog open={isCreatingPost} onOpenChange={setIsCreatingPost}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600">
              <Plus className="h-4 w-4 mr-2" /> Create Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Post</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSchedulePost} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Platform</label>
                <Select 
                  onValueChange={(value: SocialPlatform) => setSelectedPlatform(value)} 
                  value={selectedPlatform}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Post Content</label>
                <Textarea 
                  placeholder="What's on your mind?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Schedule Time</label>
                <Input 
                  type="datetime-local" 
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreatingPost(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600">
                  Schedule Post
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Track your social media performance and engagement metrics here.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">
                  Analytics and insights coming soon!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {scheduledPosts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No scheduled posts yet.</p>
                  <Button 
                    className="mt-4" 
                    variant="outline"
                    onClick={() => setIsCreatingPost(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Schedule Your First Post
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledPosts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPlatformColor(post.platform)}`}>
                            <span className="text-xs font-medium">{post.platform[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-medium">{post.content.substring(0, 60)}{post.content.length > 60 ? '...' : ''}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Scheduled for {formatDate(post.scheduledFor)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setScheduledPosts(scheduledPosts.filter(p => p.id !== post.id))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        account.platform === 'facebook' ? 'bg-blue-100 text-blue-600' :
                        account.platform === 'instagram' ? 'bg-pink-100 text-pink-600' :
                        'bg-blue-400 text-white'
                      }`}>
                        <span className="font-medium">
                          {account.platform === 'facebook' ? 'F' : account.platform === 'instagram' ? 'IG' : 'X'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium capitalize">{account.platform}</p>
                        <p className="text-sm text-gray-500">
                          {account.connected 
                            ? `${account.followers?.toLocaleString()} followers` 
                            : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    {account.connected ? (
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center space-x-1"
                          onClick={() => handleDisconnectAccount(account.platform)}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Disconnect</span>
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleConnectAccount(account.platform)}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                ))}
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-dashed">
                  <h3 className="font-medium text-gray-900">Add More Accounts</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-3">Connect more social media accounts to manage them in one place</p>
                  <div className="flex flex-wrap gap-2">
                    {['pinterest', 'linkedin', 'tiktok'].map((platform) => (
                      <Button 
                        key={platform}
                        variant="outline" 
                        size="sm"
                        className="capitalize"
                        disabled
                        title="Coming soon"
                      >
                        {platform}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}