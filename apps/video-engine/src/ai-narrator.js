// 🎙️ WIRED CHAOS - AI Narrator System
// Text-to-speech generation with persona support

/**
 * AIeNarrator - Generates AI voice narration for videos
 * Supports multiple personas matching user types
 */
export class AIeNarrator {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.TTS_API_KEY;
    this.provider = config.provider || 'elevenlabs'; // elevenlabs, openai, google
    this.voiceLibrary = this.initializeVoiceLibrary();
  }

  /**
   * Initialize voice library with persona mappings
   */
  initializeVoiceLibrary() {
    return {
      builder: {
        name: 'Cyber Builder',
        description: 'Technical, confident, implementation-focused',
        voice_id: 'builder_voice_001',
        characteristics: {
          tone: 'professional',
          pace: 'moderate',
          emotion: 'enthusiastic',
          pitch: 'medium',
          style: 'technical'
        }
      },
      analyst: {
        name: 'Data Analyst',
        description: 'Analytical, data-driven, precise',
        voice_id: 'analyst_voice_001',
        characteristics: {
          tone: 'analytical',
          pace: 'deliberate',
          emotion: 'neutral',
          pitch: 'medium-low',
          style: 'informative'
        }
      },
      trader: {
        name: 'Market Trader',
        description: 'Strategic, market-focused, dynamic',
        voice_id: 'trader_voice_001',
        characteristics: {
          tone: 'energetic',
          pace: 'fast',
          emotion: 'confident',
          pitch: 'medium-high',
          style: 'persuasive'
        }
      },
      security: {
        name: 'Security Expert',
        description: 'Cautious, security-focused, authoritative',
        voice_id: 'security_voice_001',
        characteristics: {
          tone: 'serious',
          pace: 'slow',
          emotion: 'cautious',
          pitch: 'low',
          style: 'authoritative'
        }
      },
      custom: {
        name: 'Default Narrator',
        description: 'Neutral, clear, educational',
        voice_id: 'default_voice_001',
        characteristics: {
          tone: 'neutral',
          pace: 'moderate',
          emotion: 'friendly',
          pitch: 'medium',
          style: 'educational'
        }
      }
    };
  }

  /**
   * Generate narration for script
   * @param {Object} script - Video script with sections
   * @param {string} persona - Narrator persona
   * @returns {Promise<Object>} Generated narration files
   */
  async generateNarration(script, persona = 'custom') {
    try {
      const voice = this.voiceLibrary[persona] || this.voiceLibrary.custom;
      const narrationFiles = [];

      for (const section of script.sections) {
        const audio = await this.synthesizeSpeech(
          section.narration,
          voice,
          section.duration
        );

        narrationFiles.push({
          sectionId: section.slideId,
          audioFile: audio.file,
          duration: audio.duration,
          transcript: section.narration,
          voice: voice.name,
          characteristics: voice.characteristics
        });
      }

      return {
        success: true,
        persona,
        voice: voice.name,
        files: narrationFiles,
        totalDuration: narrationFiles.reduce((sum, f) => sum + f.duration, 0)
      };
    } catch (error) {
      console.error('Narration generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Synthesize speech from text
   */
  async synthesizeSpeech(text, voice, targetDuration) {
    // Mock implementation - in production, this would call TTS API
    // Adjust speech rate to match target duration
    const wordCount = text.split(' ').length;
    const wordsPerMinute = Math.round((wordCount / targetDuration) * 60);
    
    return {
      file: `/generated/narration_${voice.voice_id}_${Date.now()}.mp3`,
      duration: targetDuration,
      settings: {
        voice_id: voice.voice_id,
        model: 'multilingual',
        stability: 0.5,
        similarity_boost: 0.75,
        speaking_rate: wordsPerMinute / 150, // normalized to 150 wpm baseline
        pitch: voice.characteristics.pitch,
        emotion: voice.characteristics.emotion
      }
    };
  }

  /**
   * Get available voices
   */
  getAvailableVoices() {
    return Object.entries(this.voiceLibrary).map(([key, voice]) => ({
      id: key,
      name: voice.name,
      description: voice.description,
      characteristics: voice.characteristics
    }));
  }

  /**
   * Preview voice with sample text
   */
  async previewVoice(persona, sampleText = 'Welcome to WIRED CHAOS. Let\'s build the future together.') {
    const voice = this.voiceLibrary[persona];
    if (!voice) {
      throw new Error(`Voice persona '${persona}' not found`);
    }

    return await this.synthesizeSpeech(sampleText, voice, 5);
  }

  /**
   * Adjust narration timing to match video
   */
  adjustTiming(narrationFiles, targetDurations) {
    return narrationFiles.map((file, index) => {
      const targetDuration = targetDurations[index];
      const speedMultiplier = file.duration / targetDuration;

      return {
        ...file,
        adjustedSpeed: speedMultiplier,
        adjustedDuration: targetDuration
      };
    });
  }

  /**
   * Add emotion markers to narration
   */
  addEmotionMarkers(text, emotions = []) {
    // Add SSML-style emotion markers for advanced TTS
    let markedText = text;
    
    emotions.forEach(({ position, emotion, intensity }) => {
      const marker = `<emotion name="${emotion}" intensity="${intensity}">`;
      markedText = markedText.slice(0, position) + marker + markedText.slice(position);
    });

    return markedText;
  }

  /**
   * Add pauses for emphasis
   */
  addPauses(text, pausePositions = []) {
    let pausedText = text;
    
    pausePositions.forEach(({ position, duration }) => {
      const pause = `<break time="${duration}ms"/>`;
      pausedText = pausedText.slice(0, position) + pause + pausedText.slice(position);
    });

    return pausedText;
  }

  /**
   * Batch generate narration for multiple scripts
   */
  async batchGenerate(scripts, persona = 'custom') {
    const results = [];

    for (const script of scripts) {
      const result = await this.generateNarration(script, persona);
      results.push({
        scriptId: script.id || script.title,
        ...result
      });
    }

    return {
      total: scripts.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }
}

export default AIeNarrator;
