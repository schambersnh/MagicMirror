module.exports = {
	apps: [
		{
			name: "mm",
			script: "npm",
			args: "run start:x11",
			cwd: "/home/schambersnh/MagicMirror-fork",
			env: {
				WAYLAND_DISPLAY: "wayland-0",
				ELECTRON_ENABLE_GPU: "1"
			}
		}
	]
};
