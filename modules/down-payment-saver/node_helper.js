var NodeHelper = require("node_helper");
var fs = require("fs");
var path = require("path");

const MONARCH_GQL_WEB = "https://api.monarch.com/graphql";
const MONARCH_GQL_API = "https://api.monarchmoney.com/graphql";
const MONARCH_LOGIN = "https://api.monarchmoney.com/auth/login/";
const TOKEN_FILE = path.join(__dirname, ".monarch_token");

const ACCOUNTS_QUERY = `{
  accounts {
    displayName
    currentBalance
    isAsset
    institution { name }
  }
}`;

function parseAccounts(accounts) {
	const robinhoodBalance = accounts
		.filter(a => a.isAsset && a.institution?.name?.toLowerCase().includes("robinhood"))
		.reduce((sum, a) => sum + (a.currentBalance || 0), 0);

	const totalDebt = accounts
		.filter(a => !a.isAsset && a.institution?.name?.toLowerCase().includes("sofi"))
		.reduce((sum, a) => sum + Math.abs(a.currentBalance || 0), 0);

	return { robinhoodBalance, totalDebt };
}

module.exports = NodeHelper.create({
	start: function () {
		console.log("Down payment saver helper module loaded!");
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === "get_account_balance") {
			this.getAccountBalance();
		}
	},

	async getAccountBalance() {
		// Strategy 1: API token (permanent — lasts months once obtained via test.mjs)
		const savedToken = this.loadToken();
		if (savedToken) {
			const result = await this.fetchWithApiToken(savedToken);
			if (result === "EXPIRED") {
				console.log("Down payment saver: API token expired, re-authenticating...");
				this.deleteToken();
				const newToken = await this.doTotpLogin();
				if (newToken) {
					this.saveToken(newToken);
					const retryResult = await this.fetchWithApiToken(newToken);
					if (retryResult && retryResult !== "EXPIRED") {
						this.sendSocketNotification("account_balance", retryResult);
						return;
					}
				}
			} else if (result) {
				this.sendSocketNotification("account_balance", result);
				return;
			}
		}

		// Strategy 2: Session cookie fallback (works until session expires ~Aug 2026)
		// To switch to permanent token auth, run test.mjs once when the Monarch throttle clears.
		const sessionId = process.env.MONARCH_SESSION_ID;
		const csrfToken = process.env.MONARCH_CSRF_TOKEN;
		if (sessionId && csrfToken) {
			const result = await this.fetchWithCookies(sessionId, csrfToken);
			if (result) {
				this.sendSocketNotification("account_balance", result);
				return;
			}
		}

		console.error("Down payment saver: all auth strategies failed. Either run test.mjs to get a token, or set MONARCH_SESSION_ID + MONARCH_CSRF_TOKEN env vars.");
	},

	async fetchWithApiToken(token) {
		try {
			const res = await fetch(MONARCH_GQL_API, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Token ${token}`,
					"Client-Platform": "web",
				},
				body: JSON.stringify({ query: ACCOUNTS_QUERY }),
			});
			if (res.status === 401) return "EXPIRED";
			if (!res.ok) {
				console.error("Down payment saver: API token fetch failed, status", res.status);
				return null;
			}
			const json = await res.json();
			const accounts = json?.data?.accounts ?? [];
			if (!accounts.length) return null;
			const result = parseAccounts(accounts);
			console.log("Down payment saver [token]: Robinhood", result.robinhoodBalance, "Debt", result.totalDebt);
			return result;
		} catch (err) {
			console.error("Down payment saver: fetchWithApiToken error:", err.message);
			return null;
		}
	},

	async fetchWithCookies(sessionId, csrfToken) {
		try {
			const res = await fetch(MONARCH_GQL_WEB, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Cookie": `session_id=${sessionId}; csrftoken=${csrfToken}`,
					"X-CSRFToken": csrfToken,
					"Client-Platform": "web",
					"Origin": "https://app.monarch.com",
					"Referer": "https://app.monarch.com/",
					"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
				},
				body: JSON.stringify({ query: ACCOUNTS_QUERY }),
			});
			if (res.status === 401 || res.status === 403) {
				console.error("Down payment saver: session cookie rejected — MONARCH_SESSION_ID may have expired. Update it from your browser or run test.mjs.");
				return null;
			}
			if (!res.ok) {
				console.error("Down payment saver: cookie fetch failed, status", res.status);
				return null;
			}
			const json = await res.json();
			const accounts = json?.data?.accounts ?? [];
			if (!accounts.length) return null;
			const result = parseAccounts(accounts);
			console.log("Down payment saver [cookie]: Robinhood", result.robinhoodBalance, "Debt", result.totalDebt);
			return result;
		} catch (err) {
			console.error("Down payment saver: fetchWithCookies error:", err.message);
			return null;
		}
	},

	async doTotpLogin() {
		const email = process.env.MONARCH_EMAIL;
		const password = process.env.MONARCH_PASSWORD;
		const mfaSecret = process.env.MONARCH_MFA_SECRET;
		if (!email || !password || !mfaSecret) return null;
		try {
			const { generate } = await import("otplib");
			const totp = await generate({ secret: mfaSecret });
			const res = await fetch(MONARCH_LOGIN, {
				method: "POST",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"Client-Platform": "web",
					"User-Agent": "MonarchMoneyAPI (https://github.com/hammem/monarchmoney)",
				},
				body: JSON.stringify({ username: email, password, supports_mfa: true, trusted_device: false, totp }),
			});
			if (res.status === 429) {
				console.error("Down payment saver: login throttled — run test.mjs manually when throttle clears.");
				return null;
			}
			const json = await res.json();
			return json.token || null;
		} catch (err) {
			console.error("Down payment saver: TOTP login error:", err.message);
			return null;
		}
	},

	loadToken() {
		try {
			if (fs.existsSync(TOKEN_FILE)) return fs.readFileSync(TOKEN_FILE, "utf8").trim();
		} catch (_) {}
		return null;
	},

	saveToken(token) {
		try {
			fs.writeFileSync(TOKEN_FILE, token, "utf8");
		} catch (err) {
			console.error("Down payment saver: could not save token file:", err.message);
		}
	},

	deleteToken() {
		try {
			if (fs.existsSync(TOKEN_FILE)) fs.unlinkSync(TOKEN_FILE);
		} catch (_) {}
	},
});
