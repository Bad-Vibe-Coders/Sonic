# 14 · Speaker Diarization

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `14`

## Purpose

Speaker diarization.

## Description

Determines 'who spoke when' and labels transcript segments by speaker (agent vs customer vs IVR).

## Diagram

![Speaker Diarization](../../assets/img/02_AI_Pipeline/14_Speaker_Diarization.png)

## Inputs

- Audio frames
- Transcript timing

## Outputs

- Speaker-labelled segments

## Dependencies

- Diarization/embedding model

## Business Value

Enables per-speaker emotion, talk-ratio and compliance checks.

## Technical Notes

Consumes channel-split output from audio processing (12).

## Related Diagrams

- [12 · Audio Processing](../02_AI_Pipeline/12_Audio_Processing.md)
- [13 · Speech Recognition](../02_AI_Pipeline/13_Speech_Recognition.md)
- [15 · Emotion Recognition](../02_AI_Pipeline/15_Emotion_Recognition.md)

---

### Navigation

⬅ Previous: [13 · Speech Recognition](../02_AI_Pipeline/13_Speech_Recognition.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [15 · Emotion Recognition](../02_AI_Pipeline/15_Emotion_Recognition.md)
