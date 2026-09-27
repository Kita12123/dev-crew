import type { PrismaClient, IntegrationProvider } from "@gen/prisma/client";
import { WorkspaceDto } from "../entity/workspace";
import { UUID } from "crypto";


export interface IWorkspaceRepository {
    findById(id: string): Promise<WorkspaceDto | null>;
    upsertWorkspace(workspaceId: UUID, name: string, description?: string | null): Promise<void>;
    upsertIntegration(integrationId: UUID, provider: IntegrationProvider): Promise<void>;
    upsertWorkspaceIntegration(workspaceId: UUID, integrationId: UUID): Promise<void>;
    upsertRedmineIntegration(integrationId: UUID, projectId: number, url: string): Promise<void>;
    upsertGithubIntegration(integrationId: UUID, owner: string, repository: string): Promise<void>;
    upsertSlackIntegration(integrationId: UUID, channelId: string): Promise<void>;
}

export class WorkspaceRepository implements IWorkspaceRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id },
            include: {
                integrations: {
                    include: {
                        integration: {
                            include: {
                                redmine: true,
                                github: true,
                                slack: true,
                            },
                        },
                    },
                },
            },
        });
        if (!workspace) return null;
        return {
            id: workspace.id,
            name: workspace.name,
            description: workspace.description,
            integrations: workspace.integrations.map(i => ({
                integrationId: i.integrationId,
                provider: i.integration.provider,
                redmine: i.integration.redmine ? {
                    id: i.integration.redmine.id,
                    projectId: i.integration.redmine.projectId,
                    url: i.integration.redmine.url,
                } : null,
                github: i.integration.github ? {
                    id: i.integration.github.id,
                    owner: i.integration.github.owner,
                    repository: i.integration.github.repository,
                } : null,
                slack: i.integration.slack ? {
                    id: i.integration.slack.id,
                    channelId: i.integration.slack.channelId,
                } : null,
            })),
        } as WorkspaceDto;
    }

    async upsertWorkspace(workspaceId: UUID, name: string, description?: string | null) {
        await this.prisma.workspace.upsert({
            where: {
                id: workspaceId,
            },
            create: {
                id: workspaceId,
                name: name,
                description: description,
            },
            update: {
                name: name,
                description: description,
            },
        });
    }

    async upsertIntegration(integrationId: UUID, provider: IntegrationProvider) {
        await this.prisma.integration.upsert({
            where: {
                id: integrationId,
            },
            create: {
                id: integrationId,
                provider: provider,
            },
            update: {
                provider: provider,
            },
        });
    }

    async upsertWorkspaceIntegration(workspaceId: UUID, integrationId: UUID) {
        await this.prisma.workspaceIntegration.upsert({
            where: {
                workspaceId_integrationId: {
                    workspaceId: workspaceId,
                    integrationId: integrationId,
                },
            },
            create: {
                workspaceId: workspaceId,
                integrationId: integrationId,
            },
            update: {},
        });
    }

    async upsertRedmineIntegration(integrationId: UUID, projectId: number, url: string) {
        await this.prisma.redmineIntegration.upsert({
            where: {
                integrationId: integrationId,
            },
            create: {
                integrationId: integrationId,
                projectId: projectId,
                url: url,
            },
            update: {
                projectId: projectId,
                url: url,
            },
        });
    }

    async upsertGithubIntegration(integrationId: UUID, owner: string, repository: string) {
        await this.prisma.githubIntegration.upsert({
            where: {
                integrationId: integrationId,
            },
            create: {
                integrationId: integrationId,
                owner: owner,
                repository: repository,
            },
            update: {
                owner: owner,
                repository: repository,
            },
        });
    }

    async upsertSlackIntegration(integrationId: UUID, channelId: string) {
        await this.prisma.slackIntegration.upsert({
            where: {
                integrationId: integrationId,
            },
            create: {
                integrationId: integrationId,
                channelId: channelId,
            },
            update: {
                channelId: channelId,
            },
        });
    }
}