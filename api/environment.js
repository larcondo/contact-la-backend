function validateEnvVariables() {
  if (!process.env.DATABASE_URI)
    throw new Error("DATABASE_URI environment variable is required!");
  if (!process.env.VALID_ORIGINS)
    throw new Error("VALID_ORIGINS environment variable is required!");
  return;
}

module.exports = {
  validateEnvVariables,
};
