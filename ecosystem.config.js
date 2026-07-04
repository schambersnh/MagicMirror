module.exports = {
	apps: [
		{
			name: "mm",
			script: "npm",
			args: "start",
			cwd: "/home/schambersnh/MagicMirror",
			env: {
				WAYLAND_DISPLAY: "wayland-0"
			}
		}
	]
};
