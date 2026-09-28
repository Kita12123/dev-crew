import cors from "@fastify/cors";
import Fastify from "fastify";
import openapiGlue from "fastify-openapi-glue";

import { prisma } from "@/db/client";
import { handlers } from "@/handler";
import { registerErrorHandler } from "@/handler/errors";

const app = Fastify({
    logger: true,
    ajv: {
        customOptions: {
            strict: false,
        },
    },
});

const main = async () => {

    registerErrorHandler(app);

    await app.register(cors, {
        origin: "*"
    });
    await app.register(openapiGlue, {
        specification: "./lib/api/openapi.yml",
        serviceHandlers: handlers,
    });

    app.addHook("onClose", async () => {
        await prisma.$disconnect();
    });

    await app.listen({
        host: "0.0.0.0",
        port: 5001,
    });
};

main().catch((error) => {
    app.log.error(error);
    process.exit(1);
});
