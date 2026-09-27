import { config } from "@/config/env";
import { App } from "@slack/bolt";

const app = new App({
    appToken: config.slack.appToken,
    token: config.slack.botToken,
    socketMode: true,
});

app.event("app_mention", async ({ event, client }) => {
    // AI Agentを呼ぶ
});

await app.start();