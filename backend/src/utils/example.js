// import axios from "axios";
// import redisClient from "../config/redis.js";
// import util from "util";

// export const getAsync = util.promisify(redisClient.get).bind(redisClient);

// export const fetchApiData = async (species) => {
//   const apiResponse = await axios.get(
//     `https://www.fishwatch.gov/api/species/${species}`
//   );
//   console.log("Request sent to the API");
//   return apiResponse.data;
// };
