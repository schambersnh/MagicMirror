var NodeHelper = require("node_helper");

// Electron 11 bundles Node v12 which lacks native fetch
if (!globalThis.fetch) {
	globalThis.fetch = require("node-fetch");
}

const SHEET_ID = "1hCJhW-7l456P41VjSgX3767eae5QMjtfT0VNpNFNLGI";
// B4 = total debt, B5 = Robinhood balance
// Sheet must be shared as "Anyone with the link can view"
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&range=B4:B5`;

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
		try {
			const res = await fetch(SHEET_URL);
			if (!res.ok) {
				console.error("Down payment saver: Google Sheet fetch failed, status", res.status);
				return;
			}
			const csv = await res.text();
			const lines = csv.trim().split("\n");
			const parse = s => parseFloat(s.replace(/"/g, "").replace(/[$,]/g, ""));
			const totalDebt = parse(lines[0]);
			const robinhoodBalance = parse(lines[1]);
			if (isNaN(totalDebt) || isNaN(robinhoodBalance)) {
				console.error("Down payment saver: could not parse sheet values:", lines);
				return;
			}
			console.log("Down payment saver [sheets]: Robinhood", robinhoodBalance, "Debt", totalDebt);
			this.sendSocketNotification("account_balance", { robinhoodBalance, totalDebt });
		} catch (err) {
			console.error("Down payment saver: sheet fetch error:", err.message);
		}
	}
});
