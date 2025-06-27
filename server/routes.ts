import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTipSchema, insertProductSchema, insertRoutineSchema, insertFavoriteSchema, insertSocialPostSchema, insertSocialAccountSchema } from "@shared/schema";
import { generateSkincareTip, generateProductReview, generateRoutineRecommendation } from "./services/gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user", error });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, updates);
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
        skinType as string,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(tips);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tips", error });
    }
  });

  app.post("/api/tips", async (req, res) => {
    try {
      const tipData = insertTipSchema.parse(req.body);
      const tip = await storage.createTip(tipData);
      res.json(tip);
    } catch (error) {
      res.status(400).json({ message: "Invalid tip data", error });
    }
  });

  app.post("/api/tips/:id/like", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.likeTip(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to like tip", error });
    }
  });

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

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, limit, search } = req.query;
      
      let products;
      if (search) {
        products = await storage.searchProducts(search as string);
      } else {
        products = await storage.getProducts(
          category as string,
          limit ? parseInt(limit as string) : undefined
        );
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products", error });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product", error });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
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
      const userId = parseInt(req.params.userId);
      const routines = await storage.getUserRoutines(userId);
      res.json(routines);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch routines", error });
    }
  });

  app.post("/api/routines", async (req, res) => {
    try {
      const routineData = insertRoutineSchema.parse(req.body);
      const routine = await storage.createRoutine(routineData);
      res.json(routine);
    } catch (error) {
      res.status(400).json({ message: "Invalid routine data", error });
    }
  });

  app.put("/api/routines/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertRoutineSchema.partial().parse(req.body);
      const routine = await storage.updateRoutine(id, updates);
      if (!routine) {
        return res.status(404).json({ message: "Routine not found" });
      }
      res.json(routine);
    } catch (error) {
      res.status(400).json({ message: "Invalid routine data", error });
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
      const userId = parseInt(req.params.userId);
      const { type } = req.query;
      const favorites = await storage.getUserFavorites(userId, type as string);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites", error });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const favoriteData = insertFavoriteSchema.parse(req.body);
      const favorite = await storage.addFavorite(favoriteData);
      res.json(favorite);
    } catch (error) {
      res.status(400).json({ message: "Invalid favorite data", error });
    }
  });

  app.delete("/api/users/:userId/favorites/:type/:itemId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { type, itemId } = req.params;
      await storage.removeFavorite(userId, type, parseInt(itemId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite", error });
    }
  });

  // User activity routes
  app.get("/api/users/:userId/activity", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { limit } = req.query;
      const activities = await storage.getUserActivity(
        userId,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user activity", error });
    }
  });

  // Social media account routes
  app.get("/api/users/:userId/social-accounts", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const accounts = await storage.getSocialAccounts(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching social accounts:", error);
      res.status(500).json({ message: "Failed to fetch social accounts" });
    }
  });

  app.post("/api/social-accounts", async (req, res) => {
    try {
      const result = insertSocialAccountSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid social account data" });
      }

      const account = await storage.connectSocialAccount(result.data);
      res.json(account);
    } catch (error) {
      console.error("Error connecting social account:", error);
      res.status(500).json({ message: "Failed to connect social account" });
    }
  });

  app.patch("/api/social-accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.updateSocialAccount(id, req.body);
      
      if (!account) {
        return res.status(404).json({ message: "Social account not found" });
      }

      res.json(account);
    } catch (error) {
      console.error("Error updating social account:", error);
      res.status(500).json({ message: "Failed to update social account" });
    }
  });

  app.delete("/api/social-accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.disconnectSocialAccount(id);
      res.json({ message: "Social account disconnected" });
    } catch (error) {
      console.error("Error disconnecting social account:", error);
      res.status(500).json({ message: "Failed to disconnect social account" });
    }
  });

  // Social posts routes
  app.get("/api/users/:userId/social-posts", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const posts = await storage.getSocialPosts(userId, limit);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching social posts:", error);
      res.status(500).json({ message: "Failed to fetch social posts" });
    }
  });

  app.get("/api/users/:userId/scheduled-posts", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const posts = await storage.getScheduledPosts(userId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching scheduled posts:", error);
      res.status(500).json({ message: "Failed to fetch scheduled posts" });
    }
  });

  app.post("/api/social-posts", async (req, res) => {
    try {
      const result = insertSocialPostSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid social post data" });
      }

      const post = await storage.createSocialPost(result.data);
      res.json(post);
    } catch (error) {
      console.error("Error creating social post:", error);
      res.status(500).json({ message: "Failed to create social post" });
    }
  });

  app.patch("/api/social-posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.updateSocialPost(id, req.body);
      
      if (!post) {
        return res.status(404).json({ message: "Social post not found" });
      }

      res.json(post);
    } catch (error) {
      console.error("Error updating social post:", error);
      res.status(500).json({ message: "Failed to update social post" });
    }
  });

  app.delete("/api/social-posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSocialPost(id);
      res.json({ message: "Social post deleted" });
    } catch (error) {
      console.error("Error deleting social post:", error);
      res.status(500).json({ message: "Failed to delete social post" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
