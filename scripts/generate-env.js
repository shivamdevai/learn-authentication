import dotenv from "dotenv";
dotenv.config({
  path: ".env.bitwarden",
});
import { exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";

const execAsync = promisify(exec);

const accessToken = process.env.BWS_ACCESS_TOKEN;

if (!accessToken) {
  console.error("BWS_ACCESS_TOKEN is missing.");
  process.exit(1);
}

const execOptions = {
  env: {
    ...process.env,
    BWS_ACCESS_TOKEN: accessToken,
  },
};

async function main() {
  try {
    console.log("Fetching secrets from Bitwarden...");

    // Get all secrets
    const { stdout } = await execAsync("bws secret list", execOptions);

    const secrets = JSON.parse(stdout);

    // Fetch all secrets parallel
    const secretDataList = await Promise.all(
      secrets.map(async (secret) => {
        const { stdout } = await execAsync(
          `bws secret get ${secret.id}`,
          execOptions,
        );
        return JSON.parse(stdout);
      }),
    );

    // Prepare .env data
    const envSecrets = secretDataList.map((secretData) => ({
      key: secretData.key,
      value: secretData.value,
    }));

    // Convert to .env format
    const envContent = envSecrets
      .map((secret) => `${secret.key}=${secret.value}`)
      .join("\n");

    // Generate file
    fs.writeFileSync(".env", envContent);
    console.log(".env generated successfully.");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
