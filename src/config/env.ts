for (const envFile of [".env", "../.env"]) {
    try {
        process.loadEnvFile?.(envFile);
        break;
    } catch {
        // 候補が見つからない場合は次の候補へ
    }
}

export const config = {
    db: {
        url: process.env.DATABASE_URL!,
    },
    github: {
        token: process.env.GITHUB_TOKEN!,
    },

    slack: {
        botToken: process.env.SLACK_BOT_TOKEN!,
        appToken: process.env.SLACK_APP_TOKEN!,
    },

    redmine: {
        baseUrl: process.env.REDMINE_BASE_URL!,
        apiKey: process.env.REDMINE_API_KEY!,
    },

    llm: {
        baseUrl: process.env.LLM_BASE_URL!,
        apiKey: process.env.LLM_API_KEY!,
        model: process.env.LLM_MODEL!,
    },
} as const;