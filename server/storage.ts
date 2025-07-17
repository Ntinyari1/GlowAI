import {
  users,
  tips,
  products,
  routines,
  favorites,
  userActivity,
  socialPosts,
  socialAccounts,
  type User,
  type InsertUser,
  type Tip,
  type InsertTip,
  type Product,
  type InsertProduct,
  type Routine,
  type InsertRoutine,
  type Favorite,
  type InsertFavorite,
  type UserActivity,
  type InsertUserActivity,
  type SocialPost,
  type InsertSocialPost,
  type SocialAccount,
  type InsertSocialAccount,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gt, or, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Tips operations
  getTips(skinType?: string, limit?: number): Promise<Tip[]>;
  getTipById(id: number): Promise<Tip | undefined>;
  createTip(tip: InsertTip): Promise<Tip>;
  likeTip(id: number): Promise<void>;

  // Products operations
  getProducts(category?: string, limit?: number): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  searchProducts(query: string): Promise<Product[]>;

  // Routines operations
  getUserRoutines(userId: number): Promise<Routine[]>;
  createRoutine(routine: InsertRoutine): Promise<Routine>;
  updateRoutine(id: number, updates: Partial<InsertRoutine>): Promise<Routine | undefined>;

  // Favorites operations
  getUserFavorites(userId: number, type?: string): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, type: string, itemId: number): Promise<void>;

  // User activity operations
  getUserActivity(userId: number, limit?: number): Promise<UserActivity[]>;
  addUserActivity(activity: InsertUserActivity): Promise<UserActivity>;

  // Social media operations
  getSocialAccounts(userId: number): Promise<SocialAccount[]>;
  connectSocialAccount(account: InsertSocialAccount): Promise<SocialAccount>;
  updateSocialAccount(id: number, updates: Partial<InsertSocialAccount>): Promise<SocialAccount | undefined>;
  disconnectSocialAccount(id: number): Promise<void>;

  // Social posts operations
  getSocialPosts(userId: number, limit?: number): Promise<SocialPost[]>;
  createSocialPost(post: InsertSocialPost): Promise<SocialPost>;
  updateSocialPost(id: number, updates: Partial<InsertSocialPost>): Promise<SocialPost | undefined>;
  deleteSocialPost(id: number): Promise<void>;
  getScheduledPosts(userId: number): Promise<SocialPost[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Tips operations
  async getTips(skinType?: string, limit = 10): Promise<Tip[]> {
    let result;
    if (skinType) {
      const whereCondition = or(
        sql`${tips.skinTypes} IS NULL`,
        sql`${tips.skinTypes} @> ARRAY[${skinType}]::text[]`
      );
      result = await db.select().from(tips)
        .where(whereCondition)
        .orderBy(desc(tips.createdAt))
        .limit(limit);
    } else {
      result = await db.select().from(tips)
        .orderBy(desc(tips.createdAt))
        .limit(limit);
    }
    return result;
  }

  async getTipById(id: number): Promise<Tip | undefined> {
    const [tip] = await db.select().from(tips).where(eq(tips.id, id));
    return tip || undefined;
  }

  async createTip(insertTip: InsertTip): Promise<Tip> {
    const [tip] = await db
      .insert(tips)
      .values(insertTip)
      .returning();
    return tip;
  }

  async likeTip(id: number): Promise<void> {
    await db
      .update(tips)
      .set({ likes: sql`${tips.likes} + 1` })
      .where(eq(tips.id, id));
  }

  // Products operations
  async getProducts(category?: string, limit = 20): Promise<Product[]> {
    let whereCondition = undefined;
    if (category) {
      whereCondition = eq(products.category, category);
    }
    const query = db.select().from(products)
      .where(whereCondition)
      .orderBy(desc(products.createdAt))
      .limit(limit);
    const result = await query;
    return result;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const result = await db
      .select()
      .from(products)
      .where(
        or(
          ilike(products.name, `%${query}%`),
          ilike(products.brand, `%${query}%`),
          ilike(products.category, `%${query}%`)
        )
      )
      .orderBy(desc(products.createdAt));
    return result;
  }

  // Routines operations
  async getUserRoutines(userId: number): Promise<Routine[]> {
    const result = await db
      .select()
      .from(routines)
      .where(eq(routines.userId, userId))
      .orderBy(desc(routines.createdAt));
    return result;
  }

  async createRoutine(insertRoutine: InsertRoutine): Promise<Routine> {
    const [routine] = await db
      .insert(routines)
      .values(insertRoutine)
      .returning();
    return routine;
  }

  async updateRoutine(id: number, updates: Partial<InsertRoutine>): Promise<Routine | undefined> {
    const [routine] = await db
      .update(routines)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(routines.id, id))
      .returning();
    return routine || undefined;
  }

  // Favorites operations
  async getUserFavorites(userId: number, type?: string): Promise<Favorite[]> {
    let result;
    if (type) {
      const whereCondition = and(eq(favorites.userId, userId), eq(favorites.type, type));
      result = await db.select().from(favorites)
        .where(whereCondition)
        .orderBy(desc(favorites.createdAt));
    } else {
      result = await db.select().from(favorites)
        .where(eq(favorites.userId, userId))
        .orderBy(desc(favorites.createdAt));
    }
    return result;
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values(insertFavorite)
      .returning();
    return favorite;
  }

  async removeFavorite(userId: number, type: string, itemId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.type, type),
          eq(favorites.itemId, itemId)
        )
      );
  }

  // User activity operations
  async getUserActivity(userId: number, limit = 10): Promise<UserActivity[]> {
    const result = await db
      .select()
      .from(userActivity)
      .where(eq(userActivity.userId, userId))
      .orderBy(desc(userActivity.createdAt))
      .limit(limit);
    return result;
  }

  async addUserActivity(insertActivity: InsertUserActivity): Promise<UserActivity> {
    const [activity] = await db
      .insert(userActivity)
      .values(insertActivity)
      .returning();
    return activity;
  }

  // Social media operations
  async getSocialAccounts(userId: number): Promise<SocialAccount[]> {
    const result = await db
      .select()
      .from(socialAccounts)
      .where(eq(socialAccounts.userId, userId))
      .orderBy(desc(socialAccounts.createdAt));
    return result;
  }

  async connectSocialAccount(insertAccount: InsertSocialAccount): Promise<SocialAccount> {
    const [account] = await db
      .insert(socialAccounts)
      .values(insertAccount)
      .returning();
    return account;
  }

  async updateSocialAccount(id: number, updates: Partial<InsertSocialAccount>): Promise<SocialAccount | undefined> {
    const [account] = await db
      .update(socialAccounts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(socialAccounts.id, id))
      .returning();
    return account || undefined;
  }

  async disconnectSocialAccount(id: number): Promise<void> {
    await db
      .update(socialAccounts)
      .set({ status: "disconnected", updatedAt: new Date() })
      .where(eq(socialAccounts.id, id));
  }

  async getSocialPosts(userId: number, limit = 10): Promise<SocialPost[]> {
    const result = await db
      .select()
      .from(socialPosts)
      .where(eq(socialPosts.userId, userId))
      .orderBy(desc(socialPosts.createdAt))
      .limit(limit);
    return result;
  }

  async createSocialPost(insertPost: InsertSocialPost): Promise<SocialPost> {
    const [post] = await db
      .insert(socialPosts)
      .values(insertPost)
      .returning();
    return post;
  }

  async updateSocialPost(id: number, updates: Partial<InsertSocialPost>): Promise<SocialPost | undefined> {
    const [post] = await db
      .update(socialPosts)
      .set(updates)
      .where(eq(socialPosts.id, id))
      .returning();
    return post || undefined;
  }

  async deleteSocialPost(id: number): Promise<void> {
    await db.delete(socialPosts).where(eq(socialPosts.id, id));
  }

  async getScheduledPosts(userId: number): Promise<SocialPost[]> {
    const now = new Date();
    const result = await db
      .select()
      .from(socialPosts)
      .where(
        and(
          eq(socialPosts.userId, userId),
          eq(socialPosts.status, "scheduled"),
          gt(socialPosts.scheduledFor, now)
        )
      )
      .orderBy(socialPosts.scheduledFor);
    return result;
  }
}

export const storage = new DatabaseStorage();