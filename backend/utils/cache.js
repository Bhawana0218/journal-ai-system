const redis = require("redis");

const client = redis.createClient({
  url:  process.env.REDIS_URL
});

client.on("error", (err) => console.error("Redis error:", err));

async function connectRedis() {
  await client.connect();
}

connectRedis();

async function getCache(key) {
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

async function setCache(key, value, ttl = 3600) {
  await client.set(key, JSON.stringify(value), { EX: ttl });
}

module.exports = { getCache, setCache };