-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "MaritalState" AS ENUM ('never_married', 'divorced', 'widowed', 'awaiting_divorce');

-- CreateEnum
CREATE TYPE "Diet" AS ENUM ('vegetarian', 'non_vegetarian', 'eggetarian', 'vegan', 'jain');

-- CreateEnum
CREATE TYPE "Habit" AS ENUM ('no', 'occasionally', 'yes');

-- CreateEnum
CREATE TYPE "InterestStatus" AS ENUM ('sent', 'accepted', 'declined', 'withdrawn');

-- AlterTable
ALTER TABLE "VerificationRequest" ADD COLUMN     "verification_mode" TEXT NOT NULL DEFAULT 'sandbox';

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "height_cm" INTEGER,
    "marital_state" "MaritalState" NOT NULL DEFAULT 'never_married',
    "religion" TEXT,
    "community" TEXT,
    "mother_tongue" TEXT,
    "country" TEXT DEFAULT 'India',
    "state" TEXT,
    "city" TEXT,
    "education" TEXT,
    "education_field" TEXT,
    "profession" TEXT,
    "employer" TEXT,
    "annual_income" INTEGER,
    "diet" "Diet",
    "smoking" "Habit",
    "drinking" "Habit",
    "headline" TEXT,
    "about" TEXT,
    "family_details" TEXT,
    "pref_gender" "Gender",
    "pref_age_min" INTEGER,
    "pref_age_max" INTEGER,
    "pref_height_min_cm" INTEGER,
    "pref_height_max_cm" INTEGER,
    "pref_religion" TEXT,
    "pref_community" TEXT,
    "pref_marital_state" TEXT,
    "pref_diet" TEXT,
    "pref_location" TEXT,
    "pref_education" TEXT,
    "pref_notes" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "completeness" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfilePhoto" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfilePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interest" (
    "id" TEXT NOT NULL,
    "from_user_id" TEXT NOT NULL,
    "to_user_id" TEXT NOT NULL,
    "status" "InterestStatus" NOT NULL DEFAULT 'sent',
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shortlist" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shortlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "user_a_id" TEXT NOT NULL,
    "user_b_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileView" (
    "id" TEXT NOT NULL,
    "viewer_id" TEXT NOT NULL,
    "viewed_id" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_user_id_key" ON "Profile"("user_id");

-- CreateIndex
CREATE INDEX "Profile_is_published_gender_idx" ON "Profile"("is_published", "gender");

-- CreateIndex
CREATE INDEX "Profile_religion_idx" ON "Profile"("religion");

-- CreateIndex
CREATE INDEX "Profile_community_idx" ON "Profile"("community");

-- CreateIndex
CREATE INDEX "Profile_city_idx" ON "Profile"("city");

-- CreateIndex
CREATE INDEX "Profile_state_idx" ON "Profile"("state");

-- CreateIndex
CREATE INDEX "Profile_marital_state_idx" ON "Profile"("marital_state");

-- CreateIndex
CREATE INDEX "Profile_annual_income_idx" ON "Profile"("annual_income");

-- CreateIndex
CREATE INDEX "Profile_date_of_birth_idx" ON "Profile"("date_of_birth");

-- CreateIndex
CREATE INDEX "ProfilePhoto_profile_id_idx" ON "ProfilePhoto"("profile_id");

-- CreateIndex
CREATE INDEX "Interest_to_user_id_status_idx" ON "Interest"("to_user_id", "status");

-- CreateIndex
CREATE INDEX "Interest_from_user_id_status_idx" ON "Interest"("from_user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Interest_from_user_id_to_user_id_key" ON "Interest"("from_user_id", "to_user_id");

-- CreateIndex
CREATE INDEX "Shortlist_owner_id_idx" ON "Shortlist"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "Shortlist_owner_id_target_id_key" ON "Shortlist"("owner_id", "target_id");

-- CreateIndex
CREATE INDEX "Conversation_user_a_id_idx" ON "Conversation"("user_a_id");

-- CreateIndex
CREATE INDEX "Conversation_user_b_id_idx" ON "Conversation"("user_b_id");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_user_a_id_user_b_id_key" ON "Conversation"("user_a_id", "user_b_id");

-- CreateIndex
CREATE INDEX "Message_conversation_id_created_at_idx" ON "Message"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "ProfileView_viewed_id_viewed_at_idx" ON "ProfileView"("viewed_id", "viewed_at");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfilePhoto" ADD CONSTRAINT "ProfilePhoto_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shortlist" ADD CONSTRAINT "Shortlist_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shortlist" ADD CONSTRAINT "Shortlist_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileView" ADD CONSTRAINT "ProfileView_viewer_id_fkey" FOREIGN KEY ("viewer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileView" ADD CONSTRAINT "ProfileView_viewed_id_fkey" FOREIGN KEY ("viewed_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
