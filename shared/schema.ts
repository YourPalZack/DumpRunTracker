import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  hasTruck: boolean("has_truck").default(false),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dumpSites = pgTable("dump_sites", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  phone: text("phone"),
  operatingHours: text("operating_hours"),
  minFee: integer("min_fee"),
  feePerTon: integer("fee_per_ton"),
  acceptsElectronics: boolean("accepts_electronics").default(false),
  acceptsHazardousWaste: boolean("accepts_hazardous_waste").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dumpRuns = pgTable("dump_runs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  dumpSiteId: integer("dump_site_id").references(() => dumpSites.id),
  organizerId: integer("organizer_id").notNull().references(() => users.id),
  maxParticipants: integer("max_participants").notNull().default(3),
  status: text("status").notNull().default("active"), // active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const dumpRunParticipants = pgTable("dump_run_participants", {
  id: serial("id").primaryKey(),
  dumpRunId: integer("dump_run_id").notNull().references(() => dumpRuns.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  itemSize: text("item_size"), // small, medium, large
  itemDescription: text("item_description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pickupRequests = pgTable("pickup_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  address: text("address").notNull(),
  date: timestamp("date").notNull(),
  timeSlot: text("time_slot").notNull(), // morning, afternoon, evening
  itemSize: text("item_size").notNull(), // small, medium, large
  itemDescription: text("item_description"),
  specialInstructions: text("special_instructions"),
  status: text("status").notNull().default("pending"), // pending, scheduled, completed, cancelled
  estimatedPrice: integer("estimated_price"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  dumpRunId: integer("dump_run_id").notNull().references(() => dumpRuns.id),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // request_approved, request_received, dump_run_updated, etc.
  content: text("content").notNull(),
  relatedEntityId: integer("related_entity_id"), // dumpRun ID, pickupRequest ID, etc.
  relatedEntityType: text("related_entity_type"), // dumpRun, pickupRequest, etc.
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertDumpSiteSchema = createInsertSchema(dumpSites).omit({ id: true, createdAt: true });
export const insertDumpRunSchema = createInsertSchema(dumpRuns).omit({ id: true, createdAt: true });
export const insertDumpRunParticipantSchema = createInsertSchema(dumpRunParticipants).omit({ id: true, createdAt: true });
export const insertPickupRequestSchema = createInsertSchema(pickupRequests).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDumpSite = z.infer<typeof insertDumpSiteSchema>;
export type InsertDumpRun = z.infer<typeof insertDumpRunSchema>;
export type InsertDumpRunParticipant = z.infer<typeof insertDumpRunParticipantSchema>;
export type InsertPickupRequest = z.infer<typeof insertPickupRequestSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type User = typeof users.$inferSelect;
export type DumpSite = typeof dumpSites.$inferSelect;
export type DumpRun = typeof dumpRuns.$inferSelect;
export type DumpRunParticipant = typeof dumpRunParticipants.$inferSelect;
export type PickupRequest = typeof pickupRequests.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type Activity = typeof activities.$inferSelect;

// Extended types for UI
export type DumpRunWithDetails = DumpRun & {
  organizer: User;
  participants: (DumpRunParticipant & { user: User })[];
  dumpSite?: DumpSite;
  messages?: ChatMessage[];
};
