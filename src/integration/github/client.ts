import { config } from "@/config/env";
import { Octokit } from "octokit";

const github = new Octokit({
    auth: config.github.token,
});

const { data } = await github.rest.issues.listForRepo({
    owner: "my-org",
    repo: "my-repo",
});