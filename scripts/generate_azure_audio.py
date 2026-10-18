"""Pre-generate Stage 1 Cantonese MP3s. Requires AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.
No credentials enter Next.js or the browser. This command makes billable Azure TTS calls.
"""
import json
import os
from pathlib import Path
import re
import ssl
import tempfile
import urllib.error
import urllib.request
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]

def main():
    key = os.environ.get("AZURE_SPEECH_KEY", "")
    region = os.environ.get("AZURE_SPEECH_REGION", "")
    voice = os.environ.get("AZURE_SPEECH_VOICE", "zh-HK-HiuGaaiNeural")
    if not key or not re.fullmatch(r"[a-z0-9-]+", region):
        raise SystemExit("Set AZURE_SPEECH_KEY and a valid AZURE_SPEECH_REGION in the local run environment.")
    if voice not in {"zh-HK-HiuGaaiNeural", "zh-HK-HiuMaanNeural", "zh-HK-WanLungNeural"}:
        raise SystemExit("Choose a supported zh-HK neural voice.")
    ca_file = "/etc/ssl/cert.pem" if Path("/etc/ssl/cert.pem").exists() else None
    context = ssl.create_default_context(cafile=ca_file)
    data_path = ROOT / "app/data/proverbs.json"
    items = json.loads(data_path.read_text())
    output = ROOT / "public/audio/proverbs"
    output.mkdir(parents=True, exist_ok=True)
    # Stage every response first so a failed network request cannot partially switch the catalog.
    with tempfile.TemporaryDirectory() as tmp:
        staged = []
        for item in items:
            name = Path(item["audio"]).stem + ".mp3"
            ssml = f'<speak version="1.0" xml:lang="zh-HK"><voice name="{voice}">{escape(item["cantonese"])}</voice></speak>'
            request = urllib.request.Request(
                f"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1",
                data=ssml.encode(), headers={"Ocp-Apim-Subscription-Key": key,
                "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
                "User-Agent": "VibeCheckHK-Stage1"}, method="POST")
            try:
                with urllib.request.urlopen(request, timeout=30, context=context) as response:
                    payload = response.read()
                    if not response.headers.get("Content-Type", "").lower().startswith("audio/") or len(payload) < 100:
                        raise SystemExit("Azure did not return valid audio. Original demo audio is unchanged.")
            except urllib.error.HTTPError as error:
                raise SystemExit(f"Azure HTTP {error.code}: check credentials, region, quota and voice. Demo unchanged.") from None
            except (urllib.error.URLError, TimeoutError):
                raise SystemExit("Azure connection failed. Demo unchanged; check network and trusted CA certificates.") from None
            temp = Path(tmp) / name
            temp.write_bytes(payload)
            staged.append((temp, output / name))
            item["audio"] = "/audio/proverbs/" + name
            print("Prepared", item["proverbId"], flush=True)
        for source, dest in staged:
            dest.write_bytes(source.read_bytes())
        data_path.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n")
        (output / "source.json").write_text(json.dumps({"provider": "Azure Speech", "voice": voice, "locale": "zh-HK"}, indent=2) + "\n")
    print("Generated all 10 Azure clips. Restart dev server or rebuild for production.")

if __name__ == "__main__":
    main()
