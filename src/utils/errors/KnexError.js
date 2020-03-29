module.exports = {
  create(res, error) {
    return res.status(500).json({
      error: `Database Connection error ${error.code}`,
      details: error.message
    });
  }
};
