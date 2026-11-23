# Next Agent Task

Security work landed — see `docs/SECURITY.md` for what was fixed and which
operator steps are still required (key rotation, admin custom claim, index
deploy).

Remaining, in priority order:

1. **Move Bhashini credentials server-side.** They are still read from
   `localStorage` and sent from the browser. Add a `/api/bhashini` proxy like
   `/api/gemini` so a per-user ULCA key is not exposed to the page.
2. **Persist a per-user key without long-lived storage.** Consider server-side
   session storage or Firebase Auth-scoped storage instead of `sessionStorage`,
   so a key survives a page reload but not a shared device.
3. **Back the rate limiter with a shared store** (Redis) if the app runs on more
   than one instance; the current limiter is in-memory per process.
4. **Add Firestore emulator tests** for `firestore.rules` (`@firebase/rules-unit-testing`):
   owner-only reads, spoofed `contributed_by`, future timestamps, oversize fields.
5. **Split `src/App.tsx`** (still ~3.2k lines): extract translation, TTS, STT and
   upload logic into hooks so the security-critical paths are reviewable.
6. **Linguistic data fixes** (still open from the review): 12 of 19
   NCERT sentences have corrupted Devanagari combining marks, the Santali
   romanization in `parseTextOrMarkdownContent` is a copy of the Devanagari
   text, and `transliterateDevaToRoman` omits `ई ऊ ऐ औ ऋ`.
7. **TTS/validator regexes** still use `\b`, which never matches Devanagari.
   Replace with explicit whitespace/punctuation lookarounds.
