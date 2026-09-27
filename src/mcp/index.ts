import { McpServer } from "@modelcontextprotocol/server";

export type ToolRegistrar = (server: McpServer) => void;

export function createMcpServer(
    name: string,
    version: string,
    registerTools: ToolRegistrar,
): McpServer {
    const server = new McpServer({
        name,
        version,
    });

    registerTools(server);

    return server;
}