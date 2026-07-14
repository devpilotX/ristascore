-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('subject', 'admin', 'api_client');

-- CreateEnum
CREATE TYPE "CheckType" AS ENUM ('government_id', 'employment_income', 'education', 'marital_status', 'criminal_record');

-- CreateEnum
CREATE TYPE "CheckStatus" AS ENUM ('verified', 'mismatch', 'unverifiable', 'pending');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'running', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('open', 'under_review', 'resolved', 'rejected');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'subject',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "authorized_checks" "CheckType"[],
    "consent_text" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "consented_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRequest" (
    "id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "consent_id" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "claimed_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckResult" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "check_type" "CheckType" NOT NULL,
    "status" "CheckStatus" NOT NULL DEFAULT 'pending',
    "provider_name" TEXT NOT NULL,
    "provider_response" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "score_contribution" INTEGER NOT NULL DEFAULT 0,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustScore" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "total_score" INTEGER NOT NULL,
    "max_score" INTEGER NOT NULL DEFAULT 900,
    "grade" TEXT NOT NULL,
    "breakdown" JSONB NOT NULL,
    "coverage" JSONB NOT NULL,
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrustScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustBadge" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "visible_fields" "CheckType"[],
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BadgeAuditLog" (
    "id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "viewer_ip" TEXT,
    "viewer_user_agent" TEXT,
    "api_key_id" TEXT,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BadgeAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "check_result_id" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'open',
    "reason" TEXT NOT NULL,
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Consent_user_id_idx" ON "Consent"("user_id");

-- CreateIndex
CREATE INDEX "VerificationRequest_subject_id_idx" ON "VerificationRequest"("subject_id");

-- CreateIndex
CREATE INDEX "VerificationRequest_consent_id_idx" ON "VerificationRequest"("consent_id");

-- CreateIndex
CREATE INDEX "CheckResult_request_id_idx" ON "CheckResult"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "TrustScore_request_id_key" ON "TrustScore"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "TrustBadge_request_id_key" ON "TrustBadge"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "TrustBadge_token_key" ON "TrustBadge"("token");

-- CreateIndex
CREATE INDEX "TrustBadge_token_idx" ON "TrustBadge"("token");

-- CreateIndex
CREATE INDEX "BadgeAuditLog_badge_id_idx" ON "BadgeAuditLog"("badge_id");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_hash_key" ON "ApiKey"("key_hash");

-- CreateIndex
CREATE INDEX "ApiKey_owner_id_idx" ON "ApiKey"("owner_id");

-- CreateIndex
CREATE INDEX "Dispute_subject_id_idx" ON "Dispute"("subject_id");

-- CreateIndex
CREATE INDEX "Dispute_check_result_id_idx" ON "Dispute"("check_result_id");

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_consent_id_fkey" FOREIGN KEY ("consent_id") REFERENCES "Consent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckResult" ADD CONSTRAINT "CheckResult_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "VerificationRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustScore" ADD CONSTRAINT "TrustScore_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "VerificationRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustBadge" ADD CONSTRAINT "TrustBadge_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "VerificationRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BadgeAuditLog" ADD CONSTRAINT "BadgeAuditLog_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "TrustBadge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_check_result_id_fkey" FOREIGN KEY ("check_result_id") REFERENCES "CheckResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
