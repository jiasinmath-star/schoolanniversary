const GAME_KEYS = ["drone", "body", "language", "business"];
const GAME_SET = new Set(GAME_KEYS);

function allowedOrigin(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(value => value.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  if (!origin) return "*";
  return allowed.includes(origin.replace(/\/+$/, "")) ? origin : "";
}

function responseHeaders(request, env) {
  const origin = allowedOrigin(request, env);
  return {
    "Access-Control-Allow-Origin": origin || "null",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Cache-Control": "no-store, max-age=0",
    "Content-Type": "application/json; charset=utf-8",
    Vary: "Origin",
  };
}

function json(request, env, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: responseHeaders(request, env),
  });
}

async function readCounts(env) {
  const counts = { drone: 0, body: 0, language: 0, business: 0 };
  const result = await env.DB.prepare(
    "SELECT game, count FROM experience_counts",
  ).all();

  for (const row of result.results || []) {
    if (GAME_SET.has(row.game)) counts[row.game] = Number(row.count) || 0;
  }
  return counts;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/experience-counts") {
      return json(request, env, { error: "Not found." }, 404);
    }

    const corsOrigin = allowedOrigin(request, env);
    if (request.headers.get("Origin") && !corsOrigin) {
      return json(request, env, { error: "Origin not allowed." }, 403);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: responseHeaders(request, env) });
    }

    if (request.method === "GET") {
      return json(request, env, { counts: await readCounts(env) });
    }

    if (request.method !== "POST") {
      return json(request, env, { error: "Method not allowed." }, 405);
    }

    const contentLength = Number(request.headers.get("Content-Length") || 0);
    if (contentLength > 512) {
      return json(request, env, { error: "Request too large." }, 413);
    }

    const body = await request.json().catch(() => null);
    const game = body?.game;
    if (!GAME_SET.has(game)) {
      return json(request, env, { error: "Invalid game." }, 400);
    }

    await env.DB.prepare(
      `INSERT INTO experience_counts (game, count)
       VALUES (?1, 1)
       ON CONFLICT(game) DO UPDATE SET count = count + 1`,
    ).bind(game).run();

    return json(request, env, { counts: await readCounts(env) });
  },
};
