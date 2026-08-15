import os
from app.providers.speech_to_text import SpeechToTextProvider
from app.providers.translation import TranslationProvider

class DubbingEngine:
    """
    Orchestrates generic Multilingual Video Dubbing Pipeline:
    Extract Audio -> STT Transcript -> Translate (Hindi -> Bangla) -> TTS -> Remux
    """

    def __init__(self):
        self.stt_provider = SpeechToTextProvider()
        self.translation_provider = TranslationProvider()

    def process_video_dubbing(self, video_path: str, source_lang: str, target_lang: str):
        print(f"[DubbingEngine] Processing dubbing pipeline: {source_lang} -> {target_lang}")

        # Step 1: Transcribe audio to source text segments
        raw_transcripts = self.stt_provider.transcribe(video_path, source_lang)
        print(f"[DubbingEngine] Transcribed {len(raw_transcripts)} source segments ({source_lang}).")

        # Step 2: Translate each segment into target language (e.g. Hindi -> Bangla)
        translated_segments = []
        for segment in raw_transcripts:
            translated_text = self.translation_provider.translate(
                segment["text"], source_lang=source_lang, target_lang=target_lang
            )
            translated_segments.append({
                "sequence": segment["sequence"],
                "start_time": segment["start_time"],
                "end_time": segment["end_time"],
                "source_text": segment["text"],
                "translated_text": translated_text,
            })
            print(f"  [{source_lang}]: {segment['text']}  ===>  [{target_lang}]: {translated_text}")

        return {
            "status": "success",
            "source_language": source_lang,
            "target_language": target_lang,
            "transcripts": raw_transcripts,
            "translated_segments": translated_segments,
        }

if __name__ == "__main__":
    engine = DubbingEngine()
    result = engine.process_video_dubbing("sample.mp4", "hi", "bn")
    print("Dubbing Result:", result)
