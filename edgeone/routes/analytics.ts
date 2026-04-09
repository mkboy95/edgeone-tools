import { Hono } from 'hono';
import { type EdgeOneEnv, type AnalyticsData, type ToolAnalytics } from '../types';

const analytics = new Hono<{ Bindings: EdgeOneEnv }>();

// 键前缀，避免与 P2P 数据冲突
const ANALYTICS_PREFIX = 'analytics_';

// 记录访问
analytics.post('/api/analytics/track', async (c) => {
  try {
    const { toolName } = await c.req.json() as { toolName: string };

    if (!toolName) {
      return c.json({ error: 'toolName is required' }, 400);
    }

    const today = new Date().toISOString().split('T')[0];

    // 获取现有数据
    const existingData = await c.env.TOOLS_KV.get(`${ANALYTICS_PREFIX}${toolName}`);
    let analyticsData: AnalyticsData = existingData ? JSON.parse(existingData) : {
      totalVisits: 0,
      todayVisits: 0,
      lastResetDate: today
    };

    // 检查是否需要重置今日访问次数
    if (analyticsData.lastResetDate !== today) {
      analyticsData.todayVisits = 0;
      analyticsData.lastResetDate = today;
    }

    // 更新访问次数
    analyticsData.totalVisits++;
    analyticsData.todayVisits++;

    // 保存数据
    await c.env.TOOLS_KV.put(`${ANALYTICS_PREFIX}${toolName}`, JSON.stringify(analyticsData));

    return c.json({ success: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    return c.json({ error: 'Failed to track analytics' }, 500);
  }
});

// 获取访问统计
analytics.get('/api/analytics/stats', async (c) => {
  try {
    const toolName = c.req.query('tool');
    const today = new Date().toISOString().split('T')[0];
    
    if (toolName) {
      let analyticsData: AnalyticsData = {
        totalVisits: 0,
        todayVisits: 0,
        lastResetDate: new Date().toISOString().split('T')[0]
      };
      
      // 获取特定工具的统计
      const data = await c.env.TOOLS_KV.get(`${ANALYTICS_PREFIX}${toolName}`);
      if (data) {
        analyticsData = JSON.parse(data);
      }
      
      if (analyticsData.lastResetDate !== today) {
        analyticsData.todayVisits = 0;
        analyticsData.lastResetDate = today;
      }
      
      return c.json(analyticsData);
    } else {
      // 获取所有工具的统计
      const keys = await c.env.TOOLS_KV.list({ prefix: ANALYTICS_PREFIX });
      const allStats: ToolAnalytics = {};

      for (const key of keys.keys) {
        // 去掉前缀，得到原始工具名
        const toolName = key.name.replace(ANALYTICS_PREFIX, '');
        const data = await c.env.TOOLS_KV.get(key.name);
        if (data) {
          allStats[toolName] = JSON.parse(data);
          if (allStats[toolName].lastResetDate !== today) {
            allStats[toolName].todayVisits = 0;
            allStats[toolName].lastResetDate = today;
          }
        }
      }

      // 计算网站总访问量
      const totalSiteVisits = Object.values(allStats).reduce((sum, stats) => sum + stats.totalVisits, 0);
      const todaySiteVisits = Object.values(allStats).reduce((sum, stats) => sum + stats.todayVisits, 0);

      return c.json({
        tools: allStats,
        siteTotal: totalSiteVisits,
        siteToday: todaySiteVisits
      });
    }
  } catch (error) {
    console.error('Analytics stats error:', error);
    return c.json({ error: 'Failed to get analytics stats' }, 500);
  }
});

export default analytics;
