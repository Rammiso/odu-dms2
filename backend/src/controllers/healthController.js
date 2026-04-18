export const healthController = {
  check: (req, res) => {
    res.status(200).json({
      success: true,
      message: "DMS API is healthy",
      data: {
        status: "ok",
        timestamp: new Date().toISOString(),
      },
    });
  },
};
