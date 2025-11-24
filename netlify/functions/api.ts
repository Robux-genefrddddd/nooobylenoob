import serverless from "serverless-http";

// @ts-ignore - Loading compiled ES module
import { createServer } from "../../dist/server/production.mjs";

export const handler = serverless(createServer());
