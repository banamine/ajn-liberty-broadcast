import re
with open("src/hooks/useAudioController.ts", "r") as f:
    content = f.read()

# Add console.trace to stopSiriusMusic
old_stop = """  const stopSiriusMusic = useCallback(() => {
    if (siriusAudioRef.current) {
      siriusAudioRef.current.pause();
    }
    setIsSiriusPlaying(false);
    addLog("Synthesizer console paused.");
  }, [addLog]);"""

new_stop = """  const stopSiriusMusic = useCallback(() => {
    console.trace("stopSiriusMusic called");
    if (siriusAudioRef.current) {
      siriusAudioRef.current.pause();
    }
    setIsSiriusPlaying(false);
    addLog("Synthesizer console paused.");
  }, [addLog]);"""

content = content.replace(old_stop, new_stop)

with open("src/hooks/useAudioController.ts", "w") as f:
    f.write(content)
