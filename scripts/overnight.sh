#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# ProjectFlow — overnight auto-continue build loop.
#
# Repeatedly runs Claude Code in headless mode to keep building the next phase
# from NEXT_STEPS.md. When usage limits are hit, `claude` exits; the loop waits
# and retries, so after the token reset it resumes on its own.
#
# HONEST CAVEATS (read before trusting it overnight):
#   * It uses YOUR subscription tokens each iteration.
#   * `--dangerously-skip-permissions` lets it run tools without asking. Only
#     run this in a repo you trust (this one). It CAN run git, npm, write files.
#   * Unattended AI may make mistakes. REVIEW the diff/commits in the morning
#     before deploying. It is not guaranteed to finish everything perfectly.
#   * Stop anytime: Ctrl-C, or `touch STOP.flag` in this folder.
#
# Usage:  bash scripts/overnight.sh
# ---------------------------------------------------------------------------
set -u
cd "$(dirname "$0")/.." || exit 1

LOG="overnight.log"
PROMPT='Kamu melanjutkan pembangunan ProjectFlow. Baca NEXT_STEPS.md, PRD.MD, DESIGN.MD. Kerjakan SATU fase berikutnya yang belum selesai di NEXT_STEPS.md, ikuti persis pola kode yang sudah ada (server actions, forms, list pattern, design tokens). Setelah fase selesai: jalankan `npm run typecheck` dan `npm run build`; jika lolos, `git add -A && git commit`; lalu perbarui checklist di NEXT_STEPS.md. Jika SEMUA fase sudah selesai dan build sukses, buat file DONE.flag dan berhenti. Jangan tanya konfirmasi; ambil keputusan default yang wajar.'

echo "=== overnight loop started $(date) ===" | tee -a "$LOG"

while true; do
  if [ -f DONE.flag ]; then
    echo "[$(date)] DONE.flag found — all phases reported complete. Stopping." | tee -a "$LOG"
    break
  fi
  if [ -f STOP.flag ]; then
    echo "[$(date)] STOP.flag found — stopping by request." | tee -a "$LOG"
    break
  fi

  echo "[$(date)] --- starting claude iteration ---" | tee -a "$LOG"
  start=$(date +%s)

  # Resume the same conversation context each time (--continue).
  claude -p "$PROMPT" --continue --dangerously-skip-permissions >>"$LOG" 2>&1
  code=$?

  end=$(date +%s)
  elapsed=$((end - start))
  echo "[$(date)] iteration exit=$code elapsed=${elapsed}s" | tee -a "$LOG"

  # Quick exit (<45s) almost always means a usage limit / error — back off
  # long enough to cross the reset window, then retry. Otherwise short pause.
  if [ "$elapsed" -lt 45 ]; then
    echo "[$(date)] likely rate/usage limit — sleeping 10m before retry." | tee -a "$LOG"
    sleep 600
  else
    sleep 20
  fi
done

echo "=== overnight loop ended $(date) ===" | tee -a "$LOG"
