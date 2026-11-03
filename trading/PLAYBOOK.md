# Price Action Playbook — Standard Setup

Source: Eric's playbook (Nov 1, 2026), built from the RektProof price action concepts
(ranges, deviation, MSB, three taps, continuation and reversal setups).

## 1. Ranges

Every setup starts with a range. Without one, there is no read on where liquidity sits.

| After a... | Range low | Range high |
|---|---|---|
| Downtrend | The first low that forms | The next high after it |
| Uptrend | The next low after the high | The first high that forms |

- Stops rest above the range high and below the range low. That is the liquidity price is hunting.
- Golden rule: once one side of the range is taken, the target is the opposite side.
- Timeframes: weekly and daily set direction only. All trades are taken on the 15m: range,
  deviation, MSB and retest are all marked there.

## 2. Deviation, MSB, supply and demand

A setup is confirmed only when a deviation is followed by a market structure break.

- **Deviation:** price trades outside the range, then closes back inside it.
- **MSB (market structure break):** price breaks the last swing point that formed before the deviation.
- **Supply or demand:** the zone at the deviation that caused the MSB. It is the entry, valid only after the MSB.

| | Low deviation (bullish) | High deviation (bearish) |
|---|---|---|
| Swing to break | Last swing high before the deviation | Last swing low before the deviation |
| Entry zone | Demand at the deviation | Supply at the deviation |
| Invalidation | Below the deviation wick | Above the deviation wick |
| Target | Untapped range high | Untapped range low |

- If price truly wants the other side, it should not revisit the deviation extreme twice.
- Levels drawn in the middle of a range are ignored. Price moves from one liquidity pocket to the next.

## 3. The three taps

The entry is always the third tap: the retest of the zone the deviation created.

1. **Tap 1, range forms:** the first low (or high) of the range.
2. **Tap 2, deviation:** price sweeps past tap 1 and closes back inside. Supply or demand forms here.
3. **Tap 3, retest:** after the MSB, price returns to that zone. It usually lines up with the tap 1 area. This is the entry.

The setup traps breakout traders. They short the sweep of the low (or buy the sweep of the high),
get stopped out, and fuel the move to the other side.

Not the same as the tap-count rule (section 6). Here the three taps are three separate events, and
tap 3 is an entry. The tap-count rule is about one support hit over and over, which weakens it.

## 4. Mean area (the 0.5)

The mean area is the midpoint of the range. It is the same idea as the point of control on a market profile.

| Range term | Market profile term |
|---|---|
| Range high | Value area high |
| Mean (0.5) | Point of control |
| Range low | Value area low |

- **Reclaim:** after a tap 3 retest, price reclaiming the 0.5 makes the opposite side of the range the magnet.
- **Bearish signal:** price rushes back toward the mean while printing lower highs. This usually ends with a sharp drop.
- **Bullish signal:** price drops toward the mean while printing higher lows. This usually ends with a sharp move up.
- **No trade at the mean itself.** It is the middle of the range, with no edge either way.

## 5. The four setups

All four setups run on the same engine: range, deviation, MSB, retest. The only difference is
whether the deviation goes with the prior trend or against it.

| Setup | Prior trend | Deviation | Entry | Target |
|---|---|---|---|---|
| Bullish continuation | Up | Below range low | Demand retest | New highs |
| Bearish continuation | Down | Above range high | Supply retest | New lows |
| Bullish reversal | Down, exhausting | Below untapped swing low | Demand retest | Range high, then new highs |
| Bearish reversal | Up, exhausting | Above untapped swing high | Supply retest | Range low, then new lows |

- **Continuation:** a three-tap structure inside the trend. Price fails to make a new extreme,
  takes the other side instead, then resumes the trend.
- **Reversal:** often shows a fair value gap (a fast, one-sided move) on the way to the swept
  level. The Fibonacci 1.618 extension is a common deviation target.
- **Label the stage, not just the setup.** For example: bearish reversal at step 5, MSB done,
  waiting for the supply retest.

## 6. Weekly open and tap count

The weekly open is the bias line for the week.

- **Below the weekly open (bearish week):** every rally toward the open is a short.
- **Above the weekly open (bullish week):** every dip toward the open is a long.
- **Weekly candle path:** a bearish week usually rallies first to print the upper wick, then
  breaks below the open and expands down. A bullish week is the mirror: dip first, then expand up.
