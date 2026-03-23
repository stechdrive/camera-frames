import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
	base: command === "build" ? "/camera-frames/" : "/",
	server: {
		host: true,
		port: 8080,
	},
}));
