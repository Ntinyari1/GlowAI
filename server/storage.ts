import {
  users,
  tips,
  products,
  routines,
  favorites,
  userActivity,
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
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private tips: Map<number, Tip> = new Map();
  private products: Map<number, Product> = new Map();
  private routines: Map<number, Routine> = new Map();
  private favorites: Map<number, Favorite> = new Map();
  private userActivity: Map<number, UserActivity> = new Map();
  
  private currentUserId = 1;
  private currentTipId = 1;
  private currentProductId = 1;
  private currentRoutineId = 1;
  private currentFavoriteId = 1;
  private currentActivityId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed some sample products
    const sampleProducts: InsertProduct[] = [
      {
        name: "CeraVe Hydrating Cleanser",
        brand: "CeraVe",
        category: "cleanser",
        description: "Gentle, non-foaming cleanser for dry to normal skin",
        ingredients: ["ceramides", "hyaluronic acid", "MVE technology"],
        price: "$12.99",
        rating: 46,
        pros: ["Non-comedogenic", "Fragrance-free", "Gentle formula"],
        cons: ["May not remove heavy makeup", "Can feel heavy for oily skin"],
        bestFor: ["dry skin", "sensitive skin", "normal skin"],
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
        affiliateLink: "https://example.com/cerave-cleanser"
      },
      {
        name: "The Ordinary Niacinamide 10% + Zinc 1%",
        brand: "The Ordinary",
        category: "serum",
        description: "High-strength niacinamide serum to reduce appearance of skin blemishes",
        ingredients: ["niacinamide", "zinc PCA"],
        price: "$7.90",
        rating: 44,
        pros: ["Affordable", "Reduces oiliness", "Minimizes pores"],
        cons: ["Can pill under makeup", "Strong concentration may irritate"],
        bestFor: ["oily skin", "acne-prone skin", "combination skin"],
        imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
        affiliateLink: "https://example.com/ordinary-niacinamide"
      },
      {
        name: "Neutrogena Ultra Sheer Dry-Touch SPF 60",
        brand: "Neutrogena",
        category: "sunscreen",
        description: "Lightweight, fast-absorbing sunscreen with broad spectrum protection",
        ingredients: ["avobenzone", "homosalate", "octisalate", "octocrylene"],
        price: "$9.47",
        rating: 42,
        pros: ["Lightweight formula", "Non-comedogenic", "Water-resistant"],
        cons: ["May leave white cast", "Contains chemical filters"],
        bestFor: ["daily use", "all skin types", "acne-prone skin"],
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        affiliateLink: "https://example.com/neutrogena-sunscreen"
      }
    ];

    sampleProducts.forEach(product => this.createProduct(product));

    // Seed some sample tips
    const sampleTips: InsertTip[] = [
      {
        title: "Start with Gentle Cleansing",
        content: "For combination skin, use a gentle gel cleanser in the morning to remove overnight buildup without over-drying your skin.",
        category: "morning",
        skinTypes: ["combination", "oily"],
        timeOfDay: "morning",
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400"
      },
      {
        title: "The Power of Niacinamide",
        content: "This B3 vitamin helps control oil production and minimize pores - perfect for your combination skin type.",
        category: "ingredient",
        skinTypes: ["combination", "oily"],
        timeOfDay: "afternoon",
        imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400"
      },
      {
        title: "Double Cleanse Tonight",
        content: "Remove makeup and sunscreen with an oil cleanser, followed by your regular gel cleanser for a deep clean.",
        category: "evening",
        skinTypes: ["all"],
        timeOfDay: "evening",
        imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400"
      }
    ];

    sampleTips.forEach(tip => this.createTip(tip));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      skinType: insertUser.skinType || null,
      skinConcerns: insertUser.skinConcerns || null,
      age: insertUser.age || null,
      goals: insertUser.goals || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Tips operations
  async getTips(skinType?: string, limit = 10): Promise<Tip[]> {
    let tips = Array.from(this.tips.values());
    
    if (skinType) {
      tips = tips.filter(tip => 
        !tip.skinTypes || 
        tip.skinTypes.includes(skinType) || 
        tip.skinTypes.includes("all")
      );
    }
    
    return tips
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  async getTipById(id: number): Promise<Tip | undefined> {
    return this.tips.get(id);
  }

  async createTip(insertTip: InsertTip): Promise<Tip> {
    const id = this.currentTipId++;
    const tip: Tip = {
      ...insertTip,
      id,
      skinTypes: insertTip.skinTypes || null,
      timeOfDay: insertTip.timeOfDay || null,
      imageUrl: insertTip.imageUrl || null,
      likes: 0,
      createdAt: new Date(),
    };
    this.tips.set(id, tip);
    return tip;
  }

  async likeTip(id: number): Promise<void> {
    const tip = this.tips.get(id);
    if (tip) {
      tip.likes = (tip.likes || 0) + 1;
      this.tips.set(id, tip);
    }
  }

  // Products operations
  async getProducts(category?: string, limit = 20): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (category && category !== "all") {
      products = products.filter(product => product.category === category);
    }
    
    return products
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = {
      ...insertProduct,
      id,
      description: insertProduct.description || null,
      ingredients: insertProduct.ingredients || null,
      price: insertProduct.price || null,
      rating: insertProduct.rating || null,
      pros: insertProduct.pros || null,
      cons: insertProduct.cons || null,
      bestFor: insertProduct.bestFor || null,
      imageUrl: insertProduct.imageUrl || null,
      affiliateLink: insertProduct.affiliateLink || null,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const products = Array.from(this.products.values());
    const lowerQuery = query.toLowerCase();
    
    return products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.brand.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Routines operations
  async getUserRoutines(userId: number): Promise<Routine[]> {
    return Array.from(this.routines.values()).filter(routine => routine.userId === userId);
  }

  async createRoutine(insertRoutine: InsertRoutine): Promise<Routine> {
    const id = this.currentRoutineId++;
    const routine: Routine = {
      ...insertRoutine,
      id,
      userId: insertRoutine.userId || null,
      products: insertRoutine.products || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.routines.set(id, routine);
    return routine;
  }

  async updateRoutine(id: number, updates: Partial<InsertRoutine>): Promise<Routine | undefined> {
    const routine = this.routines.get(id);
    if (!routine) return undefined;
    
    const updatedRoutine = { ...routine, ...updates, updatedAt: new Date() };
    this.routines.set(id, updatedRoutine);
    return updatedRoutine;
  }

  // Favorites operations
  async getUserFavorites(userId: number, type?: string): Promise<Favorite[]> {
    let favorites = Array.from(this.favorites.values()).filter(fav => fav.userId === userId);
    
    if (type) {
      favorites = favorites.filter(fav => fav.type === type);
    }
    
    return favorites;
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.currentFavoriteId++;
    const favorite: Favorite = {
      ...insertFavorite,
      id,
      userId: insertFavorite.userId || null,
      createdAt: new Date(),
    };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFavorite(userId: number, type: string, itemId: number): Promise<void> {
    const favorite = Array.from(this.favorites.values()).find(
      fav => fav.userId === userId && fav.type === type && fav.itemId === itemId
    );
    
    if (favorite) {
      this.favorites.delete(favorite.id);
    }
  }

  // User activity operations
  async getUserActivity(userId: number, limit = 10): Promise<UserActivity[]> {
    return Array.from(this.userActivity.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  async addUserActivity(insertActivity: InsertUserActivity): Promise<UserActivity> {
    const id = this.currentActivityId++;
    const activity: UserActivity = {
      ...insertActivity,
      id,
      userId: insertActivity.userId || null,
      createdAt: new Date(),
    };
    this.userActivity.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
