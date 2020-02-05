module.exports.checkEnv =  (envVars) => {
  const badVars = [];
  envVars.forEach((varName) => {
    if (!process.env[varName]) {
      badVars.push(varName);
    }
  });

  if (badVars.length > 0) {
    console.error(`Setup environment variables: ${badVars.join(', ')}`);
    process.exit(1);
  }
};
