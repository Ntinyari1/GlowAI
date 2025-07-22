// Minimal schema for GlowAI backend using Drizzle ORM
// You may need to adjust types/columns as needed for your actual DB
import { pgTable, serial, varchar, integer, text, timestamp, boolean, json, primaryKey } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 64 }),
  email: varchar('email', { length: 128 }),
  password: varchar('password', { length: 128 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const tips = pgTable('tips', {
  id: serial('id').primaryKey(),
  content: text('content'),
  skinTypes: json('skin_types').$type<string[]>(),
  timeOfDay: varchar('time_of_day', { length: 16 }),
  likes: integer('likes').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 128 }),
  brand: varchar('brand', { length: 128 }),
  category: varchar('category', { length: 64 }),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const routines = pgTable('routines', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  name: varchar('name', { length: 128 }),
  steps: json('steps').$type<any[]>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
});

export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  itemId: integer('item_id'),
  type: varchar('type', { length: 32 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const userActivity = pgTable('user_activity', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  activity: varchar('activity', { length: 128 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const socialPosts = pgTable('social_posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  content: text('content'),
  status: varchar('status', { length: 32 }),
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const socialAccounts = pgTable('social_accounts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  provider: varchar('provider', { length: 32 }),
  providerId: varchar('provider_id', { length: 128 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Export schemas for zod validation (dummy for now, you should define real schemas)
export const insertUserSchema: any = {};
export const insertTipSchema: any = {};
export const insertProductSchema: any = {};
export const insertRoutineSchema: any = {};
export const insertFavoriteSchema: any = {};
export const insertSocialPostSchema: any = {};
export const insertSocialAccountSchema: any = {};
