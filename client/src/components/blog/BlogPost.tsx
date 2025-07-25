import { useState } from 'react';
import { BlogPost, Comment } from '@/services/blogService';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/SimpleToast';

interface BlogPostProps {
  post: BlogPost;
  onLike: (postId: string) => void;
  onAddComment: (content: string) => void;
  isAuthenticated: boolean;
}

export function BlogPostComponent({ post, onLike, onAddComment, isAuthenticated }: BlogPostProps) {
  const [comment, setComment] = useState('');
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onAddComment(comment);
      setComment('');
    }
  };

  return (
    <div className="space-y-8">
      <article className="space-y-4">
        <header>
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <div className="flex items-center gap-4 text-gray-500 mt-2">
            <span>By {post.author}</span>
            <span>•</span>
            <span>{post.createdAt && format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </header>
        
        {post.imageUrl && (
          <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="prose max-w-none">
          <p className="whitespace-pre-line">{post.content}</p>
        </div>
        
        <div className="flex items-center gap-4 pt-4 border-t">
          <Button 
            variant="ghost" 
            onClick={() => onLike(post._id!)}
            disabled={!isAuthenticated}
          >
            ❤️ {post.likes || 0} Likes
          </Button>
          <span className="text-gray-500">
            {post.comments?.length || 0} Comments
          </span>
        </div>
      </article>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Comments</h2>
        
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!comment.trim()}>
                Post Comment
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-gray-500">
            Please log in to leave a comment.
          </p>
        )}
        
        <div className="space-y-4">
          {post.comments?.length ? (
            post.comments.map((comment) => (
              <div key={comment._id} className="border-b pb-4 last:border-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{comment.author}</span>
                  <span className="text-sm text-gray-500">
                    {comment.createdAt && format(new Date(comment.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </section>
    </div>
  );
}
