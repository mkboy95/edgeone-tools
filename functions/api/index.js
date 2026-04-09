// EdgeOne Pages Functions API 路由

/**
 * 健康检查
 */
export function onRequestGet(context) {
  return new Response(JSON.stringify({
    status: 'ok',
    platform: 'edgeone',
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
