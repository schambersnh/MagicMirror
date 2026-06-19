import { generate } from "otplib";
import { writeFileSync } from "fs";

const email = process.env.MONARCH_EMAIL;
const password = process.env.MONARCH_PASSWORD;
const mfaSecret = process.env.MONARCH_MFA_SECRET;

const totp = await generate({ secret: mfaSecret });

const loginRes = await fetch("https://api.monarchmoney.com/auth/login/", {
  method: "POST",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Client-Platform": "web",
    "User-Agent": "MonarchMoneyAPI (https://github.com/hammem/monarchmoney)",
  },
  body: JSON.stringify({ username: email, password, supports_mfa: true, trusted_device: false, totp }),
});

console.log("Login status:", loginRes.status);
const loginJson = await loginRes.json();
const token = loginJson.token;
if (!token) throw new Error("Login failed: " + JSON.stringify(loginJson));

writeFileSync(".monarch_token", token, "utf8");
console.log("Token saved to .monarch_token — login won't be needed again for months.");
