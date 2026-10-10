CREATE TABLE "project" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "project_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" varchar NOT NULL,
	"projectId" varchar NOT NULL,
	"userInput" varchar NOT NULL,
	"device" varchar,
	"createdAt" date DEFAULT now(),
	"config" json,
	"theme" varchar,
	"projectName" varchar
);
--> statement-breakpoint
CREATE TABLE "screenConfig" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "screenConfig_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"projectId" varchar NOT NULL,
	"screenId" varchar NOT NULL,
	"screenName" varchar,
	"purpose" varchar,
	"screenDescription" varchar,
	"code" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"credits" integer DEFAULT 5,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_userId_users_email_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screenConfig" ADD CONSTRAINT "screenConfig_projectId_project_projectId_fk" FOREIGN KEY ("projectId") REFERENCES "public"."project"("projectId") ON DELETE no action ON UPDATE no action;