import type { PrismaClient, Credential, IntegrationProvider } from "@gen/prisma/client";
import { UserDto } from "../entity/user";
import { UUID } from "crypto";

export interface IUserRepository {
    findById(id: string): Promise<UserDto | null>;
    upsertUser(userId: UUID, email: string, name: string): Promise<void>;
    upsertCredential(userId: UUID, credentialId: UUID, provider: IntegrationProvider, value: string): Promise<void>;
}

export class UserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string) {
        var user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                credentials: true,
            },
        });
        if (!user) return null;
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            credentials: user.credentials.map(c => ({
                id: c.id,
                provider: c.provider,
                value: c.value,
            }))
        } as UserDto;
    }

    async upsertUser(userId: UUID, email: string, name: string) {
        await this.prisma.user.upsert({
            where: {
                id: userId,
            },
            create: {
                id: userId,
                email: email,
                name: name,
            },
            update: {
                email: email,
                name: name,
            },
        });
    }

    async upsertCredential(userId: UUID, credentialId: UUID, provider: IntegrationProvider, value: string) {
        await this.prisma.credential.upsert({
            where: {
                id: credentialId,
                userId: userId,
            },
            create: {
                id: credentialId,
                userId: userId,
                provider: provider,
                value: value
            },
            update: {
                provider: provider,
                value: value
            },
        });
    }
}
