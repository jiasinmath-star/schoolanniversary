import worker from "./src/index.js";

const values = new Map();
const env = {
  ALLOWED_ORIGINS: "https://school.github.io",
  DB: {
    prepare(sql) {
      let game;
      return {
        bind(value) {
          game = value;
          return this;
        },
        async run() {
          if (sql.includes("INSERT INTO experience_counts")) {
            values.set(game, (values.get(game) || 0) + 1);
          }
          return { success: true };
        },
        async all() {
          return {
            results: [...values].map(([key, count]) => ({ game: key, count })),
          };
        },
      };
    },
  },
};

function request(method, body, origin = "https://school.github.io") {
  return new Request("https://counter.example/api/experience-counts", {
    method,
    headers: {
      Origin: origin,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

const initial = await worker.fetch(request("GET"), env);
const initialPayload = await initial.json();
if (initial.status !== 200 || initialPayload.counts.drone !== 0) throw new Error("Initial count test failed.");

const incremented = await worker.fetch(request("POST", { game: "drone" }), env);
const incrementedPayload = await incremented.json();
if (incremented.status !== 200 || incrementedPayload.counts.drone !== 1) throw new Error("Increment test failed.");

const rejected = await worker.fetch(request("GET", null, "https://example.org"), env);
if (rejected.status !== 403) throw new Error("Origin restriction test failed.");

const invalid = await worker.fetch(request("POST", { game: "unknown" }), env);
if (invalid.status !== 400) throw new Error("Game validation test failed.");

console.log("COUNTER_WORKER_TEST=PASS");
