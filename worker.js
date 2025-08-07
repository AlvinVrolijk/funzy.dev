export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const last = await env.RATE_LIMIT.get(ip);
    if (last && Date.now() - Number(last) < 3600 * 1000) {
      return new Response('Too Many Requests', { status: 429 });
    }
    const { name, message } = await request.json();
    await env.SEND_EMAIL.send({
      to: 'alvin.vrolijk@f365.org',
      from: 'web@funzy.dev',
      subject: `Contact form from ${name || 'Anonymous'}`,
      content: { type: 'text', value: message }
    });
    await env.RATE_LIMIT.put(ip, Date.now().toString(), { expirationTtl: 3600 });
    return new Response('OK');
  }
};
