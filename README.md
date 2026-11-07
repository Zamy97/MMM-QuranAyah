# MMM-QuranAyah

A [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) module that shows a **Quran ayah** from the [AlQuran Cloud API](https://alquran.cloud/api).

Built to match our other house modules ([MMM-DailyHadith](https://github.com/Zamy97/MMM-DailyHadith), [MMM-DailyDua](https://github.com/Zamy97/MMM-DailyDua)):

- HTTPS + native Node `fetch` (Node 18+)
- Failed API calls are logged; MagicMirror does **not** crash
- One combined API request for Arabic + translation
- Bundled **Amiri Quran** font for clean Uthmani Arabic on Raspberry Pi
- Random or daily rotation

## Installation

```bash
cd ~/MagicMirror/modules
git clone https://github.com/Zamy97/MMM-QuranAyah.git
```

No `npm install` required.

Add to `~/MagicMirror/config/config.js`:

```js
{
	module: "MMM-QuranAyah",
	position: "bottom_bar",
	config: {
		showArabic: true,
		showTranslation: true,
		surahArabicName: false,
		arabicEdition: "quran-uthmani",
		translationLang: "en.yusufali",
		rotationMode: "random",
		updateInterval: 300000
	}
}
```

Restart MagicMirror (`pm2 restart magicmirror`).

## Configuration

| Option | Description | Default |
|--------|-------------|---------|
| `showArabic` | Show Arabic text | `true` |
| `showTranslation` | Show translation text | `true` |
| `surahArabicName` | Use Arabic surah name in the reference | `false` |
| `arabicEdition` | Arabic text edition (`quran-uthmani`, `quran-simple`, …) | `quran-uthmani` |
| `translationLang` | Edition id from [AlQuran editions](https://api.alquran.cloud/edition) | `en.yusufali` |
| `rotationMode` | `"random"` or `"daily"` | `"random"` |
| `updateInterval` | How often to fetch (ms) | `300000` (5 min) |
| `animationSpeed` | DOM update animation (ms) | `2500` |

## Telegram (optional)

If you use [MMM-TelegramBot](https://github.com/eouia/MMM-TelegramBot), `/quranverse` returns the ayah currently on the mirror.

## Migrating from MMM-RandomQuranAyah

If you previously used the old folder name:

```bash
cd ~/MagicMirror/modules
pm2 stop magicmirror
rm -rf MMM-RandomQuranAyah
git clone https://github.com/Zamy97/MMM-QuranAyah.git
```

Then in `config.js` change `module: "MMM-RandomQuranAyah"` → `module: "MMM-QuranAyah"`, and in `custom.css` rename `.MMM-RandomQuranAyah` selectors to `.MMM-QuranAyah`.

## License

MIT
