export interface SkinProfile {
  skinType: 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive';
  concerns: string[];
  age?: number;
  goals: string[];
}

export interface DailyTips {
  morning: any;
  afternoon: any;
  evening: any;
}

export interface RoutineStep {
  order: number;
  productId?: number;
  category: string;
  productName?: string;
  description?: string;
}

export interface UserStats {
  tipsCompleted: number;
  productsReviewed: number;
  dayStreak: number;
}
