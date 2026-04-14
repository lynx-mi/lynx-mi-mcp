# 🐆 Lynx MI — MCP Server

> **Model Context Protocol server for Lynx Market Intelligence**
>
> Give your AI coding assistant real-time access to SEC insider trading data, market sentiment, political intelligence, and more.

[![npm version](https://img.shields.io/npm/v/@lynx-mi/mcp-server)](https://www.npmjs.com/package/@lynx-mi/mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## What is this?

This MCP server connects AI coding assistants like **Claude**, **Cursor**, **Windsurf**, and **Cline** directly to [Lynx MI](https://lynx-mi.com) — a market intelligence platform that tracks SEC insider trades, congressional stock transactions, lobbying activity, and more.

Once connected, you can ask your AI assistant questions like:

- *"What insider trades happened at NVDA this week?"*
- *"Show me the top insiders by performance over 90 days"*
- *"Which sectors are insiders buying the most right now?"*
- *"Are any insiders trading near upcoming earnings dates?"*
- *"What's the Nexus political intelligence score for AAPL?"*

## Prerequisites

- **Node.js** 18+
- A **Lynx MI** account with an **Advanced subscription** or higher
- A **Personal API Key** (generate at [lynx-mi.com/settings](https://lynx-mi.com/settings))

## Quick Setup

### Claude Desktop

Add this to your `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "lynx-mi": {
      "command": "npx",
      "args": ["-y", "@lynx-mi/mcp-server"],
      "env": {
        "LYNX_MI_API_KEY": "sk_live_your_key_here"
      }
    }
  }
}
```

### Cursor

Go to **Settings → MCP Servers → Add new server** and use:

```json
{
  "command": "npx",
  "args": ["-y", "@lynx-mi/mcp-server"],
  "env": {
    "LYNX_MI_API_KEY": "sk_live_your_key_here"
  }
}
```

### Windsurf / Cline

Add to your MCP configuration:

```json
{
  "lynx-mi": {
    "command": "npx",
    "args": ["-y", "@lynx-mi/mcp-server"],
    "env": {
      "LYNX_MI_API_KEY": "sk_live_your_key_here"
    }
  }
}
```

### Google Gemini CLI

Add to your `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "lynx-mi": {
      "command": "npx",
      "args": ["-y", "@lynx-mi/mcp-server"],
      "env": {
        "LYNX_MI_API_KEY": "sk_live_your_key_here"
      }
    }
  }
}
```

## Available Tools

### 📊 Trades
| Tool | Description |
|------|-------------|
| `get_latest_trades` | Recent SEC insider trades with filters |
| `get_trades_by_ticker` | All insider activity for a stock |
| `get_trades_by_insider` | All trades by a specific insider |
| `search_insider` | Search insiders by name |
| `search_ticker` | Search tickers by symbol or name |

### 📈 Market Intelligence
| Tool | Description |
|------|-------------|
| `get_market_sentiment` | Current market insider buy/sell ratio |
| `get_top_movers` | Stocks with highest insider volume |
| `get_insider_profile` | Detailed insider profile & stats |

### 🔬 Pro Analytics
| Tool | Description |
|------|-------------|
| `get_sector_flow` | Money flow by sector (leading indicator) |
| `get_correlations` | Hidden company connections via shared insiders |
| `get_insider_network` | Network graph of insider-company relationships |
| `get_network_top` | Most connected insiders & companies |
| `get_trade_heatmap` | Volume heatmap by ticker |
| `get_earnings_proximity` | Trades near upcoming earnings (⚠️ high signal) |
| `get_filing_diff` | Compare insider's last two SEC filings |
| `get_conviction_score` | Trade conviction score breakdown |

### 🏆 Leaderboard
| Tool | Description |
|------|-------------|
| `get_leaderboard` | Top insiders by 30/90-day returns |
| `get_insider_rank` | Specific insider's rank & stats |

### 🏛️ Nexus (Political Intelligence)
| Tool | Description |
|------|-------------|
| `get_nexus_score` | Combined political + lobbying + insider score |
| `get_congressional_trades` | US Congress member stock trades |
| `get_lobbying_activity` | Corporate lobbying reports & spend |

## Example Conversations

### Research a stock
> **You:** What's the insider trading activity at Tesla?
>
> **Claude:** *Uses `get_trades_by_ticker` with ticker="TSLA"*
> I found 12 insider trades at Tesla in the last 90 days...

### Detect signals
> **You:** Are there any suspicious trades near earnings?
>
> **Claude:** *Uses `get_earnings_proximity`*
> I found 5 trades within 7 days of upcoming earnings...

### Political intelligence
> **You:** What's the political risk for Apple?
>
> **Claude:** *Uses `get_nexus_score` with ticker="AAPL"*
> Apple's Nexus score is 72/100, driven by heavy lobbying spend...

## Getting Your API Key

1. Go to [lynx-mi.com](https://lynx-mi.com) and create an account
2. Subscribe to the **Advanced** plan or higher
3. Navigate to **Settings → API Key**
4. Click **Generate API Key**
5. Copy the `sk_live_...` key into your MCP configuration

## Development

```bash
# Install dependencies
npm install

# Run in development mode
LYNX_MI_API_KEY=sk_live_... npm run dev

# Build for production
npm run build

# Test the built server
LYNX_MI_API_KEY=sk_live_... npm start
```

## Pricing

The MCP server is **free and open source**. You only pay for the Lynx MI subscription that provides the API key:

| Plan | Price | MCP Access |
|------|-------|------------|
| Free | $0/mo | ❌ |
| Recreational | $9.99/mo | ❌ |
| **Advanced** | **$24.99/mo** | **✅ All tools** |
| Enterprise | $49.99/mo | ✅ All tools + Nexus |

## License

MIT © [Lynx MI](https://lynx-mi.com)
