---
slug: what-is-vpip-poker
title: "What Is VPIP in Poker? How to Calculate It (and What's a Good VPIP)"
description: "VPIP is the first stat every poker player should know. Here's what it means, how to calculate it correctly, what a good VPIP is by game type, and the mistake most trackers make."
date: 2026-07-28
updated: 2026-07-28
author: Final Table
keywords: ["what is VPIP", "VPIP poker", "how to calculate VPIP", "good VPIP", "VPIP meaning", "voluntarily put in pot"]
image: /og-image.png
readingMinutes: 6
---

**VPIP** stands for **V**oluntarily **P**ut **$** **I**n **P**ot. It's the
percentage of hands where you *chose* to put money in before the flop — by
calling or raising — out of all the hands you were dealt. In one number, it
tells you (and everyone paying attention) how loose or tight a player is.

It's the single most useful stat in poker, and it's the first one you should
learn to read. Here's exactly what it means, how it's calculated, and what
counts as a "good" number.

## What VPIP actually measures

Every hand, you're dealt two cards and you make a choice: fold, or
voluntarily put money in the pot. VPIP counts the second kind.

- **Call or raise preflop?** That hand counts toward your VPIP.
- **Fold preflop?** It doesn't.
- **Posting the big or small blind?** That's a *forced* bet, not a voluntary
  one — so just posting a blind and folding does **not** count. (Checking your
  option in the big blind when nobody raised doesn't count either — you didn't
  choose to put anything extra in.)

That's the whole idea: VPIP isolates the hands you *decided* to play. A player
with a high VPIP plays lots of hands (loose); a player with a low VPIP is
selective (tight).

## How to calculate VPIP

The formula looks simple:

**VPIP % = (hands you voluntarily entered ÷ hands you could have) × 100**

But that denominator is where almost everyone goes wrong. It is **not** "hands
you played." It's **hands you were dealt and had a real chance to act on.**
The correct version:

**VPIP % = voluntary-entry hands ÷ (hands dealt − walks) × 100**

A **walk** is when everyone folds around to the big blind and they win without
acting. The big blind never got a chance to voluntarily do anything, so those
hands have to be removed from the denominator — otherwise your VPIP is
artificially deflated.

### The mistake most "poker stats" apps make

If a tracker divides by *hands played* instead of *hands dealt minus walks*,
its VPIP is broken — every player comes out near 100%, because "hands played"
already means "hands you put money in." It's a surprisingly common bug, and
it's the fastest way to tell whether a stats tool actually understands poker.

At [Final Table](https://www.finaltable.io) we use the correct denominator —
hands dealt minus walks — and we compute it **per position**, which (as you'll
see below) is where VPIP gets genuinely useful.

## What is a good VPIP?

There's no single "right" number — it depends on the game — but here are the
ranges strong, balanced players fall into:

| Game type | Good VPIP range |
|-----------|-----------------|
| 6-max cash | ~22–28% |
| Full-ring (9-handed) cash | ~15–20% |
| Loose/live low-stakes games | often 30–40%+ (exploitable) |

A few reads you can take straight from the number:

- **Under ~15%** — very tight ("nit"). Folds too much; you can steal their
  blinds relentlessly and fold when they finally play back.
- **~15–28%** — the healthy, winning range for most games.
- **35%+** — loose ("calling station" or "maniac"). Plays far too many hands;
  value-bet them relentlessly and stop bluffing.

## The number that matters more than VPIP alone

VPIP by itself is a blunt instrument. Two things sharpen it:

**1. VPIP vs PFR.** [PFR](/blog/track-poker-stats-without-laptop) (Pre-Flop
Raise %) is always lower than VPIP, since every raise is also a voluntary
entry. The *gap* between them tells you how a player enters pots: a small gap
(e.g. 24/20) means an aggressive player who mostly raises; a big gap (e.g.
30/6) means a passive limp-caller you can punish.

**2. VPIP by position.** A 22% VPIP is tight from under the gun and loose from
the button — the same number means opposite things depending on where you're
sitting. A single blended VPIP hides your real leaks. Positional VPIP is where
you find them: maybe you're solid overall but bleeding chips by playing 30% of
hands from early position.

## How to actually track your VPIP live

Online, your tracker does this automatically. Live, you've historically been
flying blind — there's no hand history to import from a casino table.

That's exactly what [Final Table](https://www.finaltable.io) fixes: you log
hands on your phone as you play, and it calculates your VPIP (with the correct
denominator, by position) from your real hands — no laptop, no export. Pair it
with [our guide on tracking stats without a laptop](/blog/track-poker-stats-without-laptop)
and you'll have the same self-knowledge online players take for granted.

## The takeaway

VPIP is how loose or tight you play, in one number — voluntary preflop entries
divided by hands dealt minus walks. Learn to read it (and its gap with PFR, by
position), and you'll start spotting leaks in your own game and weaknesses in
everyone else's.

*[Final Table](https://www.finaltable.io) calculates your VPIP and six other
core stats live, by position, from hands you log at the table. Free to start
on iOS and Android.*
