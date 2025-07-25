import axios from 'axios';

const API_URL = 'http://localhost:5000/api/blogs';

export interface BlogPost {
  _id?: string;
  title: string;
  content: string;
  author: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  likes?: number;
  comments?: Comment[];
}

export interface Comment {
  _id?: string;
  content: string;
  author: string;
  createdAt?: string;
}

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};

export const getBlogPost = async (id: string): Promise<BlogPost | null> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
};

export const createBlogPost = async (post: Omit<BlogPost, '_id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments'>, token: string): Promise<BlogPost | null> => {
  try {
    const response = await axios.post(API_URL, post, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating blog post:', error);
    return null;
  }
};

export const addComment = async (postId: string, comment: Omit<Comment, '_id' | 'createdAt'>, token: string): Promise<Comment | null> => {
  try {
    const response = await axios.post(`${API_URL}/${postId}/comments`, comment, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
};

export const likePost = async (postId: string, token: string): Promise<BlogPost | null> => {
  try {
    const response = await axios.post(`${API_URL}/${postId}/like`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error liking post:', error);
    return null;
  }
};
