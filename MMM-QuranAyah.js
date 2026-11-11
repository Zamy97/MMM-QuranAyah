Module.register("MMM-QuranAyah", {
	defaults: {
		showArabic: true,
		showTranslation: true,
		surahArabicName: false,
		dataFile: "data/ayahs.json",
		rotationMode: "random",
		updateInterval: 300000,
		animationSpeed: 2500
	},

	getStyles() {
		return ["MMM-QuranAyah.css"];
	},

	getTranslations() {
		return {
			en: "translations/en.json"
		};
	},

	getCommands(commander) {
		commander.add({
			command: "quranverse",
			description: this.translate("TXT_RQA_DESC"),
			callback: "cmd_quranverse"
		});
	},

	cmd_quranverse(_command, handler) {
		handler.reply("TEXT", this.dailyQuranVerse || this.translate("LOADING"), {
			parse_mode: "Markdown"
		});
	},

	requestAyah() {
		this.sendSocketNotification("GET_AYAH", {
			dataFile: this.config.dataFile,
			rotationMode: this.config.rotationMode
		});
	},

	formatReference(ayah) {
		if (this.config.surahArabicName) {
			return `${ayah.surahNameArabic}:${ayah.ayahNumberInSurah}`;
		}
		return `QS. ${ayah.surahNameEnglish}:${ayah.ayahNumberInSurah}`;
	},

	start() {
		Log.info(`Starting module: ${this.name}`);
		this.ayah = null;
		this.errorMessage = null;
		this.dailyQuranVerse = "";

		this.requestAyah();
		setInterval(() => {
			this.requestAyah();
		}, this.config.updateInterval);
	},

	getDom() {
		const wrapper = document.createElement("div");

		if (this.errorMessage) {
			wrapper.className = "dimmed light small error";
			wrapper.innerHTML = this.translate("ERROR");
			return wrapper;
		}

		if (!this.ayah) {
			wrapper.className = "dimmed light small";
			wrapper.innerHTML = this.translate("LOADING");
			return wrapper;
		}

		const ayah = this.ayah;
		const reference = this.formatReference(ayah);
		let telegramText = "";

		if (this.config.showArabic && ayah.arabic) {
			const arabic = document.createElement("div");
			arabic.className = "txt-arabic bright medium light";
			arabic.textContent = ayah.arabic;
			wrapper.appendChild(arabic);
			telegramText += `${ayah.arabic}\n`;
		}

		if (this.config.showTranslation && ayah.translation) {
			const translation = document.createElement("div");
			translation.className = "txt-translation bright small light";
			translation.textContent = `${ayah.translation} (${reference})`;
			wrapper.appendChild(translation);
			telegramText += `_${ayah.translation}_\n(${reference})`;
		} else {
			const refOnly = document.createElement("div");
			refOnly.className = "txt-reference dimmed xsmall light";
			refOnly.textContent = `(${reference})`;
			wrapper.appendChild(refOnly);
			telegramText += `(${reference})`;
		}

		this.dailyQuranVerse = telegramText;
		return wrapper;
	},

	socketNotificationReceived(notification, payload) {
		if (notification === "AYAH_RESULT") {
			this.errorMessage = null;
			this.ayah = payload;
			this.updateDom(this.config.animationSpeed);
		}

		if (notification === "AYAH_ERROR") {
			this.errorMessage = payload.message;
			if (!this.ayah) {
				this.updateDom(this.config.animationSpeed);
			}
		}
	}
});
