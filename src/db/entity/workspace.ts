import { IntegrationProvider } from "@gen/prisma"
import { UUID } from "crypto"

export type WorkspaceDto = {
    id: UUID,
    name: string,
    description: string | null,
    integrations: WorkspaceIntegrationDto[]
}

export type WorkspaceIntegrationDto = {
    integrationId: UUID,
    provider: IntegrationProvider,
    redmine: RedmineIntegrationDto | null,
    github: GithubIntegrationDto | null,
    slack: SlackIntegrationDto | null,
}

export type RedmineIntegrationDto = {
    id: UUID,
    projectId: number,
    url: string,
}

export type GithubIntegrationDto = {
    id: UUID,
    owner: string,
    repository: string,
}

export type SlackIntegrationDto = {
    id: UUID,
    channelId: string,
}
