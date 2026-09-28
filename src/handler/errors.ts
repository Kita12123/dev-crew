import type { FastifyInstance } from "fastify";

import { Prisma } from "@gen/prisma/client";

/** 対象のリソースが存在しない（HTTP 404 に対応） */
export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
    }
}

/** リソースの状態が衝突している（HTTP 409 に対応） */
export class ConflictError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ConflictError";
    }
}

/** Prisma の一意制約違反（P2002）かどうか */
export const isUniqueConstraintError = (error: unknown): error is Prisma.PrismaClientKnownRequestError =>
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

/** P2002 の meta.target（違反したカラム）をメッセージ用の文字列に変換する */
const describeTarget = (error: Prisma.PrismaClientKnownRequestError): string => {
    const target = error.meta?.target;
    if (Array.isArray(target)) return target.join(",");
    if (typeof target === "string") return target;
    return "unique constraint";
};

/**
 * ドメイン例外を HTTP ステータスへ変換して応答する。
 * 404 / 409 以外は Fastify 既定の 500 応答に委ねる。
 */
export const registerErrorHandler = (app: FastifyInstance): void => {
    app.setErrorHandler((error, request, reply) => {
        if (error instanceof NotFoundError) {
            return void reply.code(404).send({ message: error.message });
        }
        if (error instanceof ConflictError) {
            return void reply.code(409).send({ message: error.message });
        }
        if (isUniqueConstraintError(error)) {
            return void reply.code(409).send({ message: `already exists: ${describeTarget(error)}` });
        }

        request.log.error(error);
        return void reply.send(error);
    });
};
