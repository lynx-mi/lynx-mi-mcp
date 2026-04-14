/**
 * Lynx MI API Client
 *
 * Authenticated HTTP client that proxies requests to the Lynx MI backend
 * using the user's personal API key (X-API-Key header).
 */

const DEFAULT_BASE_URL = "https://api.smartmoneyalpha.com";

export class LynxClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
  }

  private async request<T = unknown>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    // Attach query params (skip undefined)
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": this.apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const body = await response.text();
      let detail = body;
      try {
        const json = JSON.parse(body);
        detail = json.detail || json.message || body;
      } catch {
        // use raw body
      }

      if (response.status === 403) {
        throw new Error(
          `Access denied: ${detail}. Ensure your API key is valid and your subscription tier supports this feature.`
        );
      }
      throw new Error(
        `Lynx MI API error (${response.status}): ${detail}`
      );
    }

    return response.json() as Promise<T>;
  }

  // ─── Trade Endpoints ───────────────────────────────────────

  async getLatestTrades(opts?: {
    limit?: number;
    days?: number;
    ticker?: string;
    insider_name?: string;
    signal_type?: string;
  }) {
    return this.request("/api/v1/trades", {
      limit: opts?.limit ?? 25,
      days: opts?.days ?? 7,
      ticker: opts?.ticker,
      insider_name: opts?.insider_name,
      signal_type: opts?.signal_type,
    });
  }

  async searchInsider(query: string) {
    return this.request("/api/v1/search/insiders", { q: query });
  }

  async searchTicker(query: string) {
    return this.request("/api/v1/search/tickers", { q: query });
  }

  async getTradesByTicker(ticker: string, opts?: { days?: number; limit?: number }) {
    return this.request("/api/v1/trades", {
      ticker: ticker.toUpperCase(),
      days: opts?.days ?? 90,
      limit: opts?.limit ?? 50,
    });
  }

  async getTradesByInsider(insiderName: string, opts?: { days?: number; limit?: number }) {
    return this.request("/api/v1/trades", {
      insider_name: insiderName,
      days: opts?.days ?? 365,
      limit: opts?.limit ?? 50,
    });
  }

  // ─── Insights ──────────────────────────────────────────────

  async getMarketSentiment() {
    return this.request("/api/v1/market-sentiment");
  }

  async getTopMovers(opts?: { days?: number }) {
    return this.request("/api/v1/top-movers", { days: opts?.days ?? 7 });
  }

  async getInsiderStats(insiderName: string) {
    return this.request(`/api/v1/insider-profile/${encodeURIComponent(insiderName)}`);
  }

  // ─── Pro Features ──────────────────────────────────────────

  async getSectorFlow(opts?: { days?: number }) {
    return this.request("/api/v1/sector-flow", { days: opts?.days ?? 30 });
  }

  async getCorrelations(ticker: string) {
    return this.request(`/api/v1/correlations/${encodeURIComponent(ticker.toUpperCase())}`);
  }

  async getInsiderNetwork(nodeId: string, opts?: { node_type?: string; depth?: number }) {
    return this.request("/api/v1/insider-network/query", {
      node_id: nodeId,
      node_type: opts?.node_type ?? "insider",
      depth: opts?.depth ?? 1,
    });
  }

  async getNetworkTop() {
    return this.request("/api/v1/insider-network/top");
  }

  async getTradeHeatmap(opts?: { days?: number }) {
    return this.request("/api/v1/heatmap", { days: opts?.days ?? 7 });
  }

  async getEarningsProximity(opts?: { limit?: number }) {
    return this.request("/api/v1/earnings-proximity", { limit: opts?.limit ?? 20 });
  }

  async getFilingDiff(insiderName: string) {
    return this.request(`/api/v1/filing-diff/${encodeURIComponent(insiderName)}`);
  }

  async getConvictionScore(tradeId: string) {
    return this.request(`/api/v1/conviction/${encodeURIComponent(tradeId)}`);
  }

  // ─── Leaderboard ───────────────────────────────────────────

  async getLeaderboard(opts?: { days?: number; limit?: number }) {
    return this.request("/api/v1/leaderboard", {
      days: opts?.days ?? 90,
      limit: opts?.limit ?? 20,
    });
  }

  async getInsiderRank(insiderName: string) {
    return this.request(`/api/v1/leaderboard/insider/${encodeURIComponent(insiderName)}`);
  }

  // ─── Nexus (Political Intelligence) ────────────────────────

  async getNexusScore(ticker: string) {
    return this.request(`/api/v1/nexus/score/${encodeURIComponent(ticker.toUpperCase())}`);
  }

  async getCongressionalTrades(opts?: { ticker?: string; days?: number; limit?: number }) {
    return this.request("/api/v1/nexus/congressional-trades", {
      ticker: opts?.ticker,
      days: opts?.days ?? 90,
      limit: opts?.limit ?? 25,
    });
  }

  async getLobbyingActivity(opts?: { ticker?: string; limit?: number }) {
    return this.request("/api/v1/nexus/lobbying", {
      ticker: opts?.ticker,
      limit: opts?.limit ?? 25,
    });
  }
}
