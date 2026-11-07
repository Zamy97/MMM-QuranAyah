/* Magic Mirror
 * Node Helper: MMM-QuranAyah
 *
 * Fetches a Quran ayah from the AlQuran Cloud API over HTTPS.
 * Uses native fetch — no request / async dependencies.
 */

const NodeHelper = require("node_helper");

const API_BASE = "https://api.alquran.cloud/v1";
const TOTAL_AYAHS = 6236;
const DEFAULT_ARABIC = "quran-uthmani";
const DEFAULT_TRANSLATION = "en.yusufali";
const FETCH_TIMEOUT_MS = 15000;

module.exports = NodeHelper.create({
	start() {
		console.log(`Starting node_helper for ${this.name}`);
	},

	getDayOfYear(date) {
		const start = new Date(date.getFullYear(), 0, 0);
		const diff = date - start;
		const oneDay = 1000 * 60 * 60 * 24;
		return Math.floor(diff / oneDay);
	},

	pickAyahNumber(rotationMode) {
		if (rotationMode === "daily") {
			return (this.getDayOfYear(new Date()) % TOTAL_AYAHS) + 1;
		}
		return Math.floor(Math.random() * TOTAL_AYAHS) + 1;
	},

	async fetchJson(url) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

		try {
			const response = await fetch(url, {
				method: "GET",
				headers: { Accept: "application/json" },
				signal: controller.signal
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status} for ${url}`);
			}

			return response.json();
		} finally {
			clearTimeout(timer);
		}
	},

	async fetchAyah(payload) {
		const arabicEdition = payload.arabicEdition || DEFAULT_ARABIC;
		const translationLang = payload.translationLang || DEFAULT_TRANSLATION;
		const rotationMode = payload.rotationMode || "random";
		const ayahNumber = this.pickAyahNumber(rotationMode);
		const editions = `${arabicEdition},${translationLang}`;
		const url = `${API_BASE}/ayah/${ayahNumber}/editions/${editions}`;

		const result = await this.fetchJson(url);
		if (!result || result.code !== 200 || !Array.isArray(result.data) || result.data.length === 0) {
			throw new Error("Unexpected API response from AlQuran Cloud");
		}

		const arabic = result.data[0];
		const translation = result.data[1] || result.data[0];
		const surah = arabic.surah || {};

		return {
			refNumber: ayahNumber,
			arabic: arabic.text || "",
			translation: translation.text || "",
			surahNameArabic: surah.name || "",
			surahNameEnglish: surah.englishName || "",
			surahNameEnglishTranslation: surah.englishNameTranslation || "",
			surahNumber: surah.number || 0,
			ayahNumberInSurah: arabic.numberInSurah || 0,
			numberOfAyahs: surah.numberOfAyahs || 0,
			juzNumber: arabic.juz || 0
		};
	},

	socketNotificationReceived(notification, payload) {
		if (notification !== "GET_AYAH") {
			return;
		}

		this.fetchAyah(payload || {})
			.then((ayah) => {
				this.sendSocketNotification("AYAH_RESULT", ayah);
			})
			.catch((error) => {
				console.error(`${this.name}:`, error.message || error);
				this.sendSocketNotification("AYAH_ERROR", {
					message: error.message || "Failed to fetch ayah"
				});
			});
	}
});
