import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

import { promises as fs } from "fs";

const app = express();
app.use(cors({ origin: "https://fdthvh-8080.csb.app" }));
const port = 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static("public"));
app.use(express.json());

const LICENSE_KEY = "place_holder"
const API_BASE_URL = "https://verification.trulioo.com";

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/mobile", (req, res) => {
  res.sendFile(path.join(__dirname, "public/mobile.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Helper function for sending a POST request
async function sendPostRequest(url, headers, body = {}) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });
    return response.json();
  } catch (error) {
    console.error("Error with post request:", error);
  }
}

// Function for authorizing with a POST request
async function authorize() {
  const url = `${API_BASE_URL}/authorize/customer`;
  const headers = {
    Authorization: `Bearer ${LICENSE_KEY}`,
    "Content-Type": "application/json",
    "Accept-Version": "2.5",
  };
  const body = {
    consent: true,
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });
    const result = await response.json();
    return result.accessToken;
  } catch (error) {
    console.error("Error with post request:", error);
  }
}

// Step 2: Create a Transaction
async function createTransaction(accessToken) {
  const url = `${API_BASE_URL}/customer/transactions`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "Accept-Version": "2.5",
  };
  const body = {
    documentVerification: {
      enabled: true,
      documentsAccepted: [
        {
          documentType: "DRIVERS_LICENSE",
          documentOrigin: [{ countryCode: "US" }, { countryCode: "CA" }],
        },
        {
          documentType: "PASSPORT",
          documentOrigin: [{ countryCode: "US" }, { countryCode: "CA" }],
        },
      ],
    },
    selfieVerification: {
      enabled: true,
    },
  };
  try {
    const response = await sendPostRequest(url, headers, body);
    return response.transactionId;
  } catch (error) {
    console.error("Error with post request:", error);
  }
}

// Step 3: Fetch the shortCode
async function getShortCode(accessToken) {
  const url = `${API_BASE_URL}/customer/handoff`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "Accept-Version": "2.5",
  };
  try {
    const response = await sendPostRequest(url, headers);
    return response.shortCode;
  } catch (error) {
    console.error("Error with post request:", error);
  }
}

app.get("/get-shortCode", async (req, res) => {
  try {
    const accessToken = await authorize();
    const transactionId = await createTransaction(accessToken);
    const shortCode = await getShortCode(accessToken);

    const jsonData_stored = JSON.stringify(shortCode, null, 2);
    // store shortCode for mobile SDK
    await fs.writeFile("data.json", jsonData_stored, "utf-8");

    res.json({ shortCode });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .send({ error: "An unexpected error occurred.", details: error.message });
  }
});

// get the stored shortCode
app.get("/get-stored-shortCode", async (req, res) => {
  try {
    const data = await fs.readFile("data.json", "utf-8");
    const shortCode = JSON.parse(data);
    res.json({ shortCode });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .send({ error: "An unexpected error occurred.", details: error.message });
  }
});