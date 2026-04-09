export interface AnalyticsData {
  totalVisits: number;
  todayVisits: number;
  lastResetDate: string;
}

export interface ToolAnalytics {
  [toolName: string]: AnalyticsData;
}

// EdgeOne 环境变量类型
// EdgeOne 使用 EdgeKV 或环境变量进行存储
export interface EdgeOneEnv {
  // EdgeOne EdgeKV 命名空间（合并了 ANALYTICS 和 P2P_KV）
  TOOLS_KV: EdgeKVNamespace;
}

// EdgeOne EdgeKV 接口（与 Cloudflare KV 类似）
export interface EdgeKVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    keys: Array<{ name: string }>;
    list_complete: boolean;
    cursor?: string;
  }>;
}

export interface Variables {
  corsHeaders: Record<string, string>;
}
