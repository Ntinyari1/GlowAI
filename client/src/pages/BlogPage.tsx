import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { BlogList } from '@/components/blog/BlogList';
import { BlogPostComponent } from '@/components/blog/BlogPost';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/SimpleToast';

// Strapi BlogPost type
interface BlogPost {
  id: number;
  title: string;
  content: string;
  image?: { url: string };
  publishedAt: string;
}

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, navigate] = useLocation();
  const { isAuthenticated, token } = useAuth();
  const { showToast } = useToast();

  // Helper function to show error toast
  const showErrorToast = (message: string) => {
    showToast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  };

  // Extract post ID from URL
  const postId = location.startsWith('/blog/') ? location.split('/')[2] : null;

  // Fetch blog posts from Strapi
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('http://localhost:1337/api/posts?populate=image');
        const json = await res.json();
        // Strapi v4 returns { data: [...] }
        const data = json.data.map((item: any) => ({
          id: item.id,
          title: item.attributes.title,
          content: item.attributes.content,
          image: item.attributes.image?.data ? { url: item.attributes.image.data.attributes.url } : undefined,
          publishedAt: item.attributes.publishedAt,
        }));
        setPosts(data);
        // If we're viewing a specific post, find it in the fetched posts
        if (postId) {
          const post = data.find((p: BlogPost) => String(p.id) === postId) || null;
          setSelectedPost(post);
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        showErrorToast('Failed to load blog posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [postId]);

  const handleLike = async (postId: string) => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const updatedPost = await likePost(postId, token || '');
      if (updatedPost) {
        setPosts(posts.map(post => 
          post._id === updatedPost._id ? updatedPost : post
        ));
        
        if (selectedPost?._id === updatedPost._id) {
          setSelectedPost(updatedPost);
        }
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!selectedPost?._id) return;
    
    try {
      const newComment = await addComment(
        selectedPost._id,
        { content, author: 'You' },
        token || ''
      );
      
      if (newComment) {
        const updatedPost = {
          ...selectedPost,
          comments: [...(selectedPost.comments || []), newComment]
        };
        
        setSelectedPost(updatedPost);
        setPosts(posts.map(post => 
          post._id === updatedPost._id ? updatedPost : post
        ));
        
        showToast({
          title: 'Success',
          description: 'Your comment has been added!',
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast({
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBackToList = () => {
    navigate('/blog');
    setSelectedPost(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 mb-24 md:mb-0">
      {selectedPost ? (
        <div>
          <Button 
            variant="ghost" 
            onClick={handleBackToList}
            className="mb-6"
          >
            ← Back to all posts
          </Button>
          
          <BlogPostComponent
            post={selectedPost}
            onLike={handleLike}
            onAddComment={handleAddComment}
            isAuthenticated={isAuthenticated}
          />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Blog</h1>
            {isAuthenticated && (
              <Button onClick={() => navigate('/blog/new')}>
                Create New Post
              </Button>
            )}
          </div>
          
          {posts.length > 0 ? (
            <BlogList 
              posts={posts} 
              onLike={handleLike}
              isAuthenticated={isAuthenticated}
            />
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium text-gray-600">No blog posts yet</h2>
              {isAuthenticated && (
                <p className="mt-2 text-gray-500">Be the first to create a post!</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BlogPage;
