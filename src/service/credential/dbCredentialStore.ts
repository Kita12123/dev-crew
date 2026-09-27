import type { PrismaClient, IntegrationProvider } from "@gen/prisma/client";

import type { CredentialStore } from ".";

export class DbCredentialStore implements CredentialStore {
    constructor(private readonly prisma: PrismaClient) { }

    async get(
        userId: string,
        provider: IntegrationProvider,
    ): Promise<string | null> {
        const credential = await this.prisma.credential.findFirst({
            where: {
                userId,
                provider,
            },
            select: {
                value: true,
            },
        });

        return credential?.value ?? null;
    }

    async set(
        userId: string,
        provider: IntegrationProvider,
        value: string,
    ): Promise<void> {
        await this.prisma.credential.upsert({
            where: {
                userId_provider: {
                    userId,
                    provider,
                },
            },
            create: {
                userId,
                provider,
                value,
            },
            update: {
                value,
            },
        });
    }

    async delete(
        userId: string,
        provider: IntegrationProvider,
    ): Promise<void> {
        await this.prisma.credential.deleteMany({
            where: {
                userId,
                provider,
            },
        });
    }
}