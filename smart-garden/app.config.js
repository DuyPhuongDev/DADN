// Import app.json config
const appJson = require("./app.json");

// Create a config that extends app.json
const config = {
  ...appJson.expo,
  owner: "dphuongdev",
  extra: {
    ...appJson.expo.extra,
    EXPO_OS: process.platform,
    eas: {
      projectId: "12de2788-debe-44df-b9cd-de9643e1f03b"
    }
  },
  // Ensure these critical settings are explicitly set
  newArchEnabled: true,
  scheme: "smartgarden",
};

export default config;
