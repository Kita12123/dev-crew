import type { Prisma } from "@gen/prisma/client";

import type { components } from "@gen/api/types";

type IntegrationProvider = components["schemas"]["IntegrationProvider"];
type ApiUser = components["schemas"]["User"];
type ApiWorkspace = components["schemas"]["Workspace"];
type ApiIntegration = components["schemas"]["Integration"];
type ApiCredential = components["schemas"]["Credential"];
type IntegrationInput = components["schemas"]["IntegrationInput"];

/**
 * Prisma が返す行の構造。
 * 生成クライアントの *GetPayload 型は非公開（export されていない）ため、
 * mapper の入力は入力側の構造的型で定義する（不一致は呼び出し側でコンパイルエラーになる）。
 */
export type CredentialRow = {
    id: string;
    provider: IntegrationProvider;
    value: string;
};

export type UserRow = {
    id: string;
    email: string;
    name: string;
    credentials: CredentialRow[];
};

export type IntegrationRow = {
    id: string;
    provider: IntegrationProvider;
    redmine: { id: string; url: string; projectId: number } | null;
    github: { id: string; owner: string; repository: string } | null;
    slack: { id: string; channelId: string } | null;
};

export type WorkspaceRow = {
    id: string;
    name: string;
    description: string | null;
    integrations: { integration: IntegrationRow }[];
};

/** 統合の詳細行（provider 別）まで含めて取得するための include */
export const integrationInclude = {
    redmine: true,
    github: true,
    slack: true,
} satisfies Prisma.IntegrationInclude;

/** ワークスペースに紐づく統合まで含めて取得するための include */
export const workspaceInclude = {
    integrations: { include: { integration: { include: integrationInclude } } },
} satisfies Prisma.WorkspaceInclude;

export const toApiCredential = (row: CredentialRow): ApiCredential => ({
    id: row.id,
    provider: row.provider,
    value: row.value,
});

export const toApiUser = (row: UserRow): ApiUser => ({
    id: row.id,
    email: row.email,
    name: row.name,
    credentials: row.credentials.map(toApiCredential),
});

export const toApiIntegration = (row: IntegrationRow): ApiIntegration => ({
    id: row.id,
    provider: row.provider,
    // provider 別の詳細は schema 上 optional。null を返すと必須項目不足になるためキーごと落とす
    ...(row.redmine && {
        redmine: { id: row.redmine.id, url: row.redmine.url, projectId: row.redmine.projectId },
    }),
    ...(row.github && {
        github: { id: row.github.id, owner: row.github.owner, repository: row.github.repository },
    }),
    ...(row.slack && {
        slack: { id: row.slack.id, channelId: row.slack.channelId },
    }),
});

export const toApiWorkspace = (row: WorkspaceRow): ApiWorkspace => ({
    id: row.id,
    name: row.name,
    description: row.description,
    integrations: row.integrations.map(({ integration }) => toApiIntegration(integration)),
});

/** 作成用：provider に対応する詳細行をネスト create する（1 クエリで原子的に作成される） */
export const integrationDetailCreate = (input: IntegrationInput) => {
    switch (input.provider) {
        case "REDMINE":
            return { redmine: { create: { url: input.url, projectId: input.projectId } } };
        case "GITHUB":
            return { github: { create: { owner: input.owner, repository: input.repository } } };
        case "SLACK":
            return { slack: { create: { channelId: input.channelId } } };
    }
};

/** 更新用：provider に対応する詳細行を upsert する */
export const integrationDetailUpsert = (input: IntegrationInput) => {
    switch (input.provider) {
        case "REDMINE":
            return {
                redmine: {
                    upsert: {
                        create: { url: input.url, projectId: input.projectId },
                        update: { url: input.url, projectId: input.projectId },
                    },
                },
            };
        case "GITHUB":
            return {
                github: {
                    upsert: {
                        create: { owner: input.owner, repository: input.repository },
                        update: { owner: input.owner, repository: input.repository },
                    },
                },
            };
        case "SLACK":
            return {
                slack: {
                    upsert: {
                        create: { channelId: input.channelId },
                        update: { channelId: input.channelId },
                    },
                },
            };
    }
};
