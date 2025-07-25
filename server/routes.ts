import type { Express } from "express";

import { storage } from "./storage.js";
import { generateSkincareTip, generateProductReview, generateRoutineRecommendation } from "./services/gemini.js";
import { getDailyTip } from "./services/dailyTipService.js";
import * as socialController from "./controllers/socialController.js";
import * as authController from "./controllers/authController.js";
import { authenticate } from "./middleware/auth.js";
import axios from 'axios';
import productsRouter from './routes/products';

export async function registerRoutes(app: Express): Promise<void> {
  // Products API routes
  app.use('/api/products', productsRouter);
  
  // Daily tip route
  app.get("/api/daily-tip", async (req, res) => {
    try {
      const { skinType } = req.query;
      const tip = await getDailyTip(typeof skinType === 'string' ? skinType : undefined);
      res.json({ tip });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch daily tip", error: error instanceof Error ? error.message : error });
    }
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user", error: error instanceof Error ? error.message : error });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.updateUser(id, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data", error });
    }
  });

  // Tips routes
  app.get("/api/tips", async (req, res) => {
    try {
      const { skinType, limit } = req.query;
      const tips = await storage.getTips(
        typeof skinType === 'string' ? skinType : undefined,
        typeof limit === 'string' ? parseInt(limit) : undefined
      );
      res.json(tips);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tips", error: error instanceof Error ? error.message : error });
    }
  });

  app.post("/api/tips", async (req, res) => {
    try {
      const tip = await storage.createTip(req.body);
      res.json(tip);
    } catch (error) {
      res.status(400).json({ message: "Invalid tip data", error });
    }
  });

  app.post("/api/tips/:id/like", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.likeTip(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to like tip", error });
    }
  });

  // Social Media Routes - Protected by authentication
  app.get('/api/social/accounts', authenticate, socialController.getConnectedAccounts);
  app.delete('/api/social/accounts/:id', authenticate, socialController.disconnectAccount);
  
  app.get('/api/social/posts', authenticate, socialController.getScheduledPosts);
  app.post('/api/social/posts', authenticate, socialController.createScheduledPost);
  app.delete('/api/social/posts/:id', authenticate, socialController.deleteScheduledPost);
  
  // OAuth Routes
  app.get('/auth/facebook', authController.initiateOAuth('facebook'));
  app.get('/auth/instagram', authController.initiateOAuth('instagram'));
  app.get('/auth/twitter', authController.initiateOAuth('twitter'));
  
  app.get('/auth/facebook/callback', authController.handleOAuthCallback('facebook'));
  app.get('/auth/instagram/callback', authController.handleOAuthCallback('instagram'));
  app.get('/auth/twitter/callback', authController.handleOAuthCallback('twitter'));

  // AI-generated tips
  app.post("/api/ai/generate-tip", async (req, res) => {
    try {
      const { skinType, concerns, age, goals, timeOfDay } = req.body;
      
      if (!skinType || !timeOfDay) {
        return res.status(400).json({ message: "skinType and timeOfDay are required" });
      }

      const profile = {
        skinType,
        concerns: concerns || [],
        age,
        goals: goals || []
      };

      const content = await generateSkincareTip(profile, timeOfDay);
      
      // Create and store the tip
      const tipData = {
        title: `${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} Skincare Tip`,
        content,
        category: timeOfDay,
        skinTypes: [skinType],
        timeOfDay,
        imageUrl: `https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400`
      };

      const tip = await storage.createTip(tipData);
      res.json(tip);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate tip", error });
    }
  });

  app.use('/api/products', productsRouter);

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, limit, search } = req.query;
      let products;
      if (typeof search === 'string' && search.length > 0) {
        products = await storage.searchProducts(search);
      } else {
        products = await storage.getProducts(
          typeof category === 'string' ? category : undefined,
          typeof limit === 'string' ? parseInt(limit) : undefined
        );
      }
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products", error: error instanceof Error ? error.message : error });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });

  // AI product analysis
  app.post("/api/ai/analyze-product", async (req, res) => {
    try {
      const { name, category, ingredients } = req.body;
      
      if (!name || !category || !ingredients) {
        return res.status(400).json({ message: "name, category, and ingredients are required" });
      }

      const analysis = await generateProductReview(name, category, ingredients);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze product", error });
    }
  });

  // Routines routes
  app.get("/api/users/:userId/routines", async (req, res) => {
    try {
      const { userId } = req.params;
      const routines = await storage.getUserRoutines(userId);
      res.json(routines);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch routines", error: error instanceof Error ? error.message : error });
    }
  });

  app.post("/api/routines", async (req, res) => {
    try {
      const routine = await storage.createRoutine(req.body);
      res.json(routine);
    } catch (error) {
      res.status(400).json({ message: "Invalid routine data", error });
    }
  });

  app.put("/api/routines/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const routine = await storage.updateRoutine(id, req.body);
      if (!routine) {
        return res.status(404).json({ message: "Routine not found" });
      }
      res.json(routine);
    } catch (error) {
      res.status(400).json({ message: "Invalid routine data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // AI routine generation
  app.post("/api/ai/generate-routine", async (req, res) => {
    try {
      const { skinType, concerns, goals, routineType } = req.body;
      
      if (!skinType || !routineType) {
        return res.status(400).json({ message: "skinType and routineType are required" });
      }

      const profile = {
        skinType,
        concerns: concerns || [],
        goals: goals || []
      };

      const recommendation = await generateRoutineRecommendation(profile, routineType);
      res.json(recommendation);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate routine", error });
    }
  });

  // Favorites routes
  app.get("/api/users/:userId/favorites", async (req, res) => {
    try {
      const { userId } = req.params;
      const { type } = req.query;
      const favorites = await storage.getUserFavorites(userId, type as string);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites", error: error instanceof Error ? error.message : error });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const favorite = await storage.addFavorite(req.body);
      res.json(favorite);
    } catch (error) {
      res.status(400).json({ message: "Invalid favorite data", error });
    }
  });

  app.delete("/api/users/:userId/favorites/:type/:itemId", async (req, res) => {
    try {
      const { userId, type, itemId } = req.params;
      await storage.removeFavorite(userId, type, itemId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // User activity routes
  app.get("/api/users/:userId/activity", async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit } = req.query;
      const activities = await storage.getUserActivity(
        userId,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user activity", error: error instanceof Error ? error.message : error });
    }
  });

  // Social media account routes
  app.get("/api/users/:userId/social-accounts", async (req, res) => {
    try {
      const { userId } = req.params;
      const accounts = await storage.getSocialAccounts(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching social accounts:", error);
      res.status(500).json({ message: "Failed to fetch social accounts", error: error instanceof Error ? error.message : error });
    }
  });

  app.post("/api/social-accounts", async (req, res) => {
    try {
      const account = await storage.connectSocialAccount(req.body);
      res.json(account);
    } catch (error) {
      console.error("Error connecting social account:", error);
      res.status(500).json({ message: "Failed to connect social account", error: error instanceof Error ? error.message : error });
    }
  });

  app.patch("/api/social-accounts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const account = await storage.updateSocialAccount(id, req.body);
      if (!account) {
        return res.status(404).json({ message: "Social account not found" });
      }
      res.json(account);
    } catch (error) {
      console.error("Error updating social account:", error);
      res.status(500).json({ message: "Failed to update social account", error: error instanceof Error ? error.message : error });
    }
  });

  app.delete("/api/social-accounts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.disconnectSocialAccount(id);
      res.json({ message: "Social account disconnected" });
    } catch (error) {
      console.error("Error disconnecting social account:", error);
      res.status(500).json({ message: "Failed to disconnect social account", error: error instanceof Error ? error.message : error });
    }
  });

  // Social posts routes
  app.get("/api/users/:userId/social-posts", async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit } = req.query;
      const posts = await storage.getSocialPosts(userId, limit ? parseInt(limit as string) : undefined);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching social posts:", error);
      res.status(500).json({ message: "Failed to fetch social posts", error: error instanceof Error ? error.message : error });
    }
  });

  app.get("/api/users/:userId/scheduled-posts", async (req, res) => {
    try {
      const { userId } = req.params;
      const posts = await storage.getScheduledPosts(userId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching scheduled posts:", error);
      res.status(500).json({ message: "Failed to fetch scheduled posts", error: error instanceof Error ? error.message : error });
    }
  });

  app.post("/api/social-posts", async (req, res) => {
    try {
      const post = await storage.createSocialPost(req.body);
      res.json(post);
    } catch (error) {
      console.error("Error creating social post:", error);
      res.status(500).json({ message: "Failed to create social post", error: error instanceof Error ? error.message : error });
    }
  });

  app.patch("/api/social-posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const post = await storage.updateSocialPost(id, req.body);
      if (!post) {
        return res.status(404).json({ message: "Social post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error updating social post:", error);
      res.status(500).json({ message: "Failed to update social post", error: error instanceof Error ? error.message : error });
    }
  });

  app.delete("/api/social-posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSocialPost(id);
      res.json({ message: "Social post deleted" });
    } catch (error) {
      console.error("Error deleting social post:", error);
      res.status(500).json({ message: "Failed to delete social post", error: error instanceof Error ? error.message : error });
    }
  });

  // Proxy for Pexels API to avoid CORS issues
  app.get('/api/pexels', async (req, res) => {
    const { query } = req.query;
    try {
      const response = await axios.get('https://api.pexels.com/v1/search', {
        params: { query, per_page: 1 },
        headers: {
          Authorization: process.env.PEXELS_API_KEY,
        },
      });
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch from Pexels', error: error instanceof Error ? error.message : String(error) });
    }
  });
}

// Register error handler OUTSIDE of registerRoutes
import { Request, Response, NextFunction } from "express";
export function registerErrorHandler(app: Express) {
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    let status = 500;
    let message = "Internal Server Error";
    if (typeof err === "object" && err !== null) {
      const e = err as { status?: number; statusCode?: number; message?: string };
      status = e.status || e.statusCode || 500;
      message = e.message || "Internal Server Error";
    }
    res.status(status).json({ message });
  });
}
