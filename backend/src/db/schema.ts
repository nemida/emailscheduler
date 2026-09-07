import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const emailStatusEnum = pgEnum('email_status', [
  'scheduled',
  'sent',
  'failed',
]);

export const campaignStatusEnum = pgEnum('campaign_status', [
  'scheduled',
  'sending',
  'completed',
  'failed',
]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  googleId: text('google_id').unique().notNull(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  slackToken: text('slack_token'),
  slackChannel: text('slack_channel'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const senders = pgTable('senders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  name: text('name').notNull(),
  smtpHost: text('smtp_host').notNull(),
  smtpPort: integer('smtp_port').notNull(),
  smtpUser: text('smtp_user').notNull(),
  smtpPass: text('smtp_pass').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').references(() => senders.id, { onDelete: 'set null' }),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  delaySeconds: integer('delay_seconds').notNull().default(2),
  hourlyLimit: integer('hourly_limit').notNull().default(200),
  status: campaignStatusEnum('status').notNull().default('scheduled'),
  totalCount: integer('total_count').notNull().default(0),
  sentCount: integer('sent_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const emails = pgTable('emails', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').references(() => senders.id, { onDelete: 'set null' }),
  recipient: text('recipient').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  status: emailStatusEnum('status').notNull().default('scheduled'),
  isStarred: boolean('is_starred').notNull().default(false),
  jobId: text('job_id').unique(),
  idempotencyKey: text('idempotency_key').unique().notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  senders: many(senders),
  campaigns: many(campaigns),
  emails: many(emails),
}));

export const sendersRelations = relations(senders, ({ one, many }) => ({
  user: one(users, { fields: [senders.userId], references: [users.id] }),
  campaigns: many(campaigns),
  emails: many(emails),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  user: one(users, { fields: [campaigns.userId], references: [users.id] }),
  sender: one(senders, { fields: [campaigns.senderId], references: [senders.id] }),
  emails: many(emails),
}));

export const emailsRelations = relations(emails, ({ one }) => ({
  campaign: one(campaigns, { fields: [emails.campaignId], references: [campaigns.id] }),
  user: one(users, { fields: [emails.userId], references: [users.id] }),
  sender: one(senders, { fields: [emails.senderId], references: [senders.id] }),
}));

export type User = typeof users.$inferSelect;
export type Sender = typeof senders.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Email = typeof emails.$inferSelect;

export type NewUser = typeof users.$inferInsert;
export type NewSender = typeof senders.$inferInsert;
export type NewCampaign = typeof campaigns.$inferInsert;
export type NewEmail = typeof emails.$inferInsert;
