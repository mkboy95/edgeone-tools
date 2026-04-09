// EdgeOne Pages Functions - P2P ICE 候选管理

// 常量定义
const TTL = 3600; // 数据保留 1 小时
const PREFIX = 'p2p_';

/**
 * 5. 交换 ICE Candidates
 * POST /api/p2p/ice/:code
 * Body: { candidate: any, type: 'offer' | 'answer' }
 */
export async function onRequestPost(context) {
  const { request, params, env } = context;
  const code = params.code;
  const body = await request.json();
  const { candidate, type } = body; // type 指示是谁发的 candidate

  if (!candidate || !type) {
    return new Response(JSON.stringify({ error: 'Invalid data' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const key = `${PREFIX}ice_${type}_${code}`;
  
  // 获取现有列表并追加
  const existing = await env.TOOLS_KV.get(key);
  const list = existing ? JSON.parse(existing) : [];
  list.push(candidate);

  await env.TOOLS_KV.put(key, JSON.stringify(list), { expirationTtl: TTL });
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

/**
 * 6. 获取对方的 ICE Candidates
 * GET /api/p2p/ice/:code?type=offer|answer&lastIndex=0
 * type: 我是谁 (如果是 offerer，我要取 answer 的 candidates)
 */
export async function onRequestGet(context) {
  const { params, request, env } = context;
  const code = params.code;
  const url = new URL(request.url);
  const type = url.searchParams.get('type'); // 'offer' or 'answer' (target to fetch)
  const lastIndex = parseInt(url.searchParams.get('lastIndex') || '0');

  if (!type) {
    return new Response(JSON.stringify({ error: 'Type required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const key = `${PREFIX}ice_${type}_${code}`;
  const existing = await env.TOOLS_KV.get(key);
  const list = existing ? JSON.parse(existing) : [];

  // 只返回新的 candidates
  const newCandidates = list.slice(lastIndex);
  
  return new Response(JSON.stringify({ 
    candidates: newCandidates,
    total: list.length 
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
