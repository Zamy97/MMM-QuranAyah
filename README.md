# MMM-RandomQuranAyah

A [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) module that shows a **Quran ayah** from the [AlQuran Cloud API](https://alquran.cloud/api).

Maintained fork of the original [slametps/MMM-RandomQuranAyah](https://github.com/slametps/MMM-RandomQuranAyah), rewritten for reliability:

- HTTPS only (the API now redirects `http://` → `https://`)
- Native Node `fetch` — no deprecated `request` / `async` packages
- Failed API calls are logged; MagicMirror does **not** crash
- One combined API request for Arabic + translation
- Bundled **Amiri Quran** font so Uthmani Arabic renders without tofu boxes on Raspberry Pi
- Optional **daily** rotation (same ayah all day), matching our other house modules
- Drop-in compatible with existing house `config.js` and `.MMM-RandomQuranAyah` CSS

## Installation

```bash
cd ~/MagicMirror/modules
# remove the old third-party copy if present
rm -rf MMM-RandomQuranAyah
git clone https://github.com/Zamy97/MMM-RandomQuranAyah.git
```

No `npm install` required (Node 18+).

Add to `~/MagicMirror/config/config.js`:

```js
{
	module: "MMM-RandomQuranAyah",
	position: "bottom_bar",
	config: {
		showArabic: true,
		showTranslation: true,
		surahArabicName: false,
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

## Migrating from slametps/MMM-RandomQuranAyah

1. Replace the module folder (clone above).
2. Keep your existing `config` block — keys are compatible. `apiVersion` is ignored if still present.
3. House `custom.css` selectors (`.MMM-RandomQuranAyah .txt-arabic`, etc.) continue to work.

## License

MIT
