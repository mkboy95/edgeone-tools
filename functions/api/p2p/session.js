// EdgeOne Pages Functions - P2P 会话管理

// 常量定义
const TTL = 3600; // 数据保留 1 小时
const PREFIX = 'p2p_';

// 辅助函数：生成 6 位数字码
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 1. 发送端创建会话
 * POST /api/p2p/session
 * Body: { offer: string } (SDP JSON string)
 * Returns: { code: string }
 */
export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();
  
  if (!body.offer) {
    return new Response(JSON.stringify({ error: 'Offer is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // 简单的重试机制确保 Code 唯一（虽然冲突概率很低）
  let code = generateCode();
  let attempts = 0;
  while (attempts < 5) {
    const existing = await env.TOOLS_KV.get(`${PREFIX}offer_${code}`);
    if (!existing) break;
    code = generateCode();
    attempts++;
  }

  // 存储 Offer
  await env.TOOLS_KV.put(`${PREFIX}offer_${code}`, JSON.stringify(body.offer), { expirationTtl: TTL });
  
  // 初始化 ICE 候选列表
  await env.TOOLS_KV.put(`${PREFIX}ice_offer_${code}`, JSON.stringify([]), { expirationTtl: TTL });
  await env.TOOLS_KV.put(`${PREFIX}ice_answer_${code}`, JSON.stringify([]), { expirationTtl: TTL });

  return new Response(JSON.stringify({ code }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

/**
 * 2. 接收端获取会话信息 (Offer)
 * GET /api/p2p/session/:code
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

  const offer = await env.TOOLS_KV.get(`${PREFIX}offer_${code}`);
  
  if (!offer) {
    return new Response(JSON.stringify({ error: 'Session not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  return new Response(JSON.stringify({ offer: JSON.parse(offer) }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
