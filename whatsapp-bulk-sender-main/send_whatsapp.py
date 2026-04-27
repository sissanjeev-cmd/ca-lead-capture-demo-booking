"""
WhatsApp Bulk Message Sender — Desktop App Edition
===================================================
Uses the macOS WhatsApp desktop app (already logged in) to send
personalised messages one by one, fully automated.

How it works:
  1. Opens each contact's chat via whatsapp:// URL scheme with the
     message pre-filled in the input box.
  2. Activates WhatsApp via AppleScript and presses Return to send.
  3. No browser, no QR scan, no human intervention required.

Requirements:
    pip install pandas openpyxl python-docx

Usage:
    python send_whatsapp.py
"""

import re
import sys
import time
import logging
import subprocess
import urllib.parse

try:
    import pandas as pd
    from docx import Document
except ImportError as e:
    print(f"\n[ERROR] Missing library: {e}")
    print("Run:  pip install pandas openpyxl python-docx\n")
    sys.exit(1)

# ═══════════════════════ CONFIGURATION ═══════════════════════════════════════

EXCEL_FILE   = r"/Users/sanjeevgarg/My Projects/whatsapp-bulk-sender-main/CA Firms.xlsx"
WORD_FILE    = r"/Users/sanjeevgarg/My Projects/whatsapp-bulk-sender-main/Message Draft.docx"
LOG_FILE     = r"/Users/sanjeevgarg/My Projects/whatsapp-bulk-sender-main/whatsapp_send_log.txt"

COUNTRY_CODE   = "+91"   # India — change if needed (e.g. "+1" for USA)

# Seconds to wait after opening the chat before pressing Send.
# Increase if WhatsApp takes longer to load a chat on your machine.
CHAT_LOAD_WAIT = 5

# Set to True to preview messages without sending.
DRY_RUN = False

# ═════════════════════════════════════════════════════════════════════════════


def setup_logging(log_path: str) -> logging.Logger:
    logger = logging.getLogger("wa_desktop")
    logger.setLevel(logging.DEBUG)
    fmt = logging.Formatter("%(asctime)s  %(levelname)-8s  %(message)s",
                            datefmt="%Y-%m-%d %H:%M:%S")
    ch = logging.StreamHandler(sys.stdout)
    ch.setFormatter(fmt)
    logger.addHandler(ch)
    fh = logging.FileHandler(log_path, encoding="utf-8")
    fh.setFormatter(fmt)
    logger.addHandler(fh)
    return logger


def read_contacts(excel_path: str):
    """
    Returns:
        full_df   — complete DataFrame (all rows/columns) used for writing back
        contacts  — filtered rows (Phone_type=M) with original indices kept so
                    full_df.at[idx, ...] maps correctly after a successful send
    """
    full_df = pd.read_excel(excel_path, dtype=str)
    full_df.columns = full_df.columns.str.strip()

    required = {"first_name", "phone", "Phone_type", "Message Sent"}
    missing = required - set(full_df.columns)
    if missing:
        raise ValueError(f"Missing columns: {missing}. Found: {list(full_df.columns)}")

    contacts = full_df[full_df["Phone_type"].str.strip().str.upper() == "M"].copy()
    contacts = contacts[["first_name", "phone"]].rename(
        columns={"first_name": "Name", "phone": "Mobile"}
    )
    contacts.dropna(subset=["Mobile", "Name"], inplace=True)
    contacts["Mobile"] = contacts["Mobile"].str.strip()
    contacts["Name"]   = contacts["Name"].str.strip()
    # Do NOT reset_index — original indices must stay intact to map back to full_df
    return full_df, contacts


def mark_sent(full_df: pd.DataFrame, row_idx: int, excel_path: str) -> None:
    """Write 'Yes' into the 'Message Sent' cell and immediately save the file."""
    full_df.at[row_idx, "Message Sent"] = "Yes"
    full_df.to_excel(excel_path, index=False, engine="openpyxl")


