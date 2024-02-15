// import redis from "redis";

// // Create a Redis client
// const redisClient = redis.createClient(6379, "redis", {
//   logging: false,
// });

// // Set up an error handler
// redisClient.on("error", (error) => {
//   if (error.code === "ENOTFOUND") {
//     // Suppress logging for ENOTFOUND error
//     return;
//   }
//   console.error("Error: Redis connection failed -", error.message);
// });

// redisClient.on("connect", () => {
//   console.log("Connected to Redis");
// });

// redisClient.on("end", () => {
//   console.log("Redis connection closed");
// });

// // Handle potential errors during connection
// redisClient.on("close", () => {
//   console.log("Redis connection closed");
// });

// // Handle connection timeout
// redisClient.on("timeout", () => {
//   console.error("Redis connection timeout");
// });
// export default redisClient;
