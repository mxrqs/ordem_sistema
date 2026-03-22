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
  placa: varchar("placa", { length: 20 }),
  km: varchar("km", { length: 20 }),
  contrato: varchar("contrato", { length: 100 }),
  categoria: varchar("categoria", { length: 50 }),
  osNumber: varchar("osNumber", { length: 50 }), // Real OS number
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

/**
 * Photos attached to orders
 */
export const orderPhotos = mysqlTable("orderPhotos", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  label: varchar("label", { length: 100 }), // e.g. "frontal", "km", "orcamento"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderPhoto = typeof orderPhotos.$inferSelect;
export type InsertOrderPhoto = typeof orderPhotos.$inferInsert;

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
  photos: many(orderPhotos),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export const orderPhotosRelations = relations(orderPhotos, ({ one }) => ({
  order: one(orders, {
    fields: [orderPhotos.orderId],
    references: [orders.id],
  }),
}));

/**
 * Request history for WhatsApp-style conversation tracking
 * Stores messages, system events, and attachments per order
 */
export const requestHistory = mysqlTable("requestHistory", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  userId: int("userId").notNull(), // User who created the message/event
  type: mysqlEnum("type", ["message", "system_event", "attachment"]).notNull(),
  // For messages: the text content
  // For system_event: description of what changed (e.g., "Status changed from not_started to in_process")
  // For attachment: metadata about the attachment
  content: text("content"),
  // For system events, what event occurred
  eventType: mysqlEnum("eventType", [
    "status_changed",
    "order_number_assigned",
    "item_added",
    "photo_added",
    "pdf_uploaded",
    "completed",
    "other"
  ]),
  // For attachments: file metadata
  fileName: varchar("fileName", { length: 255 }),
  fileUrl: varchar("fileUrl", { length: 500 }),
  fileKey: varchar("fileKey", { length: 500 }),
  fileType: varchar("fileType", { length: 50 }), // e.g., "application/pdf", "image/jpeg"
  fileSize: int("fileSize"), // in bytes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RequestHistory = typeof requestHistory.$inferSelect;
export type InsertRequestHistory = typeof requestHistory.$inferInsert;

/**
 * Attachments table for request history
 * Stores file attachments linked to history entries
 */
export const historyAttachments = mysqlTable("historyAttachments", {
  id: int("id").autoincrement().primaryKey(),
  historyId: int("historyId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileType: varchar("fileType", { length: 50 }).notNull(), // e.g., "application/pdf", "image/jpeg"
  fileSize: int("fileSize"), // in bytes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HistoryAttachment = typeof historyAttachments.$inferSelect;
export type InsertHistoryAttachment = typeof historyAttachments.$inferInsert;

// Relations for request history
export const requestHistoryRelations = relations(requestHistory, ({ one, many }) => ({
  order: one(orders, {
    fields: [requestHistory.orderId],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [requestHistory.userId],
    references: [users.id],
  }),
  attachments: many(historyAttachments),
}));

export const historyAttachmentsRelations = relations(historyAttachments, ({ one }) => ({
  history: one(requestHistory, {
    fields: [historyAttachments.historyId],
    references: [requestHistory.id],
  }),
}));

/**
 * Password reset tokens for secure password recovery
 */
export const passwordResetTokens = mysqlTable("passwordResetTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

// Relations for password reset tokens
export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));
