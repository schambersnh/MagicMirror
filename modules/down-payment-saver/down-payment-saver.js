Module.register("down-payment-saver", {
	accountBalance: 0,
	totalDebt: 0,

	//override dom generator
	getDom: function () {
		let windowWidth = window.screen.width;
		let windowHeight = window.screen.height;

		let wrapper = document.createElement("div");
		let wrapperHeight = windowHeight / 2;
		let wrapperWidth = windowWidth;

		//wrapper.style.backgroundColor = "yellow";
		wrapper.height = this.n2px(wrapperHeight);
		wrapper.width = this.n2px(wrapperWidth);
		wrapper.style.minHeight = this.n2px(windowHeight / 2);
		wrapper.style.maxHeight = this.n2px(windowHeight / 2);

		let canv = this.createCanvas(wrapper, wrapperWidth, wrapperHeight);
		let context = canv.getContext("2d");

		let rectangle = this.drawBase(context, wrapperWidth, wrapperHeight);
		this.drawRoof(context, rectangle);

		let percent = this.totalDebt ? Math.min(100, (this.accountBalance / this.totalDebt) * 100) : 0;
		this.drawMilestones(context, rectangle, percent, wrapperWidth, wrapperHeight);
		this.drawBricks(context, rectangle, this.totalDebt);

		wrapper.appendChild(canv);
		return wrapper;
	},

	start: function () {
		this.getAccountBalance();
	},

	getAccountBalance: function () {
		const url = "ally invest oauth information";
		this.sendSocketNotification("get_account_balance", url);
	},

	scheduleUpdate: function () {
		var self = this;
		// Refresh time should not be less than 5 minutes
		var delay = config.refreshTime;
		setInterval(function () {
			self.getAccountBalance();
		}, delay);
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === "account_balance") {
			this.accountBalance = payload.robinhoodBalance;
			this.totalDebt = payload.totalDebt;
			this.updateDom();
		}
	},

	//all drawing below
	createCanvas: function (wrapper, wrapperWidth, wrapperHeight) {
		let canv = document.createElement("canvas");
		canv.id = "down-payment-saver-canvas";

		//set height of canvas to match div
		canv.width = wrapperWidth;
		canv.height = wrapperHeight;
		canv.style.textAlign = "center";

		return canv;
	},

	drawBase: function (context, wrapperWidth, wrapperHeight) {
		context.beginPath();
		context.lineJoin = "round";

		let rectHeight = wrapperHeight / 2;
		let rectWidth = wrapperWidth / 4;
		let x = wrapperWidth / 2 - rectWidth / 2;
		let y = wrapperHeight - rectHeight - 10;

		context.rect(x, y, rectWidth, rectHeight);
		context.fillStyle = "#9cc3e0";
		context.strokeStyle = "#3f6b8f";
		context.lineWidth = 10;
		context.fill();
		context.closePath();
		context.stroke();
		return {
			xLocation: x,
			yLocation: y,
			width: rectWidth,
			height: rectHeight
		};
	},

	drawRoof: function (context, rectangle) {
		let lineOffset = rectangle.width / 2;
		let roofOffset = rectangle.width / 10;
		let roofHeight = rectangle.height / 1.5;
		let lineSideOffset = rectangle.width / 27;
		let chimneyWidth = rectangle.width / 10;
		let chimneyHeight = rectangle.height / 8;

		//filled roof triangle
		context.beginPath();
		context.moveTo(rectangle.xLocation - roofOffset, rectangle.yLocation);
		context.lineTo(rectangle.xLocation + lineOffset, rectangle.yLocation - roofHeight);
		context.lineTo(rectangle.xLocation + rectangle.width + roofOffset, rectangle.yLocation);
		context.closePath();
		context.fillStyle = "#4a5a68";
		context.fill();
		context.strokeStyle = "#2c3841";
		context.lineWidth = 4;
		context.stroke();

		//eave notches
		context.beginPath();
		context.moveTo(rectangle.xLocation - roofOffset, rectangle.yLocation);
		context.lineTo(rectangle.xLocation - roofOffset + lineSideOffset, rectangle.yLocation + lineSideOffset);
		context.lineTo(rectangle.xLocation, rectangle.yLocation);
		context.closePath();
		context.fillStyle = "#38454e";
		context.fill();
		context.stroke();

		context.beginPath();
		context.moveTo(rectangle.xLocation + rectangle.width + roofOffset, rectangle.yLocation);
		context.lineTo(rectangle.xLocation + rectangle.width + roofOffset - lineSideOffset, rectangle.yLocation + lineSideOffset);
		context.lineTo(rectangle.xLocation + rectangle.width, rectangle.yLocation);
		context.closePath();
		context.fillStyle = "#38454e";
		context.fill();
		context.stroke();

		//chimney
		context.beginPath();
		context.rect(
			rectangle.xLocation + rectangle.width * 0.7,
			rectangle.yLocation - roofHeight * 0.68 - chimneyHeight,
			chimneyWidth,
			roofHeight * 0.68 + chimneyHeight - roofHeight * 0.5
		);
		context.fillStyle = "#8a5a3a";
		context.fill();
		context.strokeStyle = "#4a1010";
		context.lineWidth = 3;
		context.stroke();
	},

	//milestone decorations that appear as progress increases
	drawMilestones: function (context, rectangle, percent, wrapperWidth, wrapperHeight) {
		if (percent >= 25) {
			this.drawBushes(context, rectangle);
		}
		if (percent >= 50) {
			this.drawSmoke(context, rectangle);
		}
		if (percent >= 75) {
			this.drawSun(context, wrapperWidth);
		}
		if (percent >= 100) {
			this.drawConfetti(context, wrapperWidth, wrapperHeight);
		}
	},

	drawBushes: function (context, rectangle) {
		let groundY = rectangle.yLocation + rectangle.height;
		let bushRadius = rectangle.width / 10;

		let drawBush = centerX => {
			context.beginPath();
			context.fillStyle = "#2e7d32";
			context.arc(centerX, groundY, bushRadius, Math.PI, 0);
			context.fill();
			context.closePath();
		};

		drawBush(rectangle.xLocation - bushRadius);
		drawBush(rectangle.xLocation + rectangle.width + bushRadius);
	},

	drawSmoke: function (context, rectangle) {
		let roofHeight = rectangle.height / 1.5;
		let chimneyTopX = rectangle.xLocation + rectangle.width * 0.7 + rectangle.width / 20;
		let chimneyTopY = rectangle.yLocation - roofHeight * 0.68 - rectangle.height / 8;

		context.fillStyle = "rgba(230, 230, 230, 0.7)";
		[0, 1, 2].forEach(i => {
			context.beginPath();
			context.arc(chimneyTopX + i * 6, chimneyTopY - i * 18, 8 + i * 3, 0, Math.PI * 2);
			context.fill();
			context.closePath();
		});
	},

	drawSun: function (context, wrapperWidth) {
		let centerX = wrapperWidth * 0.85;
		let centerY = 40;
		let radius = 20;

		context.beginPath();
		context.fillStyle = "#ffd54f";
		context.arc(centerX, centerY, radius, 0, Math.PI * 2);
		context.fill();
		context.closePath();

		context.strokeStyle = "#ffd54f";
		context.lineWidth = 3;
		for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
			context.beginPath();
			context.moveTo(centerX + Math.cos(angle) * (radius + 5), centerY + Math.sin(angle) * (radius + 5));
			context.lineTo(centerX + Math.cos(angle) * (radius + 15), centerY + Math.sin(angle) * (radius + 15));
			context.closePath();
			context.stroke();
		}
	},

	drawConfetti: function (context, wrapperWidth, wrapperHeight) {
		let colors = ["#e63946", "#f1c40f", "#2ecc71", "#3498db", "#9b59b6"];

		for (let i = 0; i < 60; i++) {
			context.beginPath();
			context.fillStyle = colors[i % colors.length];
			context.rect(Math.random() * wrapperWidth, Math.random() * wrapperHeight, 6, 6);
			context.fill();
			context.closePath();
		}
	},

	drawBricks: function (context, rectangle, goal) {
		if (!goal) {
			return;
		}

		let oneBrick = goal / 100;
		let bricksDrawn = 0;
		let wallBorderInset = 5; //half of drawBase's stroke lineWidth, which straddles the wall edge
		let brickWidth = (rectangle.width - wallBorderInset * 2) / 10;
		let brickHeight = rectangle.height / 10;
		let brickXLocation = rectangle.xLocation + wallBorderInset;
		let brickYLocation = rectangle.yLocation + rectangle.height - brickHeight;

		for (let i = oneBrick; i <= this.accountBalance; i += oneBrick) {
			if (bricksDrawn > 0 && bricksDrawn % 10 === 0) {
				//move the row up
				brickYLocation -= brickHeight;
				brickXLocation = rectangle.xLocation + wallBorderInset;
			}
			this.drawBrick(context, brickXLocation, brickYLocation, brickWidth, brickHeight, bricksDrawn);
			bricksDrawn++;
			brickXLocation += brickWidth;
		}
	},

	drawBrick: function (context, xLocation, yLocation, width, height, brickIndex) {
		//deterministic pseudo-random shading based on brick index so bricks look hand-laid
		let shadeSeed = (brickIndex * 37) % 5;
		let brickColors = ["#b06a4f", "#c17a5c", "#a15f46", "#b87257", "#a66650"];

		context.beginPath();
		context.rect(xLocation, yLocation, width, height);
		context.fillStyle = brickColors[shadeSeed];
		context.fill();
		context.closePath();

		//mortar lines
		context.strokeStyle = "#e0d8c8";
		context.lineWidth = 3;
		context.stroke();
	},

	//utility functions
	n2px: function (number) {
		let numberAsString = number.toString();
		return numberAsString + "px";
	}
});
