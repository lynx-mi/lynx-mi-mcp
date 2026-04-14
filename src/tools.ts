/**
 * Lynx MI MCP Tools
 *
 * Defines all MCP tools (name, description, input schema) and their
 * handler implementations that proxy to the Lynx MI API.
 */

import type { LynxClient } from "./client.js";

// ─── Tool Definitions ────────────────────────────────────────

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export const TOOLS: ToolDefinition[] = [
  // ── Trades ──
  {
    name: "get_latest_trades",
    description:
      "Get the most recent insider trades filed with the SEC. Filter by ticker symbol, insider name, signal type (buy/sell/corp), and time window. Returns trade details including conviction scores.",
    inputSchema: {
      type: "object",
      properties: {
        ticker: {
          type: "string",
          description: "Filter by stock ticker symbol (e.g. AAPL, TSLA)",
        },
        insider_name: {
          type: "string",
          description: "Filter by insider's name",
        },
        signal_type: {
          type: "string",
          enum: ["buy", "sell", "corp"],
          description:
            "Filter by signal type: 'buy' (open-market purchases), 'sell' (open-market sales), 'corp' (corporate actions like grants/exercises)",
        },
        days: {
          type: "number",
          description: "Look back N days (default: 7)",
        },
        limit: {
          type: "number",
          description: "Max results to return (default: 25, max: 100)",
        },
      },
    },
  },
  {
    name: "get_trades_by_ticker",
    description:
      "Get all insider trading activity for a specific stock ticker. Shows who is buying/selling, volumes, and conviction scores.",
    inputSchema: {
      type: "object",
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol (e.g. AAPL)",
        },
        days: {
          type: "number",
          description: "Look back N days (default: 90)",
        },
        limit: {
          type: "number",
          description: "Max results (default: 50)",
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "get_trades_by_insider",
    description:
      "Get all trades by a specific corporate insider across all companies. Useful for tracking an executive's full trading pattern.",
    inputSchema: {
      type: "object",
      properties: {
        insider_name: {
          type: "string",
          description: "Full name of the insider (e.g. 'Mark Zuckerberg')",
        },
        days: {
          type: "number",
          description: "Look back N days (default: 365)",
        },
        limit: {
          type: "number",
          description: "Max results (default: 50)",
        },
      },
      required: ["insider_name"],
    },
  },

  // ── Search ──
  {
    name: "search_insider",
    description:
      "Search for corporate insiders by name. Returns matching names for use as filters in other tools.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Partial or full insider name to search for",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "search_ticker",
    description:
      "Search for stock tickers by symbol or company name. Returns matching tickers.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Partial ticker symbol or company name",
        },
      },
      required: ["query"],
    },
  },

  // ── Market Intelligence ──
  {
    name: "get_market_sentiment",
    description:
      "Get the current market-wide insider sentiment ratio (buy vs. sell activity), showing whether corporate insiders are net buyers or sellers.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_top_movers",
    description:
      "Get stocks with the highest insider trading activity (by volume). Shows which tickers have the most insider interest right now.",
    inputSchema: {
      type: "object",
      properties: {
        days: {
          type: "number",
          description: "Look back N days (default: 7)",
        },
      },
    },
  },
  {
    name: "get_insider_profile",
    description:
      "Get a detailed profile of a specific insider: trading history, avg trade size, sectors, and behavioral patterns.",
    inputSchema: {
      type: "object",
      properties: {
        insider_name: {
          type: "string",
          description: "Full name of the insider",
        },
      },
      required: ["insider_name"],
    },
  },

  // ── Pro Analytics ──
  {
    name: "get_sector_flow",
    description:
      "Aggregate insider money flow by sector. Shows which sectors are seeing the most insider buying vs. selling — a leading indicator of sector rotation.",
    inputSchema: {
      type: "object",
      properties: {
        days: {
          type: "number",
          description: "Look back N days (default: 30)",
        },
      },
    },
  },
  {
    name: "get_correlations",
    description:
      "Find other stocks traded by the same insiders who trade a given ticker. Reveals hidden connections between companies through shared insider activity.",
    inputSchema: {
      type: "object",
      properties: {
        ticker: {
          type: "string",
          description: "The source ticker to find correlations for",
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "get_insider_network",
    description:
      "Build a network graph centered on an insider or company, showing all connected entities. Reveals the web of insider relationships.",
    inputSchema: {
      type: "object",
      properties: {
        node_id: {
          type: "string",
          description: "The insider name or ticker symbol to center the graph on",
        },
        node_type: {
          type: "string",
          enum: ["insider", "company"],
          description: "Whether node_id is an insider name or company ticker (default: 'insider')",
        },
        depth: {
          type: "number",
          description: "Graph traversal depth: 1 or 2 (default: 1)",
        },
      },
      required: ["node_id"],
    },
  },
  {
    name: "get_network_top",
    description:
      "Get the most connected insiders and companies in the network graph. Shows who are the most influential nodes.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_trade_heatmap",
    description:
      "Returns a heatmap of insider trading activity by ticker, showing volume, trade count, net value, and bullish/bearish sentiment for each stock.",
    inputSchema: {
      type: "object",
      properties: {
        days: {
          type: "number",
          description: "Look back N days (default: 7, max: 90)",
        },
      },
    },
  },
  {
    name: "get_earnings_proximity",
    description:
      "Flag insider trades that occurred suspiciously close to upcoming earnings dates. A powerful signal for potential information asymmetry.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Max results (default: 20)",
        },
      },
    },
  },
  {
    name: "get_filing_diff",
    description:
      "Compare an insider's last two SEC filings to see what changed — position size, price, title, and more.",
    inputSchema: {
      type: "object",
      properties: {
        insider_name: {
          type: "string",
          description: "Full name of the insider",
        },
      },
      required: ["insider_name"],
    },
  },
  {
    name: "get_conviction_score",
    description:
      "Get the conviction score breakdown for a specific trade. Scores factor in trade size relative to holdings, cluster patterns, C-suite status, and more.",
    inputSchema: {
      type: "object",
      properties: {
        trade_id: {
          type: "string",
          description: "The unique trade ID (UUID)",
        },
      },
      required: ["trade_id"],
    },
  },

  // ── Leaderboard ──
  {
    name: "get_leaderboard",
    description:
      "Get the insider trading performance leaderboard — which insiders have the best 30/90-day returns after their trades.",
    inputSchema: {
      type: "object",
      properties: {
        days: {
          type: "number",
          description: "Performance window in days (default: 90)",
        },
        limit: {
          type: "number",
          description: "Max results (default: 20)",
        },
      },
    },
  },
  {
    name: "get_insider_rank",
    description:
      "Get a specific insider's rank and performance stats on the leaderboard.",
    inputSchema: {
      type: "object",
      properties: {
        insider_name: {
          type: "string",
          description: "Full name of the insider",
        },
      },
      required: ["insider_name"],
    },
  },

  // ── Nexus (Political Intelligence) ──
  {
    name: "get_nexus_score",
    description:
      "Get the Nexus political intelligence score for a ticker. Combines congressional trading activity, lobbying spend, and insider trading into a single risk/opportunity score.",
    inputSchema: {
      type: "object",
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol",
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "get_congressional_trades",
    description:
      "Get recent stock trades by US Congress members (House and Senate). Filterable by ticker.",
    inputSchema: {
      type: "object",
      properties: {
        ticker: {
          type: "string",
          description: "Optional: filter by ticker symbol",
        },
        days: {
          type: "number",
          description: "Look back N days (default: 90)",
        },
        limit: {
          type: "number",
          description: "Max results (default: 25)",
        },
      },
    },
  },
  {
    name: "get_lobbying_activity",
    description:
      "Get corporate lobbying reports — which companies are spending on lobbying, in what issue areas, and how much.",
    inputSchema: {
      type: "object",
      properties: {
        ticker: {
          type: "string",
          description: "Optional: filter by company ticker",
        },
        limit: {
          type: "number",
          description: "Max results (default: 25)",
        },
      },
    },
  },
];

