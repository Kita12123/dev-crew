import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@gen/prisma/client";

import { config } from "@/config/env";

// Prisma 7 ではドライバアダプタの指定が必須（@prisma/adapter-pg）。
// 接続はクエリ実行時に遅延されるため、この時点では DB へ接続しない。
const adapter = new PrismaPg({ connectionString: config.db.url });

export const prisma = new PrismaClient({ adapter });
