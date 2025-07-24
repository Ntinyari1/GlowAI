import axios from 'axios';
import { toast } from 'sonner';

// Backend server is running on port 5000
const API_BASE_URL = 'http://127.0.0.1:5000/api';

export type SocialPlatform = 'facebook' | 'instagram' | 'twitter';

export interface SocialAccount {
  _id: string;
  platform: string;
  username: string;
  displayName?: string;
  avatar?: string;
  followers?: number;
  connected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledPost {
  _id: string;
  userId: string;
  accountId: string;
  content: string;
  mediaUrls?: string[];
  scheduledFor: string;
  status: 'scheduled' | 'published' | 'failed';
  platform: 'facebook' | 'instagram' | 'twitter';
  createdAt: string;
  updatedAt: string;
}

// Social Accounts
export const getConnectedAccounts = async (): Promise<SocialAccount[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/social/accounts`);
    // Map the response to match our frontend types
    return response.data.map((account: any) => ({
      _id: account._id,
      platform: account.platform || account.provider,
      username: account.username,
      displayName: account.displayName,
      avatar: account.avatar,
      followers: account.followers || account.followersCount,
      connected: account.connected !== false, // Default to true if not specified
      createdAt: account.createdAt,
      updatedAt: account.updatedAt || account.createdAt
    }));
  } catch (error) {
    console.error('Error fetching connected accounts:', error);
    toast.error('Failed to load connected accounts');
    throw error;
  }
};

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const connectAccount = async (platform: SocialPlatform): Promise<{ url: string }> => {
  try {
    const response = await axios.get<{ url: string }>(`${API_BASE_URL}/auth/${platform}`);
    if (!response.data?.url) {
      throw new Error('No authentication URL received from server');
    }
    return response.data;
  } catch (error: unknown) {
    console.error(`Error initiating ${platform} connection:`, error);
    
    let errorMessage = `Failed to connect to ${platform}`;
    
    if (error && typeof error === 'object') {
      const apiError = error as ApiError;
      if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
    }
    
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const disconnectAccount = async (accountId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/social/accounts/${accountId}`);
  } catch (error) {
    console.error('Error disconnecting account:', error);
    throw error;
  }
};

// Scheduled Posts
export const getScheduledPosts = async (): Promise<ScheduledPost[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/social/posts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    throw error;
  }
};

export const schedulePost = async (postData: {
  accountId: string;
  content: string;
  scheduledFor: string;
  platform: 'facebook' | 'instagram' | 'twitter';
  mediaUrls?: string[];
}): Promise<ScheduledPost> => {
  const response = await axios.post(`${API_BASE_URL}/social/posts`, postData);
  return response.data;
};

export const deleteScheduledPost = async (postId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/social/posts/${postId}`);
};

// OAuth Callback
export const handleOAuthCallback = async (code: string, platform: 'facebook' | 'instagram' | 'twitter'): Promise<SocialAccount> => {
  const response = await axios.get(`${API_BASE_URL}/auth/${platform}/callback?code=${code}`);
  return response.data;
};
