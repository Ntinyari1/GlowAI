import { Link } from 'wouter';
import { BlogPost } from '@/services/blogService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface BlogListProps {
  posts: BlogPost[];
  onLike: (postId: string) => void;
  isAuthenticated: boolean;
}

export function BlogList({ posts, onLike, isAuthenticated }: BlogListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Card key={post._id} className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-xl">{post.title}</CardTitle>
            <CardDescription>
              By {post.author} • {post.createdAt && format(new Date(post.createdAt), 'MMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-gray-600 line-clamp-3">
              {post.content.substring(0, 150)}...
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button asChild variant="outline">
              <Link href={`/blog/${post._id}`}>Read More</Link>
            </Button>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onLike(post._id!)}
                disabled={!isAuthenticated}
              >
                ❤️ {post.likes || 0}
              </Button>
              <span className="text-sm text-gray-500">
                {post.comments?.length || 0} comments
              </span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
