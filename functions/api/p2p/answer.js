// EdgeOne Pages Functions - P2P 应答管理

// 常量定义
const TTL = 3600; // 数据保留 1 小时
const PREFIX = 'p2p_';

/**
 * 3. 接收端提交应答 (Answer)
 * POST /api/p2p/answer/:code
 * Body: { answer: string }
 */
export async function onRequestPost(context) {
  const { request, params, env } = context;
  const code = params.code;
  const body = await request.json();
  
  if (!body.answer) {
    return new Response(JSON.stringify({ error: 'Answer is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // 确保存储了 offer (即会话存在)
  const offer = await env.TOOLS_KV.get(`${PREFIX}offer_${code}`);
  if (!offer) {
    return new Response(JSON.stringify({ error: 'Session expired or invalid' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  await env.TOOLS_KV.put(`${PREFIX}answer_${code}`, JSON.stringify(body.answer), { expirationTtl: TTL });
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

/**
 * 4. 发送端轮询获取应答 (Answer)
 * GET /api/p2p/answer/:code
 */
export async function onRequestGet(context) {
  const { params, env } = context;
  const code = params.code;
  
  if (!code) {
    return new Response(JSON.stringify({ error: 'Code is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const answer = await env.TOOLS_KV.get(`${PREFIX}answer_${code}`);
  
  if (!answer) {
    return new Response(JSON.stringify({ answer: null }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }); // 还没准备好
  }

  return new Response(JSON.stringify({ answer: JSON.parse(answer) }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
