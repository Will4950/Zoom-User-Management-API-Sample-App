import dotenv from "dotenv/config"; // load .env
import logger from "./logger.js";
import {
  activateUser,
  getAccessToken,
  getUser,
  setUserLicenses,
  updateUserLicenseType,
} from "./zoom.js";
import express from "express";
const app = express();
const port = process.env.PORT || 3000;

if (!process.env.accountID) logger.warn("accountID missing in .env");
if (!process.env.clientID) logger.warn("clientID missing in .env");
if (!process.env.clientSecret) logger.warn("clientSecret missing in .env");

app.set("query parser", "simple");

app.get("/user/:email", express.json(), async (req, res) => {
  // Get an access token for use in future requests
  const accessToken = await getAccessToken();
  if (!accessToken) {
    res.status(500).json({ error: "Unable to get access token" });
    return;
  }

  // Check if the user exists
  const user = await getUser(accessToken, req.params.email);
  if (user.code === 1001) {
    res.status(404).json({ user: req.params.email, message: "Not found" });
    return;
  }

  // Check if the user is Basic (Deactivated)
  if (!(user.type === 1 && user.status === "inactive")) {
    res.status(400).json({
      user: req.params.email,
      message: "User account is already active or not basic",
    });
    return;
  }

  // Activate Account
  if (!(await activateUser(accessToken, req.params.email))) {
    res.status(500).json({
      user: req.params.email,
      message: "Unable to activate account",
    });
    return;
  }

  // License user
  if (!(await updateUserLicenseType(accessToken, req.params.email))) {
    res.status(500).json({
      user: req.params.email,
      message: "Unable to license user",
    });
    return;
  }

  // Apply Large Meeting 500, Webinar 500
  if (!(await setUserLicenses(accessToken, req.params.email))) {
    res.status(500).json({
      user: req.params.email,
      message: "Unable to apply licenses",
    });
    return;
  }

  res.status(200).json({ user: req.params.email, message: "Enabled" });
});

app.listen(port, () => {
  logger.info(`listening on port ${port}`);
});
