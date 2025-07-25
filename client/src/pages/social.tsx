import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Plus, Trash2, X, Loader2, Edit, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  getConnectedAccounts, 
  getScheduledPosts, 
  connectAccount, 
  disconnectAccount, 
  schedulePost, 
  deleteScheduledPost 
} from "@/services/socialService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SocialPlatform = 'facebook' | 'instagram' | 'twitter';

interface SocialAccount {
  _id?: string;
  id: string;
  platform: SocialPlatform;
  username: string;
  connected: boolean;
  followers: number;
  avatar?: string;
};

interface ScheduledPost {
  _id?: string;
  id: string;
  platform: SocialPlatform;
  content: string;
  scheduledTime: string | Date;
  status: 'scheduled' | 'posted' | 'failed';
  mediaUrl?: string;
};

const supportedPlatforms: SocialPlatform[] = ['facebook', 'instagram', 'twitter'];

const getPlatformColor = (platform: SocialPlatform) => {
  switch (platform) {
    case 'facebook':
      return 'bg-blue-500 text-white';
    case 'instagram':
      return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
    case 'twitter':
      return 'bg-blue-400 text-white';
    default:
      return 'bg-gray-200';
  }
};

const formatDate = (date: string | Date) => {
  if (!date) {
    return 'N/A';
  }
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM d, yyyy h:mm a');
};

export default function Social() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | ''>('');
  const [postContent, setPostContent] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);

  // Mock data for social accounts
  const mockAccounts: SocialAccount[] = [
    {
      id: '1',
      _id: '1',
      platform: 'facebook',
      username: 'user_facebook',
      connected: false,
      followers: 0
    },
    {
      id: '2',
      _id: '2',
      platform: 'instagram',
      username: 'user_instagram',
      connected: false,
      followers: 0
    },
    {
      id: '3',
      _id: '3',
      platform: 'twitter',
      username: 'user_twitter',
      connected: false,
      followers: 0
    }
  ];

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Try to load from backend first
        try {
          const [accountsData, postsData] = await Promise.all([
            getConnectedAccounts(),
            getScheduledPosts()
          ]);
          // Map backend data to local types
          setAccounts((accountsData || mockAccounts).map(acc => ({
            id: acc._id,
            _id: acc._id,
            platform: acc.platform as SocialPlatform,
            username: acc.username,
            connected: acc.connected,
            followers: acc.followers || 0,
            avatar: acc.avatar
          })));
          setScheduledPosts((postsData || []).map(post => ({
            id: post._id,
            _id: post._id,
            platform: post.platform as SocialPlatform,
            content: post.content,
            scheduledTime: post.scheduledFor,
            status: post.status === 'published' ? 'posted' : post.status,
            mediaUrl: post.mediaUrls ? post.mediaUrls[0] : undefined
          })));
        } catch (error) {
          console.warn('Using mock data due to backend error:', error);
          // Fall back to mock data if backend fails
          setAccounts(mockAccounts);
          setScheduledPosts([]);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load social data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleConnectAccount = async (platform: SocialPlatform) => {
    try {
      setIsLoading(true);
      // Get OAuth URL from backend
      const { url } = await connectAccount(platform);
      if (!url || url.includes('YOUR_APP_ID') || url.includes('invalid')) {
        toast.error('Invalid or missing app ID. Please check your provider settings.');
        setIsLoading(false);
        return;
      }
      // Open OAuth window for login/signup
      const width = 600;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      window.open(
        url,
        `${platform}OAuth`,
        `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
      );
      toast.info('Please complete login/signup in the new window.');
      setIsLoading(false);
      // Do NOT mark as connected until backend confirms
    } catch (error) {
      console.error('Error in connect account flow:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect account';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handleDisconnectAccount = async (accountId: string, platform: SocialPlatform) => {
    try {
      setIsLoading(true);
      await disconnectAccount(accountId);
      // Update local state directly for demo purposes
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => 
          acc.platform === platform 
            ? { ...acc, connected: false, followers: 0 }
            : acc
        )
      );
      toast.success(`Successfully disconnected ${platform} account (demo mode)`);
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast.error('Failed to disconnect account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedulePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlatform || !postContent || !scheduledTime) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // In a real app, this would be an API call
      // const newPost = await schedulePost({
      //   platform: selectedPlatform,
      //   content: postContent,
      //   scheduledTime: scheduledTime.toString()
      // });
      
      // Mock response for demo
      const newPost: ScheduledPost = {
        id: Date.now().toString(),
        _id: Date.now().toString(),
        platform: selectedPlatform,
        content: postContent,
        scheduledTime: scheduledTime,
        status: 'scheduled'
      };

      setScheduledPosts(prev => [...prev, newPost]);
      setPostContent('');
      setScheduledTime('');
      setSelectedPlatform('');
      setIsCreatingPost(false);
      toast.success('Post scheduled successfully (demo mode)');
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast.error('Failed to schedule post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      // In a real app, this would be an API call
      // await deleteScheduledPost(postId);
      
      // Mock deletion for demo
      setScheduledPosts(prev => prev.filter(post => post.id !== postId && post._id !== postId));
      toast.success('Post deleted successfully (demo mode)');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'bg-blue-600 text-white';
      case 'instagram': return 'bg-gradient-to-r from-pink-500 to-yellow-500 text-white';
      case 'twitter': return 'bg-blue-400 text-white';
      default: return 'bg-gray-300 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return 'N/A';
    }
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const supportedPlatforms: SocialPlatform[] = ['facebook', 'instagram', 'twitter'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading social data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-24 md:mb-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Social Media</h1>
        <Button onClick={() => setIsCreatingPost(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Post
        </Button>
      </div>

      <Dialog open={isCreatingPost} onOpenChange={setIsCreatingPost}>
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
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Schedule Time</label>
              <Input 
                type="datetime-local" 
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreatingPost(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : 'Schedule Post'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Connected Accounts</span>
                  <span className="font-semibold">{accounts.filter(acc => acc.connected).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Followers</span>
                  <span className="font-semibold">{accounts.filter(acc => acc.connected).reduce((sum, acc) => sum + (acc.followers || 0), 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Scheduled Posts</span>
                  <span className="font-semibold">{scheduledPosts.length}</span>
                </div>
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
                    <div key={post._id || post.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPlatformColor(post.platform)}`}>
                            <span className="text-xs font-medium">{post.platform[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-medium">{post.content.substring(0, 60)}{post.content.length > 60 ? '...' : ''}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Scheduled for {formatDate(typeof post.scheduledTime === 'string' ? post.scheduledTime : post.scheduledTime?.toString() || '')}</span>
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
                            onClick={() => post._id ? handleDeletePost(post._id) : post.id ? handleDeletePost(post.id) : null}
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
                {supportedPlatforms.map((platform) => {
                  const account = accounts.find(acc => acc.platform === platform);
                  return (
                    <div key={platform} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getPlatformColor(platform)}`}>
                          <span className="font-medium">
                            {platform === 'facebook' ? 'F' : platform === 'instagram' ? 'IG' : 'X'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium capitalize">{platform}</p>
                          <p className="text-sm text-gray-500">
                            {account && account.connected
                              ? `${account.followers?.toLocaleString() || ''} followers`
                              : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      {account && account.connected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                          onClick={() => (account.id ?? account._id) ? handleDisconnectAccount((account.id ?? account._id) as string, account.platform) : null}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Disconnect</span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConnectAccount(platform)}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}