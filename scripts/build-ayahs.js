#!/usr/bin/env node
/**
 * Rebuild data/ayahs.json from AlQuran Cloud.
 * Run on a machine with good network — not needed on the Pi.
 */
const fs = require("fs");
const path = require("path");

const API = "https://api.alquran.cloud/v1/quran";
const ARABIC = "quran-uthmani";
const TRANSLATION = "en.yusufali";
const OUT = path.join(__dirname, "..", "data", "ayahs.json");

async function fetchEdition(id) {
	const res = await fetch(`${API}/${id}`);
	if (!res.ok) throw new Error(`HTTP ${res.status} for ${id}`);
	const json = await res.json();
	if (json.code !== 200) throw new Error(`Bad response for ${id}`);
	return json.data;
}

(async () => {
	const [ar, en] = await Promise.all([fetchEdition(ARABIC), fetchEdition(TRANSLATION)]);
	const ayahs = [];
	for (let si = 0; si < ar.surahs.length; si++) {
		const s = ar.surahs[si];
		const es = en.surahs[si];
		const count = s.ayahs.length;
		for (let ai = 0; ai < s.ayahs.length; ai++) {
			const a = s.ayahs[ai];
			const ea = es.ayahs[ai];
			ayahs.push({
				refNumber: a.number,
				arabic: a.text,
				translation: ea.text,
				surahNameArabic: s.name,
				surahNameEnglish: s.englishName,
				surahNameEnglishTranslation: s.englishNameTranslation,
				surahNumber: s.number,
				ayahNumberInSurah: a.numberInSurah,
				numberOfAyahs: count,
				juzNumber: a.juz
			});
		}
	}
	if (ayahs.length !== 6236) {
		throw new Error(`Expected 6236 ayahs, got ${ayahs.length}`);
	}
	fs.mkdirSync(path.dirname(OUT), { recursive: true });
	fs.writeFileSync(
		OUT,
		JSON.stringify({
			collection: "Quran",
			editionArabic: ARABIC,
			editionTranslation: TRANSLATION,
			total: ayahs.length,
			ayahs
		})
	);
	console.log(`Wrote ${ayahs.length} ayahs to ${OUT}`);
})().catch((err) => {
	console.error(err);
	process.exit(1);
});
