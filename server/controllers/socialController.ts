import { Request, Response } from 'express';
import SocialAccount from '../models/SocialAccount';
import SocialPost from '../models/SocialPost';
import { Types } from 'mongoose';

// Get all connected social accounts for the current user
export const getConnectedAccounts = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const accounts = await SocialAccount.find({ userId: req.user.id });
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching social accounts:', error);
    res.status(500).json({ message: 'Failed to fetch social accounts' });
  }
};

// Disconnect a social account
export const disconnectAccount = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { id } = req.params;
    const account = await SocialAccount.findOneAndDelete({ _id: id, userId: req.user.id });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found or not authorized' });
    }
    
    // Delete any scheduled posts for this account
    await SocialPost.deleteMany({ accountId: id });
    
    res.json({ message: 'Account disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting account:', error);
    res.status(500).json({ message: 'Failed to disconnect account' });
  }
};

// Get all scheduled posts for the current user
export const getScheduledPosts = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const posts = await SocialPost.find({ userId: req.user.id })
      .sort({ scheduledFor: 1 })
      .populate('accountId', 'provider username');
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    res.status(500).json({ message: 'Failed to fetch scheduled posts' });
  }
};

// Schedule a new post
export const createScheduledPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { accountId, content, scheduledFor, platform, mediaUrls = [] } = req.body;
    
    // Validate input
    if (!accountId || !content || !scheduledFor || !platform) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate account ownership
    const account = await SocialAccount.findOne({ _id: accountId, userId: req.user.id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found or not authorized' });
    }
    
    const scheduledDate = new Date(scheduledFor);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    const post = new SocialPost({
      userId: req.user.id,
      accountId,
      content,
      scheduledFor: scheduledDate,
      platform,
      mediaUrls,
      status: 'scheduled'
    });
    
    await post.save();
    
    // In a real app, you would schedule this post to be published at the scheduled time
    // For example: schedulePostJob(post);
    
    // Populate account info in the response
    const populatedPost = await post.populate('accountId', 'provider username');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error scheduling post:', error);
    res.status(500).json({ message: 'Failed to schedule post' });
  }
};

// Delete a scheduled post
export const deleteScheduledPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { id } = req.params;
    
    const post = await SocialPost.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!post) {
      return res.status(404).json({ message: 'Post not found or not authorized' });
    }
    
    // In a real app, you would cancel any scheduled jobs for this post
    // For example: cancelScheduledJob(post._id);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
};
