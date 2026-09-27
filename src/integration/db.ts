import type { PrismaClient, Integration } from "@gen/prisma/client";
import type { IntegrationRepository } from "./";

export class PrismaIntegrationRepository
    implements IntegrationRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<Integration | null> {
        return this.prisma.integration.findUnique({
            where: { id },
        });
    }

    async findByWorkspaceId(
        workspaceId: string,
    ): Promise<Integration[]> {
        const workspaceIntegrations =
            await this.prisma.workspaceIntegration.findMany({
                where: {
                    workspaceId,
                },
                include: {
                    integration: true,
                },
            });

        return workspaceIntegrations.map(
            ({ integration }) => integration,
        );
    }

    async findByWorkspaceAndIntegration(
        workspaceId: string,
        integrationId: string,
    ): Promise<Integration | null> {
        const workspaceIntegration =
            await this.prisma.workspaceIntegration.findUnique({
                where: {
                    workspaceId_integrationId: {
                        workspaceId,
                        integrationId,
                    },
                },
                include: {
                    integration: true,
                },
            });

        return workspaceIntegration?.integration ?? null;
    }
}