# Public diary: learning and exploring the Kuiper

**5 October 2026**

The focus today is making the mathematics of the Kuiper something people can experiment with directly. Move a point, change a number, and see the relationship between distance, angle and position. The aim is understanding through interaction, with the formulas available to inspect and reproduce in a spreadsheet.

## Open the published work

- [Learn the Kuiper](https://ventusltd.github.io/kuiper-belt/learn-the-kuiper/): the interactive learning page.
- [What is the Kuiper?](https://ventusltd.github.io/kuiper-belt/what-is-kuiper.html): the purpose and addressing idea.
- [See Through](https://ventusltd.github.io/kuiper-belt/see-through/): exploration of mapped substations and illustrative geometry.
- [Kuiper diary, 5 October](https://ventusltd.github.io/kuiper-belt/diary/20261005.html): the public account of these experiences and their direction.

The learning work connects square roots and radius, modulo and turns, and the conversion from angle and distance to X and Y. The wider goal is to make deterministic addressing understandable enough to question, reproduce and use in other work. Sphere and cube experiments extend the learning direction from area to volume.

## Follow the projects

These repositories provide different parts of the work. The links describe their documented roles; they are not a claim that every project is integrated into one application.

| Project | Public role | Diary |
| --- | --- | --- |
| [Kuiper](https://github.com/Ventusltd/kuiper-belt) | The Kuiper instrument, Learn the Kuiper, and See Through. | [5 October](https://github.com/Ventusltd/kuiper-belt/blob/main/diary/2026-10-05-learn-kuiper-project-links.md) |
| [CVAA](https://github.com/Ventusltd/cvaa) | Executable regression checks and their provenance. | [5 October](https://github.com/Ventusltd/cvaa/blob/main/reports/DIARY-20261005-learn-the-kuiper.md) |
| [Cosmic](https://github.com/Ventusltd/cosmic) | Navigation through a measured hierarchy and its declared placement laws. | [5 October](https://github.com/Ventusltd/cosmic/blob/main/docs/DIARY-LEARN-THE-KUIPER-20261005.md) |
| [Spiders](https://github.com/Ventusltd/spiders) | Repository relationships and network-topology views. | [5 October](https://github.com/Ventusltd/spiders/blob/main/docs/diary/2026-10-05-learn-the-kuiper.md) |
| [Maths](https://github.com/Ventusltd/maths) | First-principles notes and spreadsheet exercises. | [5 October](https://github.com/Ventusltd/maths/blob/main/diary/2026-10-05-learn-the-kuiper.md) |

[Worlds](https://github.com/Ventusltd/worlds-) is related work on procedural geometry and design spaces.

## Keep the mathematics traceable

The spreadsheet exercise uses `r = sqrt(k)`. The live wafer rule uses `r = sqrt(k + 0.5)`, with keys starting at zero. Its whole-number angular remainder is `(k * 2654435769) mod 4294967296`. These related implementations should be identified explicitly when comparing a drawing with a formula. The [placement note](https://github.com/Ventusltd/maths/blob/1b92448a6336a4931a7f22d192610d23e659a782/10-kuiper-placement-law.md) explains the distinction.

A point freely positioned with X and Y has coordinates; it does not automatically have a real Kuiper key. A real key determines both its radius and its angle. Likewise, an address or an illustrative substation model does not establish electrical connectivity or available network capacity. Those questions need their own data and engineering models.

## Public sources and discovery

The [public link catalogue](https://github.com/Ventusltd/kuiper-belt/blob/main/diary/2026-10-05-public-links.json) is also available as [raw JSON](https://raw.githubusercontent.com/Ventusltd/kuiper-belt/main/diary/2026-10-05-public-links.json). It lists the project repositories, diary entries and public application links for readers and software to follow.

This entry describes the public sources at the revisions listed in that catalogue. For Learn the Kuiper, the public entry pointed to [the 202610050609 page](https://ventusltd.github.io/kuiper-belt/learn-the-kuiper/202610050609/) when checked on this date; its [published source](https://github.com/Ventusltd/kuiper-belt/tree/8e24d1f3142c805e13695b9c48ce3e2979454cf3/learn-the-kuiper/202610050609) preserves the referenced implementation. The main play link can move forward as new work is published.

The next learning goal is to make the link from an edited number to a changed position immediately clear, and to carry that understanding from circles into area and volume. This is a development aim; learning outcomes require observation of people using the tools.
