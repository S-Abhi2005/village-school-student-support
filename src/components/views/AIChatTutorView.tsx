import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../design-system/Card';
import { Button } from '../../design-system/Button';
import { Badge } from '../../design-system/Badge';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  askVillageTutor, 
  ChatLanguageMode, 
  ChatHistoryEntry 
} from '../../services/geminiTutorService';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Mic, 
  MicOff, 
  Trash2, 
  History, 
  RotateCcw, 
  BookOpen, 
  Calculator, 
  Leaf, 
  Award, 
  Clock, 
  Check, 
  ChevronRight, 
  X, 
  Plus, 
  HelpCircle,
  Loader2,
  Languages
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  languageMode: ChatLanguageMode;
  timestamp: string;
  isVoiceAudioAvailable?: boolean;
}

interface SavedSession {
  id: string;
  title: string;
  languageMode: ChatLanguageMode;
  timestamp: string;
  messages: ChatMessage[];
}

export const AIChatTutorView: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  // Language mode: 'kn' | 'en' | 'bilingual'
  const [languageMode, setLanguageMode] = useState<ChatLanguageMode>('kn');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechTranscriptPreview, setSpeechTranscriptPreview] = useState('');

  // Audio / Speech Synthesis state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(0.9);

  // History & Drawer state
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Active messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: 
        languageMode === 'kn'
          ? `ನಮಸ್ಕಾರ ${user?.fullNameKn || 'ಕಾವ್ಯಾ'}! ನಾನು ನಿನ್ನ "ವಿದ್ಯಾ ಸೇತು AI ಕಲಿಕಾ ಮಿತ್ರ". ೫ ನೇ ತರಗತಿಯ ಕನ್ನಡ ಪಠ್ಯ, ಕಥೆಗಳು, ಗಣಿತದ ಮಗ್ಗಿಗಳು, ಭಾಗಾಕಾರ ಅಥವಾ ಪರಿಸರ ವಿಜ್ಞಾನದ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳಿದ್ದರೂ ಕೇಳು! ನಾನು ಸರಳವಾಗಿ ಉತ್ತರಿಸುತ್ತೇನೆ.`
          : languageMode === 'en'
          ? `Namaskara ${user?.fullName || 'Kavya'}! I am your Vidya Setu AI Learning Tutor. Ask me any question from your Grade 5 textbooks — Kannada, Math tables, Science, or Karnataka history!`
          : `ನಮಸ್ಕಾರ ${user?.fullNameKn || 'ಕಾವ್ಯಾ'}! Namaskara! I am your Bilingual AI Tutor. You can ask educational questions in Kannada (ಕನ್ನಡ) or English!`,
      languageMode,
      timestamp: 'Just now',
      isVoiceAudioAvailable: true,
    }
  ]);

  // Suggested prompt pills
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    'ಕುವೆಂಪು ಅವರ ಬಗ್ಗೆ ಹೇಳಿ',
    'ಗಣಿತದ ೪ ರ ಮಗ್ಗಿ ಸುಲಭವಾಗಿ ಕಲಿಯುವುದು ಹೇಗೆ?',
    'ಗಿಡ-ಮರಗಳು ಹೇಗೆ ಆಹಾರ ತಯಾರಿಸುತ್ತವೆ?',
    'ತೆನಾಲಿ ರಾಮನ ಜಾಣ್ಮೆ ಕಥೆ ಹೇಳಿ'
  ]);

  // Saved past sessions
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([
    {
      id: 'sess-1',
      title: 'ರಾಷ್ಟ್ರಕವಿ ಕುವೆಂಪು ಪರಿಚಯ (Kuvempu Intro)',
      languageMode: 'kn',
      timestamp: 'ನಿನ್ನೆ · Yesterday',
      messages: [
        {
          id: 's1-1',
          sender: 'user',
          text: 'ಕುವೆಂಪು ಅವರ ಬಗ್ಗೆ ತಿಳಿಸಿ',
          languageMode: 'kn',
          timestamp: '2:30 PM',
        },
        {
          id: 's1-2',
          sender: 'assistant',
          text: 'ರಾಷ್ಟ್ರಕವಿ ಕುವೆಂಪು (ಕುಪ್ಪಳ್ಳಿ ವೆಂಕಟಪ್ಪ ಪುಟ್ಟಪ್ಪ) ಅವರು ಕನ್ನಡದ ಮೊದಲ ಜ್ಞಾನಪೀಠ ಪ್ರಶಸ್ತಿ ವಿಜೇತರು. ಅವರ ಮಹಾಕಾವ್ಯ "ಶ್ರೀ ರಾಮಾಯಣ ದರ್ಶನಂ" ವಿಶ್ವಪ್ರಸಿದ್ಧ.',
          languageMode: 'kn',
          timestamp: '2:31 PM',
          isVoiceAudioAvailable: true,
        }
      ]
    },
    {
      id: 'sess-2',
      title: 'ಗಣಿತದ ೪ ರ ಮಗ್ಗಿ (4 Times Table)',
      languageMode: 'bilingual',
      timestamp: '೨ ದಿನಗಳ ಹಿಂದೆ · 2 days ago',
      messages: [
        {
          id: 's2-1',
          sender: 'user',
          text: '4 times table trick',
          languageMode: 'bilingual',
          timestamp: '11:15 AM',
        },
        {
          id: 's2-2',
          sender: 'assistant',
          text: '೪ ರ ಮಗ್ಗಿ (4 Times Table): 4 × 1 = 4, 4 × 2 = 8, 4 × 3 = 12... Tip: 4 times table means doubling 2 times table!',
          languageMode: 'bilingual',
          timestamp: '11:16 AM',
          isVoiceAudioAvailable: true,
        }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Auto scroll down
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Update welcome message if user changes language mode on empty or initial chat
  const handleLanguageChange = (newMode: ChatLanguageMode) => {
    setLanguageMode(newMode);
    // Stop any ongoing speech
    stopAudio();

    // Update suggested prompts
    if (newMode === 'kn') {
      setSuggestedPrompts([
        'ಕುವೆಂಪು ಅವರ ಬಗ್ಗೆ ಹೇಳಿ',
        'ಗಣಿತದ ೪ ರ ಮಗ್ಗಿ ಸುಲಭವಾಗಿ ಕಲಿಯುವುದು ಹೇಗೆ?',
        'ಸಸ್ಯಗಳು ಹೇಗೆ ಆಹಾರ ತಯಾರಿಸುತ್ತವೆ?',
        'ತೆನಾಲಿ ರಾಮನ ಜಾಣ್ಮೆ ಕಥೆ ಹೇಳಿ'
      ]);
    } else if (newMode === 'en') {
      setSuggestedPrompts([
        'Tell me about Kuvempu',
        'Easy trick for 4x and 8x tables',
        'How do plants make food?',
        'Tell a moral folktale'
      ]);
    } else {
      setSuggestedPrompts([
        'ಕುವೆಂಪು ಪರಿಚಯ (Kuvempu Intro)',
        'ಗಣಿತ ಮಗ್ಗಿ (Math Tables tricks)',
        'ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ (Photosynthesis in Plants)',
        'ತೆನಾಲಿ ರಾಮ ಕಥೆ (Tenali Rama Story)'
      ]);
    }

    // Add welcoming system card if few messages
    if (messages.length <= 1) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: 'assistant',
          text: 
            newMode === 'kn'
              ? `ನಮಸ್ಕಾರ ${user?.fullNameKn || 'ಕಾವ್ಯಾ'}! ಕನ್ನಡ ಮಾಧ್ಯಮದಲ್ಲಿ ನಿನ್ನ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳು. ನಾನು ನಿನ್ನ ಪಠ್ಯಪುಸ್ತಕದ ಆಧಾರದಲ್ಲಿ ಉತ್ತರಿಸುತ್ತೇನೆ!`
              : newMode === 'en'
              ? `Namaskara ${user?.fullName || 'Kavya'}! English mode is active. Feel free to ask any question from your school syllabus!`
              : `ನಮಸ್ಕಾರ! Bilingual mode is on. I will explain in both Kannada and English!`,
          languageMode: newMode,
          timestamp: 'Just now',
          isVoiceAudioAvailable: true,
        }
      ]);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    // Stop speaking when user sends a message
    stopAudio();

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: query,
      languageMode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Map existing messages to history format
      const historyEntries: ChatHistoryEntry[] = messages.slice(-4).map(m => ({
        role: m.sender,
        content: m.text,
      }));

      const response = await askVillageTutor(
        query,
        languageMode,
        5,
        user?.fullName || 'Kavya',
        historyEntries
      );

      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        languageMode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isVoiceAudioAvailable: true,
      };

      setMessages(prev => [...prev, botMsg]);

      if (response.suggestedPrompts && response.suggestedPrompts.length > 0) {
        setSuggestedPrompts(response.suggestedPrompts);
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: languageMode === 'kn'
          ? 'ಕ್ಷಮಿಸಿ, ಸಂಪರ್ಕದಲ್ಲಿ ತೊಂದರೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.'
          : 'Sorry, there was an issue connecting. Please try asking again.',
        languageMode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice Input (Web Speech Recognition)
  const toggleVoiceInput = () => {
    setSpeechError(null);

    // If currently listening, stop it
    if (isListening) {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      setSpeechTranscriptPreview('');
      return;
    }

    // Check browser support for SpeechRecognition
    const SpeechRecognition = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        languageMode === 'kn'
          ? 'ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗ್ರಹಿಕೆ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಕೀಬೋರ್ಡ್ ಬಳಸಿ.'
          : 'Speech recognition is not supported in this browser. Please type your question.'
      );
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      speechRecognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;

      // Select language for recognition
      recognition.lang = languageMode === 'kn' ? 'kn-IN' : languageMode === 'en' ? 'en-IN' : 'kn-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechTranscriptPreview(
          languageMode === 'kn' ? 'ಆಲಿಸುತ್ತಿದೆ... ಮಾತನಾಡಿ...' : 'Listening... Speak now...'
        );
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setSpeechTranscriptPreview(transcript);
        setInputMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setSpeechTranscriptPreview('');
        if (event.error !== 'no-speech') {
          setSpeechError(
            languageMode === 'kn'
              ? 'ಧ್ವನಿ ಸ್ಪಷ್ಟವಾಗಿ ಕೇಳಿಸಲಿಲ್ಲ, ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಮಾತನಾಡಿ.'
              : 'Could not hear clearly. Please try speaking again.'
          );
          setTimeout(() => setSpeechError(null), 3500);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setSpeechTranscriptPreview('');
      };

      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setIsListening(false);
      setSpeechError('Microphone permission needed.');
      setTimeout(() => setSpeechError(null), 3000);
    }
  };

  // Text-To-Speech (TTS)
  const handlePlayVoice = (msgId: string, text: string) => {
    // If clicking same message while playing -> pause or stop
    if (playingAudioId === msgId) {
      if (isAudioPaused) {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.resume();
          setIsAudioPaused(false);
        }
      } else {
        stopAudio();
      }
      return;
    }

    stopAudio();
    setPlayingAudioId(msgId);
    setIsAudioPaused(false);

    if ('speechSynthesis' in window) {
      // Remove markdown asterisks and bullet symbols for smoother narration
      const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#/g, '')
        .replace(/•/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Best effort voice selection
      const voices = window.speechSynthesis.getVoices();
      if (languageMode === 'kn') {
        const knVoice = voices.find(v => v.lang.startsWith('kn') || v.name.includes('Kannada'));
        if (knVoice) utterance.voice = knVoice;
        utterance.lang = 'kn-IN';
      } else {
        const enInVoice = voices.find(v => v.lang === 'en-IN' || v.lang.startsWith('en'));
        if (enInVoice) utterance.voice = enInVoice;
        utterance.lang = 'en-IN';
      }

      utterance.rate = playbackRate;
      utterance.pitch = 1.05; // Friendly warm pitch for education

      utterance.onend = () => {
        setPlayingAudioId(null);
        setIsAudioPaused(false);
      };

      utterance.onerror = () => {
        setPlayingAudioId(null);
        setIsAudioPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingAudioId(null), 3500);
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPlayingAudioId(null);
    setIsAudioPaused(false);
  };

  const togglePauseResume = () => {
    if (!('speechSynthesis' in window) || !playingAudioId) return;
    if (isAudioPaused) {
      window.speechSynthesis.resume();
      setIsAudioPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsAudioPaused(true);
    }
  };

  const handleRateChange = () => {
    const nextRate = playbackRate === 0.9 ? 1.1 : playbackRate === 1.1 ? 0.75 : 0.9;
    setPlaybackRate(nextRate);
    if (playingAudioId) {
      const activeMsg = messages.find(m => m.id === playingAudioId);
      if (activeMsg) {
        handlePlayVoice(activeMsg.id, activeMsg.text);
      }
    }
  };

  // Clear conversation
  const confirmClearChat = () => {
    stopAudio();
    // Save current session to history if there are real interactions
    if (messages.length > 2) {
      const firstUserMsg = messages.find(m => m.sender === 'user');
      const sessionTitle = firstUserMsg ? firstUserMsg.text.slice(0, 30) + '...' : 'ಕಲಿಕಾ ಸಂವಾದ';
      const newSession: SavedSession = {
        id: `sess-${Date.now()}`,
        title: sessionTitle,
        languageMode,
        timestamp: 'Just now',
        messages: [...messages],
      };
      setSavedSessions(prev => [newSession, ...prev]);
    }

    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 
          languageMode === 'kn'
            ? `ಸಂಭಾಷಣೆ ತೆರವುಗೊಂಡಿದೆ. ನಮಸ್ಕಾರ ${user?.fullNameKn || 'ಕಾವ್ಯಾ'}! ಹೊಸ ಪ್ರಶ್ನೆ ಕೇಳಿ, ಒಟ್ಟಿಗೆ ಕಲಿಯೋಣ!`
            : languageMode === 'en'
            ? `Chat cleared! Hello ${user?.fullName || 'Kavya'}! What topic would you like to explore next?`
            : `ಸಂಭಾಷಣೆ ತೆರವುಗೊಂಡಿದೆ (Cleared). Ask a fresh question in Kannada or English!`,
        languageMode,
        timestamp: 'Just now',
        isVoiceAudioAvailable: true,
      }
    ]);
    setIsClearConfirmOpen(false);
  };

  // Restore past session
  const restoreSession = (sess: SavedSession) => {
    stopAudio();
    setLanguageMode(sess.languageMode);
    setMessages(sess.messages);
    setIsHistoryDrawerOpen(false);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-6">
      {/* 1. Header Card with Mascot & Language Selector */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Mascot & Titles */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-extrabold text-xl shadow-md shrink-0 border-2 border-amber-300">
              🦉
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="warning" size="sm">
                  {languageMode === 'kn' ? 'AI ಕಲಿಕಾ ಮಿತ್ರ' : languageMode === 'en' ? 'AI Learning Tutor' : 'Bilingual AI'}
                </Badge>
                <span className="text-[11px] text-emerald-200 bg-emerald-900/60 px-2 py-0.5 rounded-full font-medium">
                  Grade 5 · Karnataka
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5 tracking-tight">
                {languageMode === 'kn' ? 'ವಿದ್ಯಾ ಸೇತು ಕಲಿಕಾ ಮಿತ್ರ' : 'Vidya Setu AI Assistant'}
              </h2>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                {languageMode === 'kn'
                  ? 'ಕನ್ನಡ ಪಠ್ಯಕ್ರಮ, ಗಣಿತ ಮಗ್ಗಿಗಳು, ಪರಿಸರ ವಿಜ್ಞಾನ ಮತ್ತು ಕಥೆಗಳಿಗೆ ಪ್ರೀತಿಯ ಉತ್ತರಗಳು'
                  : 'Grounded in Karnataka primary syllabus with natural Kannada & English guidance'}
              </p>
            </div>
          </div>

          {/* Controls: Language Selector & History / Clear Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Conversation History Drawer Button */}
            <button
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-700 text-xs font-semibold text-white border border-emerald-600/50 cursor-pointer shadow-xs transition-colors"
              title="View Conversation History"
            >
              <History className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'kn' ? 'ಹಿಂದಿನ ಇತಿಹಾಸ' : 'History'}</span>
            </button>

            {/* Clear Chat Button */}
            <button
              onClick={() => setIsClearConfirmOpen(true)}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-emerald-900/80 hover:bg-rose-900/70 text-xs font-semibold text-rose-200 border border-emerald-600/50 cursor-pointer transition-colors"
              title="Clear Conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Language Selector Bar (English / Kannada / Kannada + English) */}
        <div className="relative z-10 mt-4 pt-3 border-t border-emerald-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-emerald-200 font-medium">
            <Languages className="w-4 h-4 text-amber-300" />
            <span>{language === 'kn' ? 'ಉತ್ತರದ ಭಾಷೆ ಆಯ್ಕೆ:' : 'Answer Language:'}</span>
          </div>

          <div className="grid grid-cols-3 sm:flex items-center gap-1.5 bg-emerald-950/70 p-1 rounded-xl border border-emerald-600/40">
            <button
              onClick={() => handleLanguageChange('kn')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                languageMode === 'kn'
                  ? 'bg-amber-400 text-slate-900 shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-900/60'
              }`}
            >
              ಕನ್ನಡ (Kannada)
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                languageMode === 'en'
                  ? 'bg-amber-400 text-slate-900 shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-900/60'
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange('bilingual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                languageMode === 'bilingual'
                  ? 'bg-amber-400 text-slate-900 shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-900/60'
              }`}
            >
              ಕನ್ನಡ + English
            </button>
          </div>
        </div>
      </div>

      {/* Global Speaker Active Player Bar (Appears when reading out loud) */}
      {playingAudioId && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl p-3 shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-300 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4 animate-pulse" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">
                {languageMode === 'kn' ? 'ಧ್ವನಿ ವಾಚನ ಚಾಲನೆಯಲ್ಲಿದೆ (AI Voice Speaking)' : 'Reading out response (AI Voice)'}
              </p>
              <p className="text-[10px] text-amber-950 font-medium">
                Speed: {playbackRate}x · {isAudioPaused ? 'Paused' : 'Playing'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={togglePauseResume}
              className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center gap-1 hover:bg-slate-800 cursor-pointer"
            >
              {isAudioPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
              <span className="hidden sm:inline">{isAudioPaused ? 'Resume' : 'Pause'}</span>
            </button>
            <button
              onClick={handleRateChange}
              className="px-2 py-1 rounded-lg bg-amber-400 text-slate-900 text-xs font-bold hover:bg-amber-300 cursor-pointer"
              title="Change Speed"
            >
              {playbackRate}x
            </button>
            <button
              onClick={stopAudio}
              className="p-1 rounded-lg bg-rose-700 text-white hover:bg-rose-800 cursor-pointer"
              title="Stop Audio"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Chat Messages Frame */}
      <Card className="flex flex-col h-[520px] sm:h-[560px] shadow-sm border-slate-200">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/60">
          {messages.map(msg => {
            const isBot = msg.sender === 'assistant';
            const isThisAudioPlaying = playingAudioId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 max-w-[92%] sm:max-w-[85%] ${
                  isBot ? 'self-start' : 'self-end ml-auto flex-row-reverse'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center shrink-0 font-bold text-xs shadow-xs ${
                    isBot 
                      ? 'bg-emerald-700 text-amber-300 border border-emerald-600' 
                      : 'bg-slate-800 text-white border border-slate-700'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed transition-all shadow-xs ${
                    isBot
                      ? 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                      : 'bg-emerald-700 text-white rounded-tr-xs'
                  }`}
                >
                  {/* Clean text formatted */}
                  <div className="whitespace-pre-line font-medium leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Bubble Footer: Timestamp & Audio / Speaker Controls */}
                  <div
                    className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] ${
                      isBot
                        ? 'border-slate-100 text-slate-400'
                        : 'border-emerald-600/70 text-emerald-200'
                    }`}
                  >
                    <span>{msg.timestamp}</span>

                    {/* Speaker control for AI messages */}
                    {isBot && msg.isVoiceAudioAvailable && (
                      <button
                        onClick={() => handlePlayVoice(msg.id, msg.text)}
                        className={`flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                          isThisAudioPlaying
                            ? 'bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-300'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80'
                        }`}
                        title="Listen to this explanation"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isThisAudioPlaying ? 'animate-bounce' : ''}`} />
                        <span>
                          {isThisAudioPlaying 
                            ? (languageMode === 'kn' ? 'ಓದುತ್ತಿದೆ...' : 'Speaking...') 
                            : (languageMode === 'kn' ? 'ಧ್ವನಿ ಕೇಳಿ' : 'Listen')}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 self-start max-w-[85%] animate-in fade-in">
              <div className="w-8 h-8 rounded-2xl bg-emerald-700 text-amber-300 flex items-center justify-center border border-emerald-600 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-xs bg-white border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5 shadow-xs">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>
                  {languageMode === 'kn'
                    ? 'ಉತ್ತರವನ್ನು ತಯಾರಿಸುತ್ತಿದೆ... (Preparing answer)...'
                    : 'Thinking and preparing your lesson...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. Live Speech Recognition Listening Bar */}
        {isListening && (
          <div className="p-3 bg-amber-50 border-t border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900 animate-in fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <span className="font-bold shrink-0">
                {languageMode === 'kn' ? 'ಧ್ವನಿ ಗ್ರಹಿಕೆ (Listening):' : 'Voice Input:'}
              </span>
              <span className="truncate italic text-slate-700">
                {speechTranscriptPreview || (languageMode === 'kn' ? 'ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ...' : 'Speak now...')}
              </span>
            </div>
            <button
              onClick={toggleVoiceInput}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 text-xs cursor-pointer shrink-0"
            >
              {languageMode === 'kn' ? 'ನಿಲ್ಲಿಸಿ' : 'Stop'}
            </button>
          </div>
        )}

        {/* Speech error toast */}
        {speechError && (
          <div className="p-2 bg-rose-50 border-t border-rose-200 text-xs text-rose-800 text-center font-medium">
            {speechError}
          </div>
        )}

        {/* 4. Suggested Prompts Pill Carousel */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px] scrollbar-thin">
          <span className="text-slate-400 shrink-0 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {languageMode === 'kn' ? 'ಪ್ರಶ್ನೆಗಳು:' : 'Try:'}
          </span>
          {suggestedPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(p)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 shrink-0 transition-colors font-medium cursor-pointer disabled:opacity-50 text-xs"
            >
              {p}
            </button>
          ))}
        </div>

        {/* 5. Message Input Form with Mic & Send buttons */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-3.5 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          {/* Microphone Voice Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-all ${
              isListening
                ? 'bg-rose-600 text-white shadow-md ring-4 ring-rose-200 animate-pulse'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
            }`}
            title={languageMode === 'kn' ? 'ಧ್ವನಿ ಮೂಲಕ ಪ್ರಶ್ನೆ ಕೇಳಿ' : 'Speak your question'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={
              languageMode === 'kn'
                ? 'ಕನ್ನಡದಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ ಒತ್ತಿ ಮಾತನಾಡಿ...'
                : languageMode === 'en'
                ? 'Ask an educational question in English or tap the mic...'
                : 'ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಪ್ರಶ್ನೆ ಕೇಳಿ...'
            }
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all min-h-[44px]"
          />

          {/* Send Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputMessage.trim() || isLoading}
            className="h-11 px-4 sm:px-5 shrink-0 rounded-xl font-bold cursor-pointer"
            rightIcon={<Send className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">{languageMode === 'kn' ? 'ಕೇಳಿ' : 'Ask'}</span>
          </Button>
        </form>
      </Card>

      {/* 6. Conversation History Drawer Modal */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsHistoryDrawerOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-300" />
                <h3 className="font-bold text-sm">
                  {language === 'kn' ? 'ಹಿಂದಿನ ಕಲಿಕಾ ಇತಿಹಾಸ' : 'Conversation History'}
                </h3>
              </div>
              <button
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-emerald-700 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <button
                onClick={() => {
                  confirmClearChat();
                  setIsHistoryDrawerOpen(false);
                }}
                className="w-full p-3 rounded-xl border-2 border-dashed border-emerald-400 text-emerald-800 hover:bg-emerald-50 flex items-center justify-center gap-2 font-bold text-xs cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'kn' ? 'ಹೊಸ ಕಲಿಕಾ ಸಂವಾದ ಪ್ರಾರಂಭಿಸಿ' : 'Start New Conversation'}</span>
              </button>

              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pt-2">
                {language === 'kn' ? 'ಉಳಿಸಲಾದ ಸಂವಾದಗಳು' : 'Past Study Sessions'}
              </h4>

              {savedSessions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  {language === 'kn' ? 'ಇನ್ನೂ ಯಾವುದೇ ಹಿಂದಿನ ಸಂವಾದಗಳಿಲ್ಲ.' : 'No past study sessions yet.'}
                </div>
              ) : (
                savedSessions.map(sess => (
                  <div
                    key={sess.id}
                    onClick={() => restoreSession(sess)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="info" size="sm">
                        {sess.languageMode.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {sess.timestamp}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 group-hover:text-emerald-800 leading-snug">
                      {sess.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 truncate">
                      {sess.messages[sess.messages.length - 1]?.text || 'Study discussion'}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-3.5 border-t border-slate-100 bg-slate-50 text-center">
              <p className="text-[11px] text-slate-500">
                Govt. Model Higher Primary School · Hosahalli
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7. Clear Conversation Confirmation Modal */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsClearConfirmOpen(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl z-10 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base text-slate-900">
                {language === 'kn' ? 'ಸಂಭಾಷಣೆಯನ್ನು ತೆರವುಗೊಳಿಸಬೇಕೆ?' : 'Clear this conversation?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'kn'
                  ? 'ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಚಾಟ್ ಸಂದೇಶಗಳು ಅಳಿಸಲ್ಪಡುತ್ತವೆ ಮತ್ತು ಹೊಸ ಸಂವಾದ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ.'
                  : 'Your current chat will be saved to history and a fresh conversation will begin.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsClearConfirmOpen(false)}
              >
                {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={confirmClearChat}
              >
                {language === 'kn' ? 'ಹೌದು, ತೆರವುಗೊಳಿಸಿ' : 'Yes, Clear'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
