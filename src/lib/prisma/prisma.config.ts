import { config } from '../../config/env'
import { defineConfig } from '@prisma/config'

export default defineConfig({
    schema: "./schema.prisma",
    migrations: {
        path: "./migrations",
    },
    datasource: {
        url: config.db.url,
    },
});