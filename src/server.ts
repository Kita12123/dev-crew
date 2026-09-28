import cors from "@fastify/cors";
import Fastify from "fastify";
import openapiGlue from "fastify-openapi-glue";

import { handlers } from "@/handler";

const app = Fastify({
    logger: true,
    ajv: {
        customOptions: {
            strict: false,
        },
    },
});

const main = async () => {
    await app.register(cors, {
        origin: "*"
    });
    await app.register(openapiGlue, {
        specification: "./lib/api/openapi.yml",
        serviceHandlers: handlers,
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