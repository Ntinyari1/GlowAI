import { SkinProfile, RoutineStep, UserStats } from './types';

// Mock data
const mockTips = [
  {
    id: 1,
    title: "Morning Hydration Boost",
    content: "Start your day with a hydrating serum containing hyaluronic acid to plump and moisturize your skin.",
    category: "morning",
    skinTypes: ["dry", "combination"],
    timeOfDay: "morning",
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
    likes: 42,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Evening Repair Routine",
    content: "Use a retinol serum in the evening to promote cell turnover and reduce fine lines.",
    category: "evening",
    skinTypes: ["normal", "combination"],
    timeOfDay: "evening",
    imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400",
    likes: 38,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "Sunscreen Protection",
    content: "Never skip sunscreen! Apply SPF 30+ every morning, even on cloudy days.",
    category: "morning",
    skinTypes: ["oily", "dry", "combination", "normal", "sensitive"],
    timeOfDay: "morning",
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
    likes: 67,
    createdAt: new Date().toISOString()
  }
];

const mockProducts = [
  {
    id: 1,
    name: "Gentle Daily Cleanser",
    brand: "Glow Essentials",
    category: "cleanser",
    description: "A gentle, non-stripping cleanser perfect for daily use",
    ingredients: ["Glycerin", "Ceramides", "Niacinamide"],
    price: "$24.99",
    rating: 45,
    pros: ["Gentle on skin", "Non-stripping", "Suitable for all skin types"],
    cons: ["May not remove heavy makeup"],
    bestFor: ["sensitive", "dry", "combination"],
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
    affiliateLink: "#",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Hydrating Serum",
    brand: "Skin Science",
    category: "serum",
    description: "Intensive hydration with hyaluronic acid and peptides",
    ingredients: ["Hyaluronic Acid", "Peptides", "Vitamin B5"],
    price: "$39.99",
    rating: 48,
    pros: ["Deep hydration", "Plumps skin", "Lightweight texture"],
    cons: ["Higher price point"],
    bestFor: ["dry", "combination", "mature"],
    imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400",
    affiliateLink: "#",
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "Retinol Night Cream",
    brand: "Age Defy",
    category: "moisturizer",
    description: "Advanced anti-aging formula with encapsulated retinol",
    ingredients: ["Encapsulated Retinol", "Ceramides", "Peptides"],
    price: "$54.99",
    rating: 42,
    pros: ["Effective anti-aging", "Gentle formula", "Moisturizing"],
    cons: ["May cause initial irritation"],
    bestFor: ["normal", "combination", "mature"],
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
    affiliateLink: "#",
    createdAt: new Date().toISOString()
  }
];

// Mock API functions
export const mockApi = {
  // Tips
  async generateTip(profile: SkinProfile, timeOfDay: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const tipContent = `Based on your ${profile.skinType} skin type and concerns about ${profile.concerns.join(', ')}, here's a personalized ${timeOfDay} tip: Focus on gentle, hydrating products that won't irritate your skin. Consider using a lightweight serum with antioxidants to protect against environmental damage.`;
    
    const newTip = {
      id: Date.now(),
      title: `${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} Skincare Tip`,
      content: tipContent,
      category: timeOfDay,
      skinTypes: [profile.skinType],
      timeOfDay,
      imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
      likes: 0,
      createdAt: new Date().toISOString()
    };
    
    return newTip;
  },

  async getTips(skinType?: string, limit?: number) {
    await new Promise(resolve => setTimeout(resolve, 500));
    let filteredTips = mockTips;
    
    if (skinType) {
      filteredTips = mockTips.filter(tip => 
        tip.skinTypes.includes(skinType as any)
      );
    }
    
    return limit ? filteredTips.slice(0, limit) : filteredTips;
  },

  async likeTip(id: number) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const tip = mockTips.find(t => t.id === id);
    if (tip) {
      tip.likes += 1;
    }
    return { success: true };
  },

  // Products
  async getProducts(category?: string, limit?: number) {
    await new Promise(resolve => setTimeout(resolve, 500));
    let filteredProducts = mockProducts;
    
    if (category) {
      filteredProducts = mockProducts.filter(product => 
        product.category === category
      );
    }
    
    return limit ? filteredProducts.slice(0, limit) : filteredProducts;
  },

  async searchProducts(query: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProducts.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );
  },

  async analyzeProduct(name: string, category: string, ingredients: string[]) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      pros: [
        "Contains beneficial ingredients for skin health",
        "Suitable for most skin types",
        "Well-formulated product"
      ],
      cons: [
        "May not suit all skin types",
        "Individual results may vary"
      ],
      bestFor: ["combination", "normal"],
      description: `${name} is a ${category} that contains key ingredients like ${ingredients.slice(0, 3).join(', ')}. This formulation appears to be well-balanced and suitable for various skin concerns.`
    };
  },

  // Routines
  async generateRoutine(profile: SkinProfile, routineType: string) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const steps: RoutineStep[] = routineType === 'morning' 
      ? [
          { order: 1, category: "cleanser", description: "Gentle daily cleanser", productName: "Gentle Daily Cleanser" },
          { order: 2, category: "serum", description: "Hydrating serum with antioxidants", productName: "Hydrating Serum" },
          { order: 3, category: "moisturizer", description: "Lightweight moisturizer", productName: "Daily Moisturizer" },
          { order: 4, category: "sunscreen", description: "Broad spectrum SPF 30+", productName: "Daily Sunscreen" }
        ]
      : [
          { order: 1, category: "cleanser", description: "Deep cleansing formula", productName: "Night Cleanser" },
          { order: 2, category: "treatment", description: "Active ingredient treatment", productName: "Retinol Night Cream" },
          { order: 3, category: "moisturizer", description: "Nourishing night moisturizer", productName: "Night Moisturizer" }
        ];
    
    return { steps };
  },

  async createRoutine(routineData: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: Date.now(),
      ...routineData,
      createdAt: new Date().toISOString()
    };
  },

  // Favorites
  async addFavorite(favoriteData: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      id: Date.now(),
      ...favoriteData,
      createdAt: new Date().toISOString()
    };
  },

  async removeFavorite(userId: number, type: string, itemId: number) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },

  // Social
  async connectSocialAccount(accountData: any) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: Date.now(),
      ...accountData,
      status: "connected",
      followers: Math.floor(Math.random() * 1000),
      engagement: "2.5",
      createdAt: new Date().toISOString()
    };
  },

  async createSocialPost(postData: any) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      id: Date.now(),
      ...postData,
      status: "draft",
      createdAt: new Date().toISOString()
    };
  },

  // User stats
  async getUserStats(): Promise<UserStats> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      tipsCompleted: 12,
      productsReviewed: 8,
      dayStreak: 5
    };
  }
}; 