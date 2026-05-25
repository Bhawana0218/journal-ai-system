const redis = require("redis");

let client = null;
let isConnected = false;

async function connectRedis() {
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL
    });

    client.on("error", (err) => {
      console.warn("Redis unavailable, caching disabled:", err.message);
      isConnected = false;
    });

    await client.connect();
    isConnected = true;
    console.log("Redis connected ✓");
  } catch (err) {
    console.warn("Redis connection failed, caching disabled:", err.message);
    isConnected = false;
  }
}

connectRedis();

async function getCache(key) {
  if (!isConnected || !client) return null;
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

async function setCache(key, value, ttl = 3600) {
  if (!isConnected || !client) return;
  try {
    await client.set(key, JSON.stringify(value), { EX: ttl });
  } catch (error){
    console.log(error);
  }
}

module.exports = { getCache, setCache };
