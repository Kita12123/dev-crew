import type { Integration } from "@gen/prisma/client";

export interface IntegrationRepository {
    findById(id: string): Promise<Integration | null>;

    findByWorkspaceId(
        workspaceId: string,
    ): Promise<Integration[]>;

    findByWorkspaceAndIntegration(
        workspaceId: string,
        integrationId: string,
    ): Promise<Integration | null>;
}