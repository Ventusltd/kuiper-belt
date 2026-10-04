# Learn the Kuiper: Astra by Codex

An independent Astra build developed through Codex for GlobalGrid2050. This dated version is a separate playground for comparison with the [preserved Claude version](https://ventusltd.github.io/kuiper-belt/learn-the-kuiper/202610042225/).

[Open this version](https://ventusltd.github.io/kuiper-belt/learn-the-kuiper/astra-codex/202610042233/). The files also work offline: download this folder and open `index.html` in a current browser.

Start with one particle. Change its turn, then reveal the next lever to explore distance, population, X/Y shadows and quiet time. The REAL KUIPER control switches from the teaching spiral to the shared live placement law. There are no quizzes or scores.

## Public source and verification

Source lines and historical address intervals come from the public [Ventusltd/kuiper-belt repository at commit 7a65dd315b0c60b1baf9a7090206c900b2cfd0a1](https://github.com/Ventusltd/kuiper-belt/tree/7a65dd315b0c60b1baf9a7090206c900b2cfd0a1). File origins and hashes travel with this release in `code-data.source.json`. Repeated and blank source lines are retained; demonstration line addresses are distinct from historical estate addresses.

The unmodified shared `kuiper-law.js` has SHA-256 `2c7512ea1bfdc65f646684655338fa9e2e0564fa89ba38b42577cbc1ceb564ea`. Every real placement calls `KuiperLaw.place`.

Release checks measured 1,100,009 real placements with zero differences from that shared law, 10,000 unusual parameter sets without exceptions, and 99 desktop/phone interaction assertions with no failures: 91 full interaction checks plus 8 targeted final-preset checks. There were 38 reviewed screenshots across the full and focused runs. The placement comparison verifies faithful use of shared code; it is not an independent proof of the mathematics. Separate exhaustive small-population checks tested nearest-point and neighbour-query results.

[Read the public verification summary](verification-summary.json) for measured cases, witnesses, seeds, timings and file hashes. Each gate retains its actual tested hashes; the release hashes identify the published bytes separately.

## Precision and scale

Large drawings show a bounded sample. The magnifier queries neighbouring addresses separately; incomplete or unsupported queries are marked approximate. Float64 coordinates lose fine detail at very large addresses. Angular residues repeat every 2^32 keys, so spacing is not literally constant at every scale.

Positions are computed from addresses. No coordinate database is persisted; temporary drawing samples exist in memory. Arbitrary practice numbers can produce invalid radii or addresses outside the exact-integer domain, and the interface reports those limits.

Code follows the repository's Apache-2.0 licence; documentation and generated data follow its CC BY 4.0 terms. Public-source attribution remains in the supplied data files.
