import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define the 'users' table.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'channels' table for M3U entries
export const channels = pgTable('channels', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  source: text('source'),
  channel: text('channel').notNull(),
  genre: text('genre').notNull(),
});
