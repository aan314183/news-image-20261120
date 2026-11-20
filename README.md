# news-image-20261120 — The World in One Day

Entry for the make.fun bounty **"Sum up 20 November's world news in one image"**
($250, deadline 22 November 2026 07:00 WIB).

## The image

A newspaper front page, **"THE WORLD IN ONE DAY — FRIDAY 20 NOVEMBER 2026"**,
summing up Friday 20 November 2026:

- **Lead — Cyclone Akvan:** Severe Cyclonic Storm Akvan made landfall near
  Gopalpur, Odisha, around midday; 105,304 people evacuated to 1,224 shelters
  as winds of 90–100 km/h lashed the coast — the third cyclone there in a month.
- **Shenzhen · Summit:** the first Trump–Xi–Putin three-way summit continues
  at APEC; nuclear arms and energy on the agenda.
- **Vienna · Nuclear:** the UN nuclear watchdog says North Korea is expanding
  its Yongbyon uranium-enrichment plant.
- **Caracas · Diplomacy:** the US and Venezuela sign a deal to restore
  military cooperation, the US defence chief says.
- **Suva · Climate:** Fiji declares a national disaster as severe drought
  and water shortages grip the islands.
- **Hormuz · Shipping:** an ADNOC tanker is attacked in the Strait of Hormuz;
  one crew member is missing.
- **Sport:** Henry Nicholls' unbeaten 113 carries New Zealand to 243/5 on day
  one of the first Test against India in Wellington. Business: Anthropic's
  valuation is reported at $1.5 trillion.

Sources: IMD · AP · Reuters · IAEA · UN News.

## How it was built

The banner photograph (a cyclone battering the Bay of Bengal coast) was
generated, then the page was composed with ffmpeg `drawtext` over it
(see the build script in the build directory). The finished artwork is
`entry.png` (1024×1024 PNG).

## The program

`main.ts` (Node 22, standard library only) checks the shipped `entry.png`
is a whole PNG within the 1 MiB / 1024×1024 gate and copies it to
`$MAKEFUN_OUTPUT_DIR/entry.png`. It uses no network and draws nothing, so
two runs write byte-identical output.

Run it locally:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see `LICENSE`.
