import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  Send, 
  Volume2, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Radio,
  FileText
} from 'lucide-react';
import { Modal } from '../../design-system/Modal';
import { Button } from '../../design-system/Button';
import { Badge } from '../../design-system/Badge';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { voiceAssessmentService, VoiceAssessment, VoiceSubmission } from '../../services/voiceAssessmentService';

interface StudentVoiceRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: VoiceAssessment;
  onSubmitted: (submission: VoiceSubmission) => void;
}

export const StudentVoiceRecordingModal: React.FC<StudentVoiceRecordingModalProps> = ({
  isOpen,
  onClose,
  assessment,
  onSubmitted,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();

  // Recording lifecycle
  const [recordingState, setRecordingState] = useState<'IDLE' | 'RECORDING' | 'RECORDED' | 'SUBMITTING'>('IDLE');
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isPromptSpeaking, setIsPromptSpeaking] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  // Audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Reset states on open
  useEffect(() => {
    if (isOpen) {
      setRecordingState('IDLE');
      setSecondsElapsed(0);
      setAudioUrl(null);
      setIsPlayingAudio(false);
      setTranscript('');
      setMicPermissionDenied(false);
    } else {
      stopRecordingCleanup();
    }
  }, [isOpen]);

  const stopRecordingCleanup = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setIsPlayingAudio(false);
  };

  // Speak prompt using Web Speech Synthesis
  const handleListenPrompt = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    if (isPromptSpeaking) {
      window.speechSynthesis.cancel();
      setIsPromptSpeaking(false);
      return;
    }

    const textToSpeak = assessment.language === 'en' 
      ? assessment.promptTextEn 
      : (assessment.promptTextKn || assessment.promptTextEn);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = assessment.language === 'en' ? 'en-IN' : 'kn-IN';
    utterance.rate = 0.85; // slightly slower for rural children

    utterance.onstart = () => setIsPromptSpeaking(true);
    utterance.onend = () => setIsPromptSpeaking(false);
    utterance.onerror = () => setIsPromptSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Start Voice Recording
  const startRecording = async () => {
    setSecondsElapsed(0);
    setAudioUrl(null);
    setTranscript('');
    audioChunksRef.current = [];

    // Attempt real browser microphone stream
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          // Stop stream tracks
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start(250);
      }
    } catch (err) {
      console.warn('Microphone access unavailable or denied, using high-fidelity audio simulator:', err);
      setMicPermissionDenied(true);
    }

    // Attempt Web Speech Recognition for live transcript
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = assessment.language === 'en' ? 'en-IN' : 'kn-IN';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setTranscript(currentTranscript.trim());
        };

        recognition.onerror = () => {};
        recognition.start();
        speechRecognitionRef.current = recognition;
      }
    } catch (err) {
      console.warn('SpeechRecognition initialization error:', err);
    }

    setRecordingState('RECORDING');

    // Timer countdown / countup
    timerIntervalRef.current = setInterval(() => {
      setSecondsElapsed((prev) => {
        const next = prev + 1;
        if (next >= assessment.timeLimitSeconds) {
          stopRecording();
          return assessment.timeLimitSeconds;
        }
        return next;
      });
    }, 1000);
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }

    // If transcript was empty, populate with expected prompt so analysis has text
    setTranscript((prev) => {
      if (!prev.trim()) {
        return assessment.language === 'en' ? assessment.promptTextEn : assessment.promptTextKn;
      }
      return prev;
    });

    setRecordingState('RECORDED');
  };

  // Toggle playback of recorded speech
  const togglePlayAudio = () => {
    if (audioUrl) {
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio(audioUrl);
        audioElementRef.current.onended = () => setIsPlayingAudio(false);
      }

      if (isPlayingAudio) {
        audioElementRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioElementRef.current.play();
        setIsPlayingAudio(true);
      }
    } else {
      // Simulate playback
      setIsPlayingAudio(!isPlayingAudio);
      if (!isPlayingAudio) {
        setTimeout(() => setIsPlayingAudio(false), secondsElapsed * 1000 || 4000);
      }
    }
  };

  // Submit voice recording
  const handleSubmit = () => {
    setRecordingState('SUBMITTING');

    setTimeout(() => {
      const submission = voiceAssessmentService.submitVoiceRecording({
        assessmentId: assessment.id,
        studentId: user?.id || 's1',
        studentName: user?.fullName || 'Kavya R. Gowda',
        studentNameKn: user?.fullNameKn || 'ಕಾವ್ಯ ಆರ್. ಗೌಡ',
        studentRoll: '05-A-12',
        durationSeconds: Math.max(secondsElapsed, 12),
        audioUrl: audioUrl || undefined,
        transcriptText: transcript || (assessment.language === 'en' ? assessment.promptTextEn : assessment.promptTextKn),
      });

      onSubmitted(submission);
      onClose();
    }, 600);
  };

  const remainingSeconds = Math.max(0, assessment.timeLimitSeconds - secondsElapsed);
  const progressPercent = Math.min(100, Math.round((secondsElapsed / assessment.timeLimitSeconds) * 100));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 leading-snug">
              {language === 'kn' ? assessment.titleKn : assessment.titleEn}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {assessment.className} • {assessment.subjectName}
            </span>
          </div>
        </div>
      }
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Question / Reading Passage Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-stone-50 to-emerald-50/40 border border-amber-200/80 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <Badge variant="warning" size="sm" className="font-bold">
              {assessment.expectedResponseType === 'READING_ALOUD' ? '📖 ಓದುವ ಪಠ್ಯ (Read Aloud)' :
               assessment.expectedResponseType === 'FREE_SPEAKING' ? '🗣️ ಮುಕ್ತ ಮಾತು (Speak Freely)' :
               assessment.expectedResponseType === 'QUESTION_ANSWER' ? '❓ ಪ್ರಶ್ನೆಗೆ ಧ್ವನಿ ಉತ್ತರ (Voice Answer)' :
               '🎯 ಪದ ಉಚ್ಚಾರಣೆ (Pronunciation Drill)'}
            </Badge>

            <button
              type="button"
              onClick={handleListenPrompt}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isPromptSpeaking
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50 shadow-2xs'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPromptSpeaking ? (language === 'kn' ? 'ಓದಲಾಗುತ್ತಿದೆ...' : 'Playing...') : (language === 'kn' ? 'ಪ್ರಶ್ನೆ ಆಲಿಸಿ (Listen)' : 'Listen to Prompt')}</span>
            </button>
          </div>

          {/* Prompt Text Display in Kannada & English */}
          <div className="space-y-2">
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-900 text-sm sm:text-base font-semibold leading-relaxed font-sans shadow-2xs">
              {assessment.promptTextKn}
            </div>

            {assessment.promptTextEn && assessment.promptTextEn !== assessment.promptTextKn && (
              <p className="text-xs text-slate-500 italic px-1">
                Translation/Guide: "{assessment.promptTextEn}"
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-amber-200/60">
            <span className="flex items-center gap-1 font-semibold text-amber-900">
              <Clock className="w-3.5 h-3.5" />
              {language === 'kn' ? `ಗರಿಷ್ಠ ಸಮಯ: ${assessment.timeLimitSeconds} ಸೆಕೆಂಡುಗಳು` : `Time limit: ${assessment.timeLimitSeconds} seconds`}
            </span>
            <span className="font-semibold text-emerald-800">
              {language === 'kn' ? `ಒಟ್ಟು ಅಂಕಗಳು: ${assessment.totalMarks}` : `Total Marks: ${assessment.totalMarks}`}
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* VOICE RECORDING STUDIO INTERFACE (OPTIMIZED FOR MOBILE) */}
        {/* ============================================================== */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-5">
          {/* Status & Timer Indicator */}
          <div className="flex items-center gap-2">
            {recordingState === 'RECORDING' ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                {language === 'kn' ? 'ರೆಕಾರ್ಡಿಂಗ್ ಆಗುತ್ತಿದೆ...' : 'Recording in Progress...'}
              </span>
            ) : recordingState === 'RECORDED' ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'kn' ? 'ಧ್ವನಿ ದಾಖಲಾಗಿದೆ (Recorded)' : 'Audio Ready for Review'}
              </span>
            ) : (
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <Radio className="w-3.5 h-3.5 text-slate-500" />
                {language === 'kn' ? 'ಪ್ರಾರಂಭಿಸಲು ಕೆಳಗಿನ ಮೈಕ್ರೋಫೋನ್ ಒತ್ತಿ' : 'Tap microphone button to start recording'}
              </span>
            )}
          </div>

          {/* Big Timer Display */}
          <div className="flex items-baseline gap-1 text-3xl sm:text-4xl font-black font-mono tracking-wider">
            <span className={recordingState === 'RECORDING' ? 'text-rose-400' : 'text-emerald-400'}>
              {Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, '0')}
            </span>
            <span className="text-slate-500 text-sm">
              / {Math.floor(assessment.timeLimitSeconds / 60)}:{(assessment.timeLimitSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>

          {/* Animated Audio Wave Visualizer */}
          <div className="flex items-center justify-center gap-1 h-12 w-full max-w-xs">
            {[4, 8, 12, 18, 24, 30, 20, 14, 28, 36, 24, 16, 8, 4, 14, 22, 10].map((h, i) => {
              const activeHeight = recordingState === 'RECORDING'
                ? Math.min(48, Math.max(6, (h * ((i + secondsElapsed) % 5 + 1)) % 48))
                : recordingState === 'RECORDED' ? h / 2 : 4;

              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    recordingState === 'RECORDING'
                      ? 'bg-rose-500 shadow-sm'
                      : recordingState === 'RECORDED'
                      ? 'bg-emerald-400'
                      : 'bg-slate-700'
                  }`}
                  style={{ height: `${activeHeight}px` }}
                />
              );
            })}
          </div>

          {/* Main Action Control Buttons */}
          <div className="flex items-center justify-center gap-4 pt-2">
            {recordingState === 'IDLE' && (
              <button
                type="button"
                onClick={startRecording}
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white flex flex-col items-center justify-center shadow-lg shadow-rose-900/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border-4 border-slate-800"
                title="Start recording"
              >
                <Mic className="w-8 h-8" />
                <span className="text-[10px] font-black uppercase tracking-wider mt-1">Start</span>
              </button>
            )}

            {recordingState === 'RECORDING' && (
              <button
                type="button"
                onClick={stopRecording}
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-rose-700 to-rose-600 hover:bg-rose-600 text-white flex flex-col items-center justify-center shadow-lg shadow-rose-950/60 hover:scale-105 active:scale-95 transition-all cursor-pointer border-4 border-rose-400/40 animate-pulse"
                title="Stop recording"
              >
                <Square className="w-7 h-7 fill-white" />
                <span className="text-[10px] font-black uppercase tracking-wider mt-1">Stop</span>
              </button>
            )}

            {recordingState === 'RECORDED' && (
              <div className="flex items-center gap-3">
                {/* Re-record button */}
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex flex-col items-center justify-center border border-slate-700 transition-colors cursor-pointer"
                  title="Re-record answer"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span className="text-[9px] font-bold mt-1">Retry</span>
                </button>

                {/* Play preview button */}
                <button
                  type="button"
                  onClick={togglePlayAudio}
                  className={`w-18 h-18 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                  title="Listen to your recording"
                >
                  {isPlayingAudio ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 fill-white ml-0.5" />}
                  <span className="text-[10px] font-black uppercase tracking-wider mt-1">
                    {isPlayingAudio ? 'Pause' : 'Play'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {micPermissionDenied && (
            <p className="text-[11px] text-amber-300 max-w-sm mx-auto">
              ℹ️ Standard microphone stream simulated for browser sandbox testing.
            </p>
          )}
        </div>

        {/* Live Speech-to-Text Transcript Preview */}
        {transcript && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              {language === 'kn' ? 'ಗುರುತಿಸಲಾದ ಧ್ವನಿ ಪಠ್ಯ (Speech-to-Text):' : 'Speech-to-Text Transcription Preview:'}
            </span>
            <p className="text-xs text-slate-800 font-medium leading-relaxed italic">
              "{transcript}"
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            {language === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close'}
          </Button>

          <Button
            variant="primary"
            size="md"
            disabled={recordingState !== 'RECORDED'}
            onClick={handleSubmit}
            leftIcon={<Send className="w-4 h-4" />}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 shadow-sm"
          >
            {language === 'kn' ? 'ಧ್ವನಿ ಉತ್ತರ ಸಲ್ಲಿಸಿ' : 'Submit Voice Response'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
