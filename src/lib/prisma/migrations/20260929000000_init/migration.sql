-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('REDMINE', 'GITHUB', 'SLACK');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credentials" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_integrations" (
    "workspaceId" UUID NOT NULL,
    "integrationId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_integrations_pkey" PRIMARY KEY ("workspaceId","integrationId")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" UUID NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redmine_integrations" (
    "id" UUID NOT NULL,
    "integrationId" UUID NOT NULL,
    "projectId" INTEGER NOT NULL,
    "url" VARCHAR(2048) NOT NULL,

    CONSTRAINT "redmine_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "github_integrations" (
    "id" UUID NOT NULL,
    "integrationId" UUID NOT NULL,
    "owner" VARCHAR(255) NOT NULL,
    "repository" VARCHAR(255) NOT NULL,

    CONSTRAINT "github_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slack_integrations" (
    "id" UUID NOT NULL,
    "integrationId" UUID NOT NULL,
    "channelId" VARCHAR(255) NOT NULL,

    CONSTRAINT "slack_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "credentials_userId_provider_key" ON "credentials"("userId", "provider");

-- CreateIndex
CREATE INDEX "workspace_integrations_integrationId_idx" ON "workspace_integrations"("integrationId");

-- CreateIndex
CREATE UNIQUE INDEX "redmine_integrations_integrationId_key" ON "redmine_integrations"("integrationId");

-- CreateIndex
CREATE UNIQUE INDEX "redmine_integrations_projectId_url_key" ON "redmine_integrations"("projectId", "url");

-- CreateIndex
CREATE UNIQUE INDEX "github_integrations_integrationId_key" ON "github_integrations"("integrationId");

-- CreateIndex
CREATE UNIQUE INDEX "github_integrations_owner_repository_key" ON "github_integrations"("owner", "repository");

-- CreateIndex
CREATE UNIQUE INDEX "slack_integrations_integrationId_key" ON "slack_integrations"("integrationId");

-- CreateIndex
CREATE UNIQUE INDEX "slack_integrations_channelId_key" ON "slack_integrations"("channelId");

-- AddForeignKey
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_integrations" ADD CONSTRAINT "workspace_integrations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_integrations" ADD CONSTRAINT "workspace_integrations_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redmine_integrations" ADD CONSTRAINT "redmine_integrations_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_integrations" ADD CONSTRAINT "github_integrations_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slack_integrations" ADD CONSTRAINT "slack_integrations_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
