export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      const target = env.UG_API_BASE + url.pathname + url.search;
      const init = {
        method: request.method,
        headers: {
          'Authorization': env.UG_API_TOKEN,
          'Content-Type': 'application/json'
        },
        body: ['GET','HEAD'].includes(request.method) ? undefined : await request.text()
      };
      const resp = await fetch(target, init);
      return new Response(await resp.text(), { status: resp.status });
    }

    return new Response("Worker running, but route not matched.", { status: 200 });
  }
};
