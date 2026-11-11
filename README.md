# MMM-QuranAyah

A [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) module that shows a **Quran ayah** from a **bundled local JSON file** — no API, no internet needed after install.

Same approach as [MMM-DailyHadith](https://github.com/Zamy97/MMM-DailyHadith): ship the data with the module so flaky Pi Wi‑Fi cannot break the display.

## Features

- **6,236 ayahs** bundled (`quran-uthmani` + `en.yusufali`)
- Works fully offline
- Random or daily rotation
- Bundled **Amiri Quran** font for clean Arabic on Raspberry Pi
- Optional Telegram `/quranverse` (MMM-TelegramBot)

## Installation

```bash
cd ~/MagicMirror/modules
git clone https://github.com/Zamy97/MMM-QuranAyah.git
```

No `npm install` required (Node 18+). The data file is included — do not run the build script on the Pi.

Add to `~/MagicMirror/config/config.js`:

```js
{
	module: "MMM-QuranAyah",
	position: "bottom_bar",
	config: {
		showArabic: true,
		showTranslation: true,
		surahArabicName: false,
		rotationMode: "random",
		updateInterval: 300000
	}
}
```

Restart MagicMirror (`pm2 restart mm`).

## Configuration

| Option | Description | Default |
|--------|-------------|---------|
| `showArabic` | Show Arabic text | `true` |
| `showTranslation` | Show English translation | `true` |
| `surahArabicName` | Use Arabic surah name in the reference | `false` |
| `dataFile` | Path to JSON (relative to module) | `data/ayahs.json` |
| `rotationMode` | `"random"` or `"daily"` | `"random"` |
| `updateInterval` | How often to pick a new ayah (ms) | `300000` (5 min) |
| `animationSpeed` | DOM update animation (ms) | `2500` |

`arabicEdition` / `translationLang` from older configs are ignored (data is local).

## Rebuild data (developers only)

On a machine with good network:

```bash
node scripts/build-ayahs.js
```

## License

MIT. Quran text via [AlQuran Cloud](https://alquran.cloud/api). Font: Amiri Quran (SIL OFL).
