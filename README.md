# Prime Numbers — Chrome extension

Popup: primes in a custom range, a password generator, and a **Who am I?** tab with selected `navigator` fields. Everything stays on your device.

## Why prime numbers still matter in day-to-day work

The prime list here is a **small helper** (pick a "non-round" interval, sanity-check a range, sanity-check a schedule). Below are **real classes of problems** where periods that **do not align cleanly** with "round" minutes or seconds (including values **close to primes** or **coprime with** 60, 300, 600) **overlap less often in phase** and help **spread load spikes**.

To be fair: in production people more often use **random jitter** on an interval or TTL. Choosing something like 7 minutes or 307 seconds is a **deliberate variant of the same idea** (stagger phases), not a drop-in replacement for jitter as the default approach.

### Schedulers: cron, systemd timers, Kubernetes CronJob

Teams may use e.g. `*/7` vs `*/5` so jobs do not all sit on the same phase of a "round" grid: rhythm alignment is tied to the **least common multiple** of periods, and breaking lockstep with neighbours is easier when periods are **not all divisors of one shared base** (in large orgs this is often **manual schedule hygiene**).

### Agent polling: monitoring, metrics, health checks

Internal guides sometimes ask for intervals **not divisible by 60 seconds**, so agents on the same host **do not wake up in lockstep** with other services and hammer CPU or a metrics endpoint together.

### Cache TTL and background jobs

TTLs like **47 s** or **307 s** instead of exactly **300 s** spread invalidation times across instances. The same goal is often met with **random jitter** on a base TTL — easier to operate; a "non-round" or near-prime second count is a **conscious choice in the same problem class** when you do not want RNG in config or need a stable period without drift.
