import type { IntegrationProvider } from "@gen/prisma/client";

export interface CredentialStore {
    get(
        userId: string,
        provider: IntegrationProvider,
    ): Promise<string | null>;

    set(
        userId: string,
        provider: IntegrationProvider,
        value: string,
    ): Promise<void>;

    delete(
        userId: string,
        provider: IntegrationProvider,
    ): Promise<void>;
}