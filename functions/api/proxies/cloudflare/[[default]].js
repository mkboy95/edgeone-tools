// EdgeOne Pages Functions - Cloudflare AI API 代理

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // 提取 /api/proxies/cloudflare/ 后面的路径部分
  const pathname = url.pathname;
  const apiPath = pathname.substring(24); // 移除 "/api/proxies/cloudflare/" 前缀

  if (!apiPath) {
    return new Response(JSON.stringify({ error: 'Invalid AI API path' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // 构建 Cloudflare AI API URL
  const cfApiUrl = `https://api.cloudflare.com/${apiPath}`;

  try {
    // 获取请求体（如果是 POST 请求）
    let body;
    if (request.method === 'POST') {
      const requestBody = await request.text();
      body = {
        method: 'POST',
        headers: {
          'Authorization': request.headers.get('Authorization') || '',
          'Content-Type': 'application/json',
        },
        body: requestBody
      };
    } else {
      body = {
        method: request.method,
        headers: {
          'Authorization': request.headers.get('Authorization') || '',
          'Content-Type': 'application/json',
        }
      };
    }

    // 代理请求到 Cloudflare AI API
    const response = await fetch(cfApiUrl, body);

    // 检查响应类型
    const contentType = response.headers.get('Content-Type') || '';
    let responseData;
    if (contentType.includes('image/')) {
      // 如果是图像响应，直接返回二进制数据
      responseData = await response.arrayBuffer();
    } else {
      // 如果是JSON或其他文本响应，使用text
      responseData = await response.text();
    }

    // 返回响应，保持原始状态码和内容
    return new Response(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('AI Proxy error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to proxy AI request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
