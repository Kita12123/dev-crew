import type { PrismaClient, Workspace } from "@gen/prisma/client";


export interface IWorkspaceRepository {
    findById(id: string): Promise<Workspace | null>
}

export class WorkspaceRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string) {
        return this.prisma.workspace.findUnique({
            where: { id },
            include: {
                integrations: {
                    include: {
                        integration: {
                            include: {
                                redmine: true,
                                github: true,
                                slack: true,
                            },
                        },
                    },
                },
            },
        });
    }
}