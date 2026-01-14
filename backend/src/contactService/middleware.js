// Contact service middleware

const validateContactData = (req, res, next) => {
  const { email } = req.body;
  if (req.method === "POST" && !email) {
    return res.status(400).json({ error: "Email is required" });
  }
  next();
};

module.exports = {
  validateContactData,
};
