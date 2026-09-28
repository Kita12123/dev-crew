import type { Handlers } from "@gen/api/handlers";

import { prisma } from "@/db/client";

import { NotFoundError } from "./errors";
import {
    integrationDetailCreate,
    integrationDetailUpsert,
    integrationInclude,
    toApiCredential,
    toApiIntegration,
    toApiUser,
    toApiWorkspace,
    workspaceInclude,
} from "./mappers";

/** 対象のユーザーが存在することを確認する（存在しなければ 404） */
const ensureUserExists = async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw new NotFoundError(`user not found: ${userId}`);
};

/** 対象のワークスペースが存在することを確認する（存在しなければ 404） */
const ensureWorkspaceExists = async (workspaceId: string) => {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { id: true } });
    if (!workspace) throw new NotFoundError(`workspace not found: ${workspaceId}`);
};

/**
 * OpenAPI（lib/api/openapi.yml）の operationId と 1:1 で対応するハンドラ。
 *
 * `Handlers` 経由で request.params / request.body / 戻り値が文脈的に型付けされるため
 * 明示的な型注釈は不要。応答は `reply.code(...)` でステータスを指定してから return する
 * （戻り値型に FastifyReply は含まれないため `return reply.send(...)` は使わない）。
 */
export const handlers: Handlers = {
    // ---------------------------------------------------------------- Users
    async getUser(request) {
        const user = await prisma.user.findUnique({
            where: { id: request.params.userId },
            include: { credentials: true },
        });
        if (!user) throw new NotFoundError(`user not found: ${request.params.userId}`);
        return toApiUser(user);
    },

    async updateUser(request) {
        const { userId } = request.params;
        const { email, name } = request.body;

        const { count } = await prisma.user.updateMany({ where: { id: userId }, data: { email, name } });
        if (count === 0) throw new NotFoundError(`user not found: ${userId}`);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { credentials: true },
        });
        if (!user) throw new NotFoundError(`user not found: ${userId}`);
        return toApiUser(user);
    },

    async deleteUser(request, reply) {
        const { count } = await prisma.user.deleteMany({ where: { id: request.params.userId } });
        if (count === 0) throw new NotFoundError(`user not found: ${request.params.userId}`);
        reply.code(204).send();
    },

    // ---------------------------------------------------------- Credentials
    async listCredentials(request) {
        const credentials = await prisma.credential.findMany({
            where: { userId: request.params.userId },
            orderBy: { createdAt: "asc" },
        });
        return credentials.map(toApiCredential);
    },

    async createCredential(request, reply) {
        const { userId } = request.params;
        const { provider, value } = request.body;

        await ensureUserExists(userId);

        // 同一ユーザー・同一 provider の重複は @@unique([userId, provider]) により 409 になる
        const credential = await prisma.credential.create({
            data: { userId, provider, value },
        });

        reply.code(201);
        return toApiCredential(credential);
    },

    async getCredential(request) {
        const { userId, credentialId } = request.params;
        const credential = await prisma.credential.findFirst({ where: { id: credentialId, userId } });
        if (!credential) throw new NotFoundError(`credential not found: ${credentialId}`);
        return toApiCredential(credential);
    },

    async updateCredential(request) {
        const { userId, credentialId } = request.params;
        const { provider, value } = request.body;

        const { count } = await prisma.credential.updateMany({
            where: { id: credentialId, userId },
            data: { provider, value },
        });
        if (count === 0) throw new NotFoundError(`credential not found: ${credentialId}`);

        const credential = await prisma.credential.findUnique({ where: { id: credentialId } });
        if (!credential) throw new NotFoundError(`credential not found: ${credentialId}`);
        return toApiCredential(credential);
    },

    async deleteCredential(request, reply) {
        const { userId, credentialId } = request.params;
        const { count } = await prisma.credential.deleteMany({ where: { id: credentialId, userId } });
        if (count === 0) throw new NotFoundError(`credential not found: ${credentialId}`);
        reply.code(204).send();
    },

    // ----------------------------------------------------------- Workspaces
    async listWorkspaces() {
        const workspaces = await prisma.workspace.findMany({
            include: workspaceInclude,
            orderBy: { createdAt: "asc" },
        });
        return workspaces.map(toApiWorkspace);
    },

    async createWorkspace(request, reply) {
        const workspace = await prisma.workspace.create({
            data: {
                name: request.body.name,
                description: request.body.description ?? null,
            },
            include: workspaceInclude,
        });

        reply.code(201);
        return toApiWorkspace(workspace);
    },

    async getWorkspace(request) {
        const workspace = await prisma.workspace.findUnique({
            where: { id: request.params.workspaceId },
            include: workspaceInclude,
        });
        if (!workspace) throw new NotFoundError(`workspace not found: ${request.params.workspaceId}`);
        return toApiWorkspace(workspace);
    },

    async updateWorkspace(request) {
        const { workspaceId } = request.params;
        const { name, description } = request.body;

        const { count } = await prisma.workspace.updateMany({
            where: { id: workspaceId },
            // description は「省略＝変更なし / null＝クリア」
            data: { name, ...(description === undefined ? {} : { description }) },
        });
        if (count === 0) throw new NotFoundError(`workspace not found: ${workspaceId}`);

        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: workspaceInclude,
        });
        if (!workspace) throw new NotFoundError(`workspace not found: ${workspaceId}`);
        return toApiWorkspace(workspace);
    },

    async deleteWorkspace(request, reply) {
        // 紐づく workspace_integrations は onDelete: Cascade で削除される
        const { count } = await prisma.workspace.deleteMany({ where: { id: request.params.workspaceId } });
        if (count === 0) throw new NotFoundError(`workspace not found: ${request.params.workspaceId}`);
        reply.code(204).send();
    },

    // --------------------------------------------------------- Integrations
    async listIntegrations(request) {
        // ワークスペース未存在の場合の 404 は spec に定義されていないため空配列を返す
        const links = await prisma.workspaceIntegration.findMany({
            where: { workspaceId: request.params.workspaceId },
            include: { integration: { include: integrationInclude } },
            orderBy: { createdAt: "asc" },
        });
        return links.map(link => toApiIntegration(link.integration));
    },

    async createIntegration(request, reply) {
        const { workspaceId } = request.params;
        const input = request.body;

        await ensureWorkspaceExists(workspaceId);

        // provider 別の詳細行とリンク行をネスト create（1 クエリで原子的に作成される）
        const integration = await prisma.integration.create({
            data: {
                provider: input.provider,
                ...integrationDetailCreate(input),
                workspaces: { create: { workspaceId } },
            },
            include: integrationInclude,
        });

        reply.code(201);
        return toApiIntegration(integration);
    },

    async getIntegration(request) {
        const { workspaceId, integrationId } = request.params;
        const link = await prisma.workspaceIntegration.findUnique({
            where: { workspaceId_integrationId: { workspaceId, integrationId } },
            include: { integration: { include: integrationInclude } },
        });
        if (!link) throw new NotFoundError(`integration not found: ${integrationId}`);
        return toApiIntegration(link.integration);
    },

    async updateIntegration(request) {
        const { workspaceId, integrationId } = request.params;
        const input = request.body;

        const link = await prisma.workspaceIntegration.findUnique({
            where: { workspaceId_integrationId: { workspaceId, integrationId } },
            select: { integrationId: true },
        });
        if (!link) throw new NotFoundError(`integration not found: ${integrationId}`);

        const integration = await prisma.$transaction(async (tx) => {
            // provider を切り替えた場合に備え、対象外の詳細行を先に削除する
            // （存在しない場合でも deleteMany は成功する）
            if (input.provider !== "REDMINE") await tx.redmineIntegration.deleteMany({ where: { integrationId } });
            if (input.provider !== "GITHUB") await tx.githubIntegration.deleteMany({ where: { integrationId } });
            if (input.provider !== "SLACK") await tx.slackIntegration.deleteMany({ where: { integrationId } });

            return tx.integration.update({
                where: { id: integrationId },
                data: {
                    provider: input.provider,
                    ...integrationDetailUpsert(input),
                },
                include: integrationInclude,
            });
        });

        return toApiIntegration(integration);
    },

    async deleteIntegration(request, reply) {
        const { workspaceId, integrationId } = request.params;

        // ワークスペースに紐づく統合のみを対象にする（詳細行・リンク行は onDelete: Cascade で削除される）
        const { count } = await prisma.integration.deleteMany({
            where: { id: integrationId, workspaces: { some: { workspaceId } } },
        });
        if (count === 0) throw new NotFoundError(`integration not found: ${integrationId}`);
        reply.code(204).send();
    },
};
