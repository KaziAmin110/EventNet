import redisClient from "../../config/redis.config.js";

// Logic for Creating a Private University Event
export const createUniversityEvent = async (req, res) => {
  try {
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// Logic for Creating a Private RSO Event
export const createRSOEvent = async (req, res) => {
  try {
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
