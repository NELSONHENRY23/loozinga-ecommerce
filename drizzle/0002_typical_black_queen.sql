CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"phone" varchar(50),
	"role" varchar(50) DEFAULT 'Administrator' NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
