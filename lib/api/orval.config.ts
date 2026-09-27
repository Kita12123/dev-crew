import { defineConfig } from 'orval';

export default defineConfig({
    redmine: {
        input: 'https://github.com/d-yoshi/redmine-openapi/releases/latest/download/openapi.yaml',
        output: {
            mode: 'tags-split',
            target: '../generated/rdmn/client.ts',
            schemas: '../generated/rdmn/model',
            client: 'react-query',

            baseUrl: {
                getBaseUrlFromSpecification: true
            },

            override: {
                fetch: {
                    includeHttpResponseReturnType: false
                }
            }
        }
    }
});
