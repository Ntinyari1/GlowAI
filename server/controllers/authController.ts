import { Request, Response } from 'express';
import axios from 'axios';
import SocialAccount from '../models/SocialAccount';
import { Types } from 'mongoose';

// Configuration for OAuth providers
const oauthConfig = {
  facebook: {
    clientId: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    authUrl: 'https://www.facebook.com/v12.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v12.0/oauth/access_token',
    profileUrl: 'https://graph.facebook.com/me',
    scope: 'pages_show_list,pages_read_engagement,pages_manage_posts',
  },
  instagram: {
    clientId: process.env.INSTAGRAM_APP_ID,
    clientSecret: process.env.INSTAGRAM_APP_SECRET,
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    profileUrl: 'https://graph.instagram.com/me',
    scope: 'user_profile,user_media',
  },
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    profileUrl: 'https://api.twitter.com/2/users/me',
    scope: 'tweet.read users.read offline.access',
  },
};

// Redirect to provider's OAuth page
export const initiateOAuth = (provider: 'facebook' | 'instagram' | 'twitter') => {
  return (req: Request, res: Response) => {
    const config = oauthConfig[provider];
    if (!config.clientId || config.clientId === 'YOUR_APP_ID') {
      return res.status(400).json({ error: 'Invalid or missing app ID for ' + provider });
    }
    const redirectUri = `${process.env.APP_URL}/api/auth/${provider}/callback`;
    // TODO: Replace with actual user ID from session/JWT
    const userId = req.user?.id || 'demo-user-id';
    const state = JSON.stringify({ provider, userId });
    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.append('client_id', config.clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', config.scope);
    authUrl.searchParams.append('state', state);
    if (provider === 'twitter') {
      authUrl.searchParams.append('code_challenge', 'challenge'); // Implement PKCE in production
      authUrl.searchParams.append('code_challenge_method', 'plain');
    }
    res.redirect(authUrl.toString());
  };
};

// Handle OAuth callback
export const handleOAuthCallback = (provider: 'facebook' | 'instagram' | 'twitter') => {
  return async (req: Request, res: Response) => {
    try {
      const { code, state } = req.query;
      const config = oauthConfig[provider];
      const redirectUri = `${process.env.APP_URL}/api/auth/${provider}/callback`;
      // Parse state for userId
      let userId = 'demo-user-id';
      try {
        if (state) {
          const parsed = JSON.parse(state as string);
          if (parsed.userId) {
            userId = parsed.userId;
          }
        }
      } catch {}
      // Exchange code for access token
      const params: Record<string, string> = {
        client_id: config.clientId || '',
        client_secret: config.clientSecret || '',
        code: code as string,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      };
      if (provider === 'twitter') {
        params.code_verifier = 'challenge'; // Match the challenge from the auth request
      }
      const tokenResponse = await axios.post(config.tokenUrl, new URLSearchParams(params));
      const { access_token: accessToken, refresh_token: refreshToken } = tokenResponse.data;
      // Get user profile
      const profileResponse = await axios.get(config.profileUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profile = profileResponse.data;
      // Save or update social account
      const account = await SocialAccount.findOneAndUpdate(
        { provider, providerId: profile.id },
        {
          userId,
          provider,
          providerId: profile.id,
          accessToken,
          refreshToken,
          username: profile.username || profile.name || profile.email?.split('@')[0],
          displayName: profile.name,
          avatar: profile.picture?.data?.url || profile.profile_image_url,
          connected: true,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
      // Redirect back to the frontend with success status
      res.redirect(`${process.env.FRONTEND_URL}/social?connected=${provider}`);
    } catch (error) {
      console.error(`Error handling ${provider} OAuth callback:`, error);
      res.redirect(`${process.env.FRONTEND_URL}/social?error=oauth_failed`);
    }
  };
};
