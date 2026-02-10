# Educational Video Integration Guide

## Overview

Educational videos have been successfully integrated into all training scenarios. Each scenario now displays a video tutorial during the briefing phase to help users learn proper procedures before attempting the scenario.

## What Was Changed

### 1. Type Definition (`lib/training/types.ts`)
- Added optional `videoUrl` field to the `TrainingScenario` interface
- Supports YouTube, Vimeo, or direct video file URLs

### 2. Briefing Component (`components/ScenarioBriefing.tsx`)
- Added video player section that displays before the mission briefing
- Automatic URL conversion for YouTube and Vimeo embeds
- Responsive 16:9 aspect ratio video player
- Only displays when `videoUrl` is provided

### 3. All Scenario Files Updated
All 8 scenario files now include a `videoUrl` field with placeholder URLs:
- `lib/training/scenarios/intro-controls.ts` - Reactor controls introduction
- `lib/training/scenarios/reactivity-basics.ts` - Reactivity fundamentals
- `lib/training/scenarios/coolant-system.ts` - Primary coolant system
- `lib/training/scenarios/startup.ts` - Reactor startup procedures
- `lib/training/scenarios/power-maneuvering.ts` - Power level changes
- `lib/training/scenarios/pump-trip.ts` - Pump trip emergency response
- `lib/training/scenarios/feedwater-loss.ts` - Feedwater loss response
- `lib/training/scenarios/loca.ts` - LOCA emergency procedures

## Adding Your Own Videos

### YouTube Videos
Replace the placeholder URL with your YouTube video URL:
```typescript
videoUrl: 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID'
// or
videoUrl: 'https://youtu.be/YOUR_VIDEO_ID'
```

### Vimeo Videos
```typescript
videoUrl: 'https://vimeo.com/YOUR_VIDEO_ID'
```

### Direct Video Files
```typescript
videoUrl: '/videos/reactor-startup-tutorial.mp4'
```
(Place video files in the `public/videos/` directory)

## Suggested Video Content for Each Scenario

### 1. Introduction to Reactor Controls (Difficulty 1)
**Topics to cover:**
- Basic control panel overview
- How to read reactor instruments
- Control rod operation basics
- Safety features overview

### 2. Understanding Reactivity (Difficulty 1)
**Topics to cover:**
- What is reactivity?
- Positive vs. negative reactivity
- Critical, subcritical, supercritical states
- How reactivity affects power

### 3. Coolant System Fundamentals (Difficulty 2)
**Topics to cover:**
- Primary coolant loop function
- Heat transfer principles
- Temperature feedback effects
- Coolant pump operation

### 4. Normal Startup from Cold Shutdown (Difficulty 2)
**Topics to cover:**
- Pre-startup checklist
- Approach to criticality procedure
- Rod withdrawal rates and limits
- Monitoring parameters during startup

### 5. Power Level Maneuvering (Difficulty 2)
**Topics to cover:**
- Proper rod movement techniques
- Managing reactivity feedback
- Achieving stable power levels
- Common mistakes to avoid

### 6. Loss of Primary Coolant Pump (Difficulty 3)
**Topics to cover:**
- Recognizing pump trip indicators
- Immediate response actions
- When to initiate SCRAM
- Post-trip cooldown procedures

### 7. Loss of Feedwater Event (Difficulty 3)
**Topics to cover:**
- Understanding feedwater's role
- Emergency power reduction techniques
- Alternative cooling methods
- Preventing secondary damage

### 8. Loss of Coolant Accident (LOCA) (Difficulty 4)
**Topics to cover:**
- LOCA recognition and classification
- Emergency Core Cooling System (ECCS)
- SCRAM procedures under accident conditions
- Preventing core damage

## Video Creation Tips

1. **Keep videos short** - 5-10 minutes per scenario is ideal
2. **Use screen recordings** - Show the simulator interface with narration
3. **Focus on key points** - Cover objectives and common mistakes
4. **Add captions** - Make videos accessible
5. **Update regularly** - Keep content current as scenarios change

## Testing Your Videos

1. Add your video URL to a scenario file
2. Run `npm run dev` to start the development server
3. Navigate to `/train` route
4. Select the scenario with your video
5. Verify the video displays correctly in the briefing screen

## Removing Videos

To remove a video from a scenario, simply delete the `videoUrl` line from the scenario file. The briefing will automatically hide the video section.

## Future Enhancements

Consider adding:
- Multiple videos per scenario (intro, advanced tips, common mistakes)
- Video progress tracking
- Quiz questions integrated with videos
- Downloadable video transcripts
- Video playback controls (speed, quality)
- Completion certificates requiring video viewing
