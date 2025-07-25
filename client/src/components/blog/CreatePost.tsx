import { useState } from 'react';
import { useLocation } from 'wouter';
import { createBlogPost } from '@/services/blogService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/SimpleToast';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      showToast({
        title: 'Error',
        description: 'You must be logged in to create a post',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newPost = await createBlogPost(
        {
          title,
          content,
          author: user?.username || 'Anonymous',
          imageUrl: imageUrl.trim() || undefined,
        },
        ''
      );

      if (newPost) {
        showToast({
          title: 'Success',
          description: 'Your post has been published.',
        });
        navigate(`/blog/${newPost._id}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create post',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Post</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="imageUrl" className="block text-sm font-medium">
            Image URL (optional)
          </label>
          <Input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          {imageUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="max-h-40 rounded-md border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm font-medium">
            Content <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content here..."
            className="min-h-[200px]"
            required
          />
          <p className="text-sm text-gray-500">
            Supports markdown formatting
          </p>
        </div>
        
        <div className="flex justify-end gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/blog')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Publishing...' : 'Publish Post'}
          </Button>
        </div>
      </form>
    </div>
  );
}
