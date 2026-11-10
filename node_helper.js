/* Magic Mirror
 * Node Helper: MMM-QuranAyah
 *
 * Fetches a Quran ayah from the AlQuran Cloud API over HTTPS.
 * Uses native fetch — no request / async dependencies.
 */

const dns = require("dns");
const NodeHelper = require("node_helper");

// Many home networks (and Pis) advertise IPv6 but cannot route it.
// Prefer A records so fetch does not fail with ENETUNREACH on AAAA.
if (typeof dns.setDefaultResultOrder === "function") {
	dns.setDefaultResultOrder("ipv4first");
}

const API_BASE = "https://api.alquran.cloud/v1";
const TOTAL_AYAHS = 6236;
const DEFAULT_ARABIC = "quran-uthmani";
const DEFAULT_TRANSLATION = "en.yusufali";
const FETCH_TIMEOUT_MS = 20000;
const FETCH_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

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

	sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	},

	isRetryable(error) {
		const code = (error && error.cause && error.cause.code) || error.code || "";
		const message = error.message || "";
		return (
			code === "UND_ERR_CONNECT_TIMEOUT" ||
			code === "ETIMEDOUT" ||
			code === "ECONNRESET" ||
			code === "ENETUNREACH" ||
			code === "EAI_AGAIN" ||
			code === "ENOTFOUND" ||
			message.includes("abort") ||
			message.includes("fetch failed")
		);
	},

	formatFetchError(error) {
		const cause = error && error.cause;
		if (cause && cause.code) {
			return `fetch failed (${cause.code}${cause.address ? ` ${cause.address}` : ""})`;
		}
		return error.message || String(error);
	},

	async fetchJsonOnce(url) {
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

	async fetchJson(url) {
		let lastError = null;

		for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
			try {
				return await this.fetchJsonOnce(url);
			} catch (error) {
				lastError = error;
				if (attempt < FETCH_RETRIES && this.isRetryable(error)) {
					console.warn(
						`${this.name}: attempt ${attempt}/${FETCH_RETRIES} failed (${this.formatFetchError(error)}); retrying…`
					);
					await this.sleep(RETRY_DELAY_MS * attempt);
					continue;
				}
				throw error;
			}
		}

		throw lastError;
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
				console.error(`${this.name}:`, this.formatFetchError(error));
				this.sendSocketNotification("AYAH_ERROR", {
					message: this.formatFetchError(error)
				});
			});
	}
});
