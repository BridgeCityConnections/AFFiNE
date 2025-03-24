export interface TranscriptionResult {
  summary: string;
  segments: {
    speaker: string;
    start: string;
    end: string;
    transcription: string;
  }[];
}
