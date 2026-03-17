import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Orders table for both OS (Service Orders) and OC (Purchase Orders)
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["OS", "OC"]).notNull(), // OS = Ordem de Serviço, OC = Ordem de Compra
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["not_started", "in_process", "completed"]).default("not_started").notNull(),
  pdfUrl: varchar("pdfUrl", { length: 500 }),
  pdfKey: varchar("pdfKey", { length: 500 }), // S3 key for the PDF
  totalValue: varchar("totalValue", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items for detailed line items in orders
 */
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  quantity: int("quantity").default(1).notNull(),
  unitValue: varchar("unitValue", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Checklist items for users
 */
export const checklists = mysqlTable("checklists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  completed: boolean("completed").default(false).notNull(),
  dueDate: timestamp("dueDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Checklist = typeof checklists.$inferSelect;
export type InsertChecklist = typeof checklists.$inferInsert;

/**
 * Notifications log for tracking email notifications sent
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderId: int("orderId"),
  type: mysqlEnum("type", ["status_change", "pdf_attached"]).notNull(),
  message: text("message"),
  sent: boolean("sent").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  checklists: many(checklists),
  notifications: many(notifications),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));