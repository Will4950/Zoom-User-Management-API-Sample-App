import axios from "axios";

const zoomAuth = "https://zoom.us/oauth/";
const zoomAPI = "https://api.zoom.us/v2/";

export async function getAccessToken() {
  try {
    let oauthToken = Buffer.from(
      `${process.env.clientID}:${process.env.clientSecret}`
    ).toString("base64");

    let res = await axios({
      method: "post",
      url: `${zoomAuth}token?grant_type=account_credentials&account_id=${process.env.accountID}`,
      headers: { Authorization: `Basic ${oauthToken}` },
    });
    return res.data.access_token;
  } catch (e) {
    return false;
  }
}

export async function getUser(accessToken, email) {
  try {
    let res = await axios({
      method: "get",
      url: `${zoomAPI}users/${email}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (e) {
    return e.response.data;
  }
}

export async function activateUser(accessToken, email) {
  try {
    await axios({
      method: "put",
      url: `${zoomAPI}users/${email}/status`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: { action: "activate" },
    });
    return true;
  } catch (e) {
    return false;
  }
}

export async function updateUserLicenseType(accessToken, email) {
  try {
    await axios({
      method: "patch",
      url: `${zoomAPI}users/${email}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: { type: 2 },
    });
    return true;
  } catch (e) {
    return false;
  }
}

export async function setUserLicenses(accessToken, email) {
  try {
    await axios({
      method: "patch",
      url: `${zoomAPI}users/${email}/settings`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: {
        feature: {
          large_meeting: true,
          large_meeting_capacity: 500,
          webinar: true,
          webinar_capacity: 500,
        },
      },
    });
    return true;
  } catch (e) {
    return false;
  }
}
