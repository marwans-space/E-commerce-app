import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGO_URI: z.string().startsWith("mongodb"),
  DB_NAME: z.string().min(1).default("store"),
  JWT_SECRET: z.string().min(32, "must be at least 32 characters"),
  CLIENT_URL: z.string().url(), // used for CORS
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

const env = Object.freeze(parsed.data);
export default env;
