var NodeHelper = require("node_helper");
const { GoogleSpreadsheet } = require("google-spreadsheet");

const DOWN_PAYMENT_SAVER_SHEET_ID = "1hCJhW-7l456P41VjSgX3767eae5QMjtfT0VNpNFNLGI";

module.exports = NodeHelper.create({
	start: function () {
		console.log("Down payment saver helper module loaded!");
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === "get_account_balance") {
			this.getAccountBalance(payload);
		}
	},

	async getAccountBalance(url) {
		const self = this;
		const doc = new GoogleSpreadsheet(DOWN_PAYMENT_SAVER_SHEET_ID);
		await doc.useApiKey(process.env.GOOGLE_PRIVATE_KEY);
		await doc.loadInfo();

		const sheet = doc.sheetsByIndex[0];
		await sheet.loadCells("A1:B4");
		const savingAmount = sheet.getCell(2, 1).value;
		console.log("savingAmount: ", savingAmount);
		self.sendSocketNotification("account_balance", { accountBalance: savingAmount });
	}
});