- At the range low or first target: trim and move the stop to breakeven.
- **Tap count:** the more times one support or resistance level is hit, the more likely the next
  hit breaks it. Buyers or sellers there get used up, and stops pile up beyond it. By the 3rd or
  4th tap, hold runners for the break.

## 7. Confluence stack

Each tool answers one question. A trade needs at least three to agree, and any two that disagree mean no trade.

| Tool | Question it answers | What to look for |
|---|---|---|
| Weekly open and weekly candle | Which direction this week? | Price above or below the open, and the candle path so far |
| Setup (sections 1 to 5) | What pattern is forming, and what stage? | Range, deviation, MSB, retest |
| Fibonacci (swing high to swing low) | Where exactly? | 0.5 to 0.618 retest zone, 0.786 deep zone, 1.618 deviation target |
| RSI (14) | Is momentum confirming? | Divergence at the deviation: price makes a new extreme, RSI does not |
| Trigger (15m candle) | When to act? | A close back inside the range, or a close back through the zone |

## 8. Chart-mapping checklist

Run these steps in order on every chart. A long or short exists only when steps 4 to 6 are all in place.

1. **Direction (weekly, daily):** is the weekly and daily trend up, down, or exhausting? Everything after this step is marked on the 15m.
2. **Weekly bias:** price above or below the weekly open, and the weekly candle path so far.
3. **Range:** mark the range low, range high and the 0.5 using the section 1 rule.
4. **Deviation:** has either side been swept and closed back inside? Which side?
5. **MSB:** mark the last swing point before the deviation. Has price broken it?
6. **Zone:** mark the supply or demand at the deviation. Has price retested it (tap 3)?
7. **Name the setup and its stage** from section 5.
8. **Confluence:** Fibonacci level, RSI divergence and tap count at the zone.

### What constitutes a long

- A low deviation closed back inside the range.
- An MSB above the last swing high before the deviation.
- A retest of the demand at the deviation (tap 3), confirmed by a candle close back up.
- Invalidation below the deviation wick. Target the untapped range high.

### What constitutes a short

- A high deviation closed back inside the range.
- An MSB below the last swing low before the deviation.
- A retest of the supply at the deviation (tap 3), confirmed by a candle close back down.
- Invalidation above the deviation wick. Target the untapped range low.

### No setup

- Price chopping at the 0.5.
- A deviation with no MSB yet. Mark it and wait.
- Tools disagreeing, for example a weekly bias that points the opposite way with no reversal setup.

---

## Mapping onto OpenMarket

How each playbook element is drawn on an OpenMarket chart (MCP connector `Open Market`).

| Element | OpenMarket tool | Style |
|---|---|---|
| Range high / range low | `chart_drawing_add` HorizontalLine (labelled) | Solid |
| Mean (0.5) | `chart_drawing_add` HorizontalLine "0.5 mean" | Dashed |
| Last swing before the deviation (MSB level) | HorizontalLine "MSB level" | Dotted |
| Supply / demand at the deviation | Rectangle | Red for supply, green for demand |
| Fibonacci | FibonacciRetracement, swing to swing | Levels 0, 0.5, 0.618, 0.786, 1, 1.618 only |
| Weekly open | HorizontalLine "Weekly open" | Dashed |
| Trade plan | LongPosition / ShortPosition | Entry at zone, stop past deviation wick, target at untapped side |
| Stage label | Text / Note | e.g. "Bearish reversal, step 5: MSB done, waiting for supply retest" |
| Momentum | `chart_indicator_add` RSI(14) | Default |

Workflow notes:

- Read candles with `chart_read` (up to 300 bars from the user's open tab). For FX_OTC markets
  (XAU/USD, XAG/USD) `chart_drawing_auto`, `points` and alerts are not served, so compute swings
  from the `chart_read` bars and place drawings with `chart_drawing_add`.
- Weekly open: the open of the first 15m bar at or after the week start (Monday 00:00 UTC for
  crypto; FX weeks open Sunday ~22:00 UTC).
- Always report: setup name, stage, which confluence tools agree, and "no trade" with the reason
  when the checklist fails.
- Prefix every drawing label with "PB" so playbook drawings can be told apart and cleared.
