CREATE TABLE IF NOT EXISTS "affiliate_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"total_wager" numeric(18, 8) NOT NULL,
	"commission" numeric(18, 8) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bonus_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"user_id" integer,
	"claimed_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	CONSTRAINT "bonus_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goated_wager_leaderboard" (
	"uid" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"wagered_today" numeric(18, 8) DEFAULT '0' NOT NULL,
	"wagered_this_week" numeric(18, 8) DEFAULT '0' NOT NULL,
	"wagered_this_month" numeric(18, 8) DEFAULT '0' NOT NULL,
	"wagered_all_time" numeric(18, 8) DEFAULT '0' NOT NULL,
	"last_synced" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "historical_races" (
	"id" serial PRIMARY KEY NOT NULL,
	"month" text NOT NULL,
	"year" text NOT NULL,
	"prize_pool" numeric(10, 2) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"participants" jsonb NOT NULL,
	"total_wagered" numeric(18, 2) NOT NULL,
	"participant_count" text NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leaderboard_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"name" text NOT NULL,
	"wager_today" numeric(18, 8) DEFAULT '0' NOT NULL,
	"wager_week" numeric(18, 8) DEFAULT '0' NOT NULL,
	"wager_month" numeric(18, 8) DEFAULT '0' NOT NULL,
	"wager_all_time" numeric(18, 8) DEFAULT '0' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "leaderboard_users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mock_wager_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"username" text NOT NULL,
	"wagered_today" numeric(18, 8) DEFAULT '0' NOT NULL,
	"wagered_this_week" numeric(18, 8) DEFAULT '0' NOT NULL,
	"wagered_this_month" numeric(18, 8) DEFAULT '0' NOT NULL,
	"wagered_all_time" numeric(18, 8) DEFAULT '0' NOT NULL,
	"is_mocked" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "newsletter_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"is_subscribed" boolean DEFAULT true NOT NULL,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp,
	"source" text,
	CONSTRAINT "newsletter_subscriptions_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"wager_race_updates" boolean DEFAULT true NOT NULL,
	"vip_status_changes" boolean DEFAULT true NOT NULL,
	"promotional_offers" boolean DEFAULT true NOT NULL,
	"monthly_statements" boolean DEFAULT true NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"push_notifications" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sync_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"error_message" text,
	"duration_ms" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer,
	"user_id" integer,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_staff_reply" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transformation_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"payload" jsonb,
	"duration_ms" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"email_verified" boolean DEFAULT false,
	"bio" text,
	"profile_color" text DEFAULT '#D7FF00',
	"goated_id" text,
	"goated_username" text,
	"goated_account_linked" boolean DEFAULT false,
	"goated_link_requested" boolean DEFAULT false,
	"goated_username_requested" text,
	"goated_link_requested_at" timestamp,
	"total_wager" text,
	"daily_wager" text,
	"weekly_wager" text,
	"monthly_wager" text,
	"daily_rank" integer,
	"weekly_rank" integer,
	"monthly_rank" integer,
	"all_time_rank" integer,
	"account_verified" boolean DEFAULT false,
	"verified_by" text,
	"verified_at" timestamp,
	"last_updated" timestamp,
	"last_wager_sync" timestamp,
	"email_verification_token" text,
	"email_verification_sent_at" timestamp,
	"email_verified_at" timestamp,
	"last_active" timestamp,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_goated_id_unique" UNIQUE("goated_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wager_race_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"race_id" integer,
	"user_id" integer,
	"username" text NOT NULL,
	"wagered" numeric(18, 2) NOT NULL,
	"position" integer NOT NULL,
	"prize_amount" numeric(18, 2) DEFAULT '0',
	"prize_claimed" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"wager_history" jsonb,
	"total_wager_backup" numeric(18, 2),
	"rank_backup" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wager_races" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"prize_pool" numeric(18, 2) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"min_wager" numeric(18, 2) DEFAULT '0' NOT NULL,
	"prize_distribution" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"rules" text,
	"description" text,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wheel_spins" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"segment_index" integer NOT NULL,
	"reward_code" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bonus_codes" ADD CONSTRAINT "bonus_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mock_wager_data" ADD CONSTRAINT "mock_wager_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mock_wager_data" ADD CONSTRAINT "mock_wager_data_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wager_race_participants" ADD CONSTRAINT "wager_race_participants_race_id_wager_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."wager_races"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wager_race_participants" ADD CONSTRAINT "wager_race_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wheel_spins" ADD CONSTRAINT "wheel_spins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
