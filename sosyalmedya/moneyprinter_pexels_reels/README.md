# MoneyPrinter + Pexels Reels Paketi

Bu paket carousel gorsellerinden degil, MoneyPrinterTurbo configindeki Pexels API ile bulunan stok videolardan uretilen daha profesyonel Reels denemelerini tutar.

## Ciktilar

- `outputs/reels_01_pexels_lansman.mp4` - Pexels stok videolu lansman, yaklasik 25 sn.
- `outputs/reels_02_pexels_30_saniyede_rapor.mp4` - Pexels stok videolu rapor akisi, yaklasik 24 sn.

## Uretim Notu

`create_pexels_reels.py`, Pexels'ten ilgili yol/telefon/sehir videolarini indirir, Alo Cukur Hatti marka katmanini ekler, Turkce seslendirme uretir ve 9:16 MP4 olarak render eder.

Ham Pexels videolari `assets/` altinda tutulur ve git'e alinmaz. Final MP4'ler ile kaynak listesi `source_manifest.json` icinde saklanir.
