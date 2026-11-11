/* Magic Mirror
 * Node Helper: MMM-QuranAyah
 *
 * Loads ayahs from a bundled local JSON file — no internet required.
 */

const fs = require("fs");
const path = require("path");
const NodeHelper = require("node_helper");

const DEFAULT_DATA_FILE = "data/ayahs.json";

module.exports = NodeHelper.create({
	ayahCache: null,
	cacheFile: null,

	start() {
		console.log(`Starting node_helper for ${this.name}`);
	},

	getDayOfYear(date) {
		const start = new Date(date.getFullYear(), 0, 0);
		const diff = date - start;
		const oneDay = 1000 * 60 * 60 * 24;
		return Math.floor(diff / oneDay);
	},

	resolvePath(dataFile) {
		return path.join(__dirname, dataFile);
	},

	loadAyahs(dataFile) {
		const filePath = this.resolvePath(dataFile || DEFAULT_DATA_FILE);

		if (this.ayahCache && this.cacheFile === filePath) {
			return this.ayahCache;
		}

		if (!fs.existsSync(filePath)) {
			throw new Error(`Data file not found: ${dataFile || DEFAULT_DATA_FILE}`);
		}

		const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
		if (!data.ayahs || data.ayahs.length === 0) {
			throw new Error(`No ayahs found in ${dataFile || DEFAULT_DATA_FILE}`);
		}

		this.ayahCache = data;
		this.cacheFile = filePath;
		console.log(
			`${this.name}: loaded ${data.total || data.ayahs.length} ayahs from ${path.basename(filePath)}`
		);
		return data;
	},

	pickAyah(data, rotationMode) {
		const ayahs = data.ayahs;
		let index = 0;
		if (rotationMode === "daily") {
			index = this.getDayOfYear(new Date()) % ayahs.length;
		} else {
			index = Math.floor(Math.random() * ayahs.length);
		}
		return ayahs[index];
	},

	socketNotificationReceived(notification, payload) {
		if (notification !== "GET_AYAH") {
			return;
		}

		try {
			const data = this.loadAyahs(payload && payload.dataFile);
			const ayah = this.pickAyah(data, (payload && payload.rotationMode) || "random");
			this.sendSocketNotification("AYAH_RESULT", ayah);
		} catch (error) {
			console.error(`${this.name}:`, error.message || error);
			this.sendSocketNotification("AYAH_ERROR", {
				message: error.message || "Failed to load ayah"
			});
		}
	}
});