// ─── Tool Handlers ───────────────────────────────────────────

export async function handleToolCall(
  client: LynxClient,
  toolName: string,
  args: Record<string, unknown>
): Promise<string> {
  try {
    let result: unknown;

    switch (toolName) {
      // ── Trades ──
      case "get_latest_trades":
        result = await client.getLatestTrades({
          ticker: args.ticker as string | undefined,
          insider_name: args.insider_name as string | undefined,
          signal_type: args.signal_type as string | undefined,
          days: args.days as number | undefined,
          limit: args.limit as number | undefined,
        });
        break;

      case "get_trades_by_ticker":
        result = await client.getTradesByTicker(args.ticker as string, {
          days: args.days as number | undefined,
          limit: args.limit as number | undefined,
        });
        break;

      case "get_trades_by_insider":
        result = await client.getTradesByInsider(args.insider_name as string, {
          days: args.days as number | undefined,
          limit: args.limit as number | undefined,
        });
        break;

      // ── Search ──
      case "search_insider":
        result = await client.searchInsider(args.query as string);
        break;

      case "search_ticker":
        result = await client.searchTicker(args.query as string);
        break;

      // ── Market Intelligence ──
      case "get_market_sentiment":
        result = await client.getMarketSentiment();
        break;

      case "get_top_movers":
        result = await client.getTopMovers({
          days: args.days as number | undefined,
        });
        break;

      case "get_insider_profile":
        result = await client.getInsiderStats(args.insider_name as string);
        break;

      // ── Pro Analytics ──
      case "get_sector_flow":
        result = await client.getSectorFlow({
          days: args.days as number | undefined,
        });
        break;

      case "get_correlations":
        result = await client.getCorrelations(args.ticker as string);
        break;

      case "get_insider_network":
        result = await client.getInsiderNetwork(args.node_id as string, {
          node_type: args.node_type as string | undefined,
          depth: args.depth as number | undefined,
        });
        break;

      case "get_network_top":
        result = await client.getNetworkTop();
        break;

      case "get_trade_heatmap":
        result = await client.getTradeHeatmap({
          days: args.days as number | undefined,
        });
        break;

      case "get_earnings_proximity":
        result = await client.getEarningsProximity({
          limit: args.limit as number | undefined,
        });
        break;

      case "get_filing_diff":
        result = await client.getFilingDiff(args.insider_name as string);
        break;

      case "get_conviction_score":
        result = await client.getConvictionScore(args.trade_id as string);
        break;

      // ── Leaderboard ──
      case "get_leaderboard":
        result = await client.getLeaderboard({
          days: args.days as number | undefined,
          limit: args.limit as number | undefined,
        });
        break;

      case "get_insider_rank":
        result = await client.getInsiderRank(args.insider_name as string);
        break;

      // ── Nexus ──
      case "get_nexus_score":
        result = await client.getNexusScore(args.ticker as string);
        break;

      case "get_congressional_trades":
        result = await client.getCongressionalTrades({
          ticker: args.ticker as string | undefined,
          days: args.days as number | undefined,
          limit: args.limit as number | undefined,
        });
        break;

      case "get_lobbying_activity":
        result = await client.getLobbyingActivity({
          ticker: args.ticker as string | undefined,
          limit: args.limit as number | undefined,
        });
        break;

      default:
        return JSON.stringify({
          error: `Unknown tool: ${toolName}`,
        });
    }

    return JSON.stringify(result, null, 2);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ error: message });
  }
}
