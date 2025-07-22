import { User, Tip, Product, Routine, Favorite, UserActivity, SocialPost, SocialAccount } from './models/index.js';

export class DatabaseStorage {
  // User operations
  async getUser(id: string) {
    return User.findById(id).lean();
  }

  async getUserByUsername(username: string) {
    return User.findOne({ username }).lean();
  }

  async getUserByEmail(email: string) {
    return User.findOne({ email }).lean();
  }

  async createUser(user: { username: string; email: string; password: string }) {
    return User.create(user);
  }

  async updateUser(id: string, updates: Partial<{ username: string; email: string; password: string }>) {
    return User.findByIdAndUpdate(id, updates, { new: true }).lean();
  }

  // Tips operations
  async getTips(skinType?: string, limit = 10) {
    const filter = skinType ? {
      $or: [
        { skinTypes: { $exists: false } },
        { skinTypes: skinType }
      ]
    } : {};
    return Tip.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  }

  async getTipById(id: string) {
    return Tip.findById(id).lean();
  }

  async createTip(tip: { content: string; skinTypes?: string[]; timeOfDay?: string }) {
    return Tip.create(tip);
  }

  async likeTip(id: string) {
    await Tip.findByIdAndUpdate(id, { $inc: { likes: 1 } });
  }

  // Products operations
  async getProducts(category?: string, limit = 20) {
    const filter = category ? { category } : {};
    return Product.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  }

  async getProductById(id: string) {
    return Product.findById(id).lean();
  }

  async createProduct(product: { name: string; brand?: string; category?: string; description?: string }) {
    return Product.create(product);
  }

  async searchProducts(query: string) {
    return Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 }).lean();
  }

  // Routines operations
  async getUserRoutines(userId: string) {
    return Routine.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async createRoutine(routine: { userId: string; name: string; steps: any[] }) {
    return Routine.create(routine);
  }

  async updateRoutine(id: string, updates: Partial<{ name: string; steps: any[]; updatedAt?: Date }>) {
    updates['updatedAt'] = new Date();
    return Routine.findByIdAndUpdate(id, updates, { new: true }).lean();
  }

  // Favorites operations
  async getUserFavorites(userId: string, type?: string) {
    const filter: any = { userId };
    if (type) filter.type = type;
    return Favorite.find(filter).sort({ createdAt: -1 }).lean();
  }

  async addFavorite(favorite: { userId: string; itemId: string; type: string }) {
    return Favorite.create(favorite);
  }

  async removeFavorite(userId: string, type: string, itemId: string) {
    await Favorite.deleteOne({ userId, type, itemId });
  }

  // User activity operations
  async getUserActivity(userId: string, limit = 10) {
    return UserActivity.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
  }

  async addUserActivity(activity: { userId: string; activity: string }) {
    return UserActivity.create(activity);
  }

  // Social media operations
  async getSocialAccounts(userId: string) {
    return SocialAccount.find({ userId }).lean();
  }

  async connectSocialAccount(account: { userId: string; provider: string; providerId: string }) {
    return SocialAccount.create(account);
  }

  async updateSocialAccount(id: string, updates: Partial<{ provider: string; providerId: string }>) {
    return SocialAccount.findByIdAndUpdate(id, updates, { new: true }).lean();
  }

  async disconnectSocialAccount(id: string) {
    await SocialAccount.findByIdAndDelete(id);
  }

  // Social posts operations
  async getSocialPosts(userId: string, limit = 10) {
    return SocialPost.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
  }

  async createSocialPost(post: { userId: string; content: string; status?: string; scheduledFor?: Date }) {
    return SocialPost.create(post);
  }

  async updateSocialPost(id: string, updates: Partial<{ content?: string; status?: string; scheduledFor?: Date }>) {
    return SocialPost.findByIdAndUpdate(id, updates, { new: true }).lean();
  }

  async deleteSocialPost(id: string) {
    await SocialPost.findByIdAndDelete(id);
  }

  async getScheduledPosts(userId: string) {
    return SocialPost.find({ userId, scheduledFor: { $gt: new Date() } }).lean();
  }
}

export const storage = new DatabaseStorage();