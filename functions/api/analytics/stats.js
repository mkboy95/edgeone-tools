// EdgeOne Pages Functions - 访问统计获取

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const toolName = url.searchParams.get('tool');
    const today = new Date().toISOString().split('T')[0];
    
    if (toolName) {
      let analyticsData = {
        totalVisits: 0,
        todayVisits: 0,
        lastResetDate: new Date().toISOString().split('T')[0]
      };
      
      // 获取特定工具的统计
      const key = `analytics_${toolName}`;
      const data = await env.TOOLS_KV.get(key);
      if (data) {
        analyticsData = JSON.parse(data);
      }
      
      if (analyticsData.lastResetDate !== today) {
        analyticsData.todayVisits = 0;
        analyticsData.lastResetDate = today;
      }
      
      return new Response(JSON.stringify(analyticsData), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      // 获取所有工具的统计
      const keys = await env.TOOLS_KV.list({ prefix: 'analytics_' });
      const allStats = {};

      for (const key of keys.keys) {
        // 去掉前缀，得到原始工具名
        const toolName = key.name.replace('analytics_', '');
        const data = await env.TOOLS_KV.get(key.name);
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

      return new Response(JSON.stringify({
        tools: allStats,
        siteTotal: totalSiteVisits,
        siteToday: todaySiteVisits
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  } catch (error) {
    console.error('Analytics stats error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get analytics stats' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
