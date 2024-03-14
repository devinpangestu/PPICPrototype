import { rateLimit } from "express-rate-limit";

let lastRequestTime = null;

const timeInterval = () => {
  const currentTime = new Date();

  // Calculate the time difference between the current request and the last request
  const timeDifference = lastRequestTime ? currentTime - lastRequestTime : 0;

  // Set the dynamic time interval based on the time difference
  const timeInterval = timeDifference > 0 ? timeDifference : 5000; // Default to 1 minute

  // Update the last request time
  lastRequestTime = currentTime;
  return timeInterval;
};

export const dynamicRateLimit = rateLimit({
  windowMs: timeInterval(),
  max: 1,
  message: {
    code: 500,
    error: {
      error_message: `Too Many Requests. Please try again in a few seconds`,
    },
    success: false,
  },
});
