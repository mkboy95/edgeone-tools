// EdgeOne Pages Functions - 访问统计跟踪

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { toolName } = body;

    if (!toolName) {
      return new Response(JSON.stringify({ error: 'toolName is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const key = `analytics_${toolName}`;

    // 获取现有数据
    const existingData = await env.TOOLS_KV.get(key);
    let analyticsData = existingData ? JSON.parse(existingData) : {
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
    await env.TOOLS_KV.put(key, JSON.stringify(analyticsData));

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Analytics track error:', error);
    return new Response(JSON.stringify({ error: 'Failed to track analytics' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
