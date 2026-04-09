// EdgeOne Pages Functions - P2P 会话删除

// 常量定义
const PREFIX = 'p2p_';

/**
 * 7. 销毁会话数据
 * DELETE /api/p2p/session/:code
 */
export async function onRequestDelete(context) {
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
  
  // 删除所有相关的 KV
  const keys = [
    `${PREFIX}offer_${code}`,
    `${PREFIX}answer_${code}`,
    `${PREFIX}ice_offer_${code}`,
    `${PREFIX}ice_answer_${code}`
  ];

  for (const key of keys) {
    await env.TOOLS_KV.delete(key);
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