def read_template(word_path: str) -> str:
    """Extract full text from a Word document, preserving paragraph breaks."""
    doc = Document(word_path)
    return "\n".join(p.text for p in doc.paragraphs)


def personalise(template: str, name: str) -> str:
    """Replace {{Name}} placeholder with the contact's first name."""
    return re.sub(r"\{\{\s*[Nn]ame\s*\}\}", name, template)


def format_number(raw: str, country_code: str) -> str:
    """Normalise number to E.164 format, e.g. '098109 02950' → '+919810902950'."""
    digits    = re.sub(r"\D", "", raw)
    cc_digits = re.sub(r"\D", "", country_code)
    if digits.startswith(cc_digits):
        return "+" + digits
    return country_code + digits


def send_via_desktop(phone: str, message: str, chat_load_wait: int) -> None:
    """
    Open the WhatsApp desktop chat for `phone` with `message` pre-filled,
    then use AppleScript to activate the app and press Return to send.
    """
    encoded = urllib.parse.quote(message)
    url = f"whatsapp://send?phone={phone}&text={encoded}"

    # Open the chat (launches WhatsApp if not already running)
    subprocess.run(["open", url], check=True)

    # Wait for WhatsApp to open the chat and render the input box
    time.sleep(chat_load_wait)

    # Activate WhatsApp and press the Return key (key code 36) to send
    script = (
        'tell application "WhatsApp" to activate\n'
        'delay 0.8\n'
        'tell application "System Events"\n'
        '    key code 36\n'
        'end tell'
    )
    result = subprocess.run(
        ["osascript", "-e", script],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        raise RuntimeError(f"AppleScript error: {result.stderr.strip()}")

    # Brief pause to let the message fully send before moving on
    time.sleep(2.0)


def main():
    logger = setup_logging(LOG_FILE)
    logger.info("=" * 60)
    logger.info("WhatsApp Desktop Sender — started")
    logger.info(f"Excel  : {EXCEL_FILE}")
    logger.info(f"Word   : {WORD_FILE}")
    logger.info(f"Dry run: {DRY_RUN}")
    logger.info("=" * 60)

    full_df, contacts = read_contacts(EXCEL_FILE)
    logger.info(f"Contacts with Phone_type=M: {len(contacts)}")

    template = read_template(WORD_FILE)
    logger.info(f"Template preview: {template[:80].strip()} …")

    if DRY_RUN:
        for idx, row in contacts.iterrows():
            phone = format_number(row["Mobile"], COUNTRY_CODE)
            msg   = personalise(template, row["Name"])
            logger.info(f"[{idx+1:>3}] DRY   {row['Name']:<30} | {phone}")
            logger.debug(f"        {msg[:120]} …")
        logger.info("Dry run complete.")
        return

    # Ensure WhatsApp desktop is running before the loop starts
    subprocess.run(["open", "-a", "WhatsApp"], capture_output=True)
    time.sleep(3)

    sent = 0; failed = 0; skipped = 0

    for idx, row in contacts.iterrows():
        name   = str(row["Name"]).strip()
        mobile = str(row["Mobile"]).strip()
        phone  = format_number(mobile, COUNTRY_CODE)

        if len(re.sub(r"\D", "", phone)) < 10:
            logger.warning(f"[{idx+1:>3}] SKIP  {name:<30} | invalid number: {mobile}")
            skipped += 1
            continue

        message = personalise(template, name)
        logger.info(f"[{idx+1:>3}] SEND  {name:<30} | {phone}")

        try:
            send_via_desktop(phone, message, CHAT_LOAD_WAIT)
            mark_sent(full_df, idx, EXCEL_FILE)
            logger.info(f"       ✓ Sent  (Message Sent = Yes)")
            sent += 1
        except Exception as e:
            logger.error(f"       ✗ Failed: {e}")
            failed += 1

    logger.info("=" * 60)
    logger.info(f"DONE — Sent: {sent}  |  Failed: {failed}  |  Skipped: {skipped}")
    logger.info(f"Log saved to: {LOG_FILE}")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
