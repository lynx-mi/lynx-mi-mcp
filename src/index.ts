#!/usr/bin/env node

/**
 * Lynx MI MCP Server
 *
 * Model Context Protocol server that exposes Lynx Market Intelligence
 * data to AI coding assistants (Claude, Cursor, Windsurf, etc.).
 *
 * Usage:
 *   LYNX_MI_API_KEY=sk_live_... npx lynx-mi-mcp-server
 *
 * Or configure in claude_desktop_config.json:
 *   {
 *     "mcpServers": {
 *       "lynx-mi": {
 *         "command": "npx",
 *         "args": ["-y", "lynx-mi-mcp-server"],
 *         "env": { "LYNX_MI_API_KEY": "sk_live_..." }
 *       }
 *     }
 *   }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { LynxClient } from "./client.js";
import { TOOLS, handleToolCall } from "./tools.js";

// ─── Configuration ───────────────────────────────────────────

const API_KEY = process.env.LYNX_MI_API_KEY;
const BASE_URL = process.env.LYNX_MI_BASE_URL; // Optional override

if (!API_KEY) {
  console.error(
    "╔══════════════════════════════════════════════════════════╗\n" +
      "║  ERROR: LYNX_MI_API_KEY environment variable not set   ║\n" +
      "║                                                        ║\n" +
      "║  Get your API key at https://lynx-mi.com/settings      ║\n" +
      "║  (requires Advanced subscription or higher)            ║\n" +
      "║                                                        ║\n" +
      "║  Set it in your MCP config:                            ║\n" +
      '║    "env": { "LYNX_MI_API_KEY": "sk_live_..." }         ║\n' +
      "╚══════════════════════════════════════════════════════════╝"
  );
  process.exit(1);
}

// ─── Server Setup ────────────────────────────────────────────

const client = new LynxClient(API_KEY, BASE_URL);

const server = new McpServer({
  name: "lynx-mi",
  version: "1.0.0",
});

import { z } from "zod";

// ─── Register Tools ──────────────────────────────────────────

for (const tool of TOOLS) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [key, prop] of Object.entries((tool.inputSchema.properties || {}) as Record<string, any>)) {
    let zType: z.ZodTypeAny;
    if (prop.type === "string") {
      if (prop.enum && Array.isArray(prop.enum) && prop.enum.length > 0) {
        zType = z.enum(prop.enum as [string, ...string[]]);
      } else {
        zType = z.string();
      }
    } else if (prop.type === "number") {
      zType = z.number();
    } else if (prop.type === "boolean") {
      zType = z.boolean();
    } else {
      zType = z.any();
    }
    
    if (prop.description) {
      zType = zType.describe(prop.description);
    }
    
    if (!tool.inputSchema.required?.includes(key)) {
      zType = zType.optional();
    }
    
    shape[key] = zType;
  }

  server.tool(
    tool.name,
    tool.description,
    shape,
    async (args: Record<string, unknown>) => {
      const resultText = await handleToolCall(client, tool.name, args);

      // Check if the result is an error
      let isError = false;
      try {
        const parsed = JSON.parse(resultText);
        if (parsed.error) {
          isError = true;
        }
      } catch {
        // not JSON, treat as success
      }

      return {
        content: [
          {
            type: "text" as const,
            text: resultText,
          },
        ],
        isError,
      };
    }
  );
}

// ─── Start Server ────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🐆 Lynx MI MCP Server running (stdio transport)");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
