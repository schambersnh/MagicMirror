module.exports = {
	apps: [
		{
			name: "mm",
			script: "node_modules/.bin/electron",
			args: "js/electron.js",
			cwd: "/home/schambersnh/MagicMirror",
			env: {
				DISPLAY: ":0"
			}
		}
	]
};
