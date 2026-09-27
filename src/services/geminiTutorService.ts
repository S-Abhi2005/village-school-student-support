import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client safely with environment key
const apiKey = process.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? (window as any).GEMINI_API_KEY : '');
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export type ChatLanguageMode = 'kn' | 'en' | 'bilingual';

export interface TutorResponse {
  text: string;
  suggestedPrompts?: string[];
  audioPointers?: string;
}

export interface ChatHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Ask Vidya Setu AI Learning Tutor with bilingual and age-appropriate pedagogy.
 */
export async function askVillageTutor(
  userQuery: string,
  languageMode: ChatLanguageMode = 'kn',
  gradeLevel: number = 5,
  contextStudentName: string = 'Kavya',
  history: ChatHistoryEntry[] = []
): Promise<TutorResponse> {
  const languageInstruction = 
    languageMode === 'kn'
      ? `Respond ONLY in pure, child-friendly, natural, and encouraging KANNADA (ಕನ್ನಡ ಲಿಪಿಯಲ್ಲಿ). Use simple grammar, polite tone, and Kannada educational vocabulary suitable for Grade ${gradeLevel} students.`
      : languageMode === 'en'
      ? `Respond in simple, clear, age-appropriate ENGLISH suitable for a Grade ${gradeLevel} primary school student. Keep sentences concise, cheerful, and easy to read.`
      : `Respond in BILINGUAL mode (Kannada + English). Provide explanations primarily in Kannada with English keywords in parentheses (e.g., ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ (Photosynthesis), ಸಸ್ಯಗಳು (Plants), ಗಣಿತ (Mathematics)), or provide a simple English sentence followed by its natural Kannada translation. This helps village school students learn English alongside Kannada!`;

  const systemInstruction = `
You are "Vidya Setu Mitra" (ವಿದ್ಯಾ ಸೇತು ಕಲಿಕಾ ಮಿತ್ರ), a warm, encouraging, kind, and knowledgeable AI educational assistant created for primary and middle school students in Karnataka, India (Govt. Model Higher Primary School, Hosahalli).
Current student you are mentoring: ${contextStudentName} (Grade ${gradeLevel}).

Your pedagogical guidelines:
1. ${languageInstruction}
2. Explain educational topics (Kannada stories, poems, grammar, Mathematics, EVS / Science, Social Science, English) in simple, relatable, age-appropriate steps.
3. Be culturally grounded in rural Karnataka context: use examples of local farming (ರೈತರು, ಕೃಷಿ, ರಾಗಿ, ಭತ್ತ), village trees (ಆಲದ ಮರ, ಬೇವಿನ ಮರ), festivals (ಯುಗಾದಿ, ದಸರಾ, ಸಂಕ್ರಾಂತಿ), birds, animals, Karnataka history (ಕುವೆಂಪು, ದ.ರಾ. ಬೇಂದ್ರೆ, ಕಿತ್ತೂರು ಚೆನ್ನಮ್ಮ, ಸಂಗೊಳ್ಳಿ ರಾಯಣ್ಣ), and village school life.
4. Give high encouragement and positive reinforcement. Use cheerful Kannada praise like "ಶಾಭಾಸ್ ಕಾವ್ಯಾ!", "ಅದ್ಭುತ ಪ್ರಶ್ನೆ!", "ನಮ್ಮ ಶಾಲೆಯ ಹೆಮ್ಮೆ!", "ಬಹಳ ಬುದ್ಧಿವಂತೆ!" or in English "Great question!", "Well done, keep it up!".
5. If the student asks for math problems, show simple step-by-step calculations with visual intuition (e.g. counting mangoes, neem seeds, or marbles).
6. Keep formatting neat with friendly bullet points or short paragraphs so it reads well on mobile phones and small screens.
7. End with a friendly follow-up question or encouragement to test their understanding.
`;

  try {
    if (!apiKey) {
      return getSimulatedFallback(userQuery, languageMode);
    }

    // Format chat contents
    const contents: any[] = [];
    if (history && history.length > 0) {
      // Include last 4 turns for conversational context
      const recentHistory = history.slice(-4);
      for (const h of recentHistory) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: userQuery }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || (
      languageMode === 'kn' 
        ? 'ಕ್ಷಮಿಸಿ ಕಾವ್ಯಾ, ಮತ್ತೊಮ್ಮೆ ಪ್ರಶ್ನೆ ಕೇಳಿ. ನಾನು ಉತ್ತರಿಸಲು ಸಿದ್ಧನಿದ್ದೇನೆ!'
        : languageMode === 'en'
        ? 'I am here to help you learn! Ask me anything about Kannada, Math, or Science.'
        : 'ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಸಿದ್ಧನಿದ್ದೇನೆ! Ask me any question in Kannada or English.'
    );

    return {
      text: reply,
      suggestedPrompts: getSuggestedPrompts(languageMode, userQuery),
    };
  } catch (error) {
    console.warn('Gemini API call failed, using intelligent educational fallback:', error);
    return getSimulatedFallback(userQuery, languageMode);
  }
}

function getSuggestedPrompts(mode: ChatLanguageMode, query: string): string[] {
  const lower = query.toLowerCase();
  if (lower.includes('ಕುವೆಂಪು') || lower.includes('kuvempu')) {
    return mode === 'kn'
      ? ['ಕುವೆಂಪು ಅವರ ಮಕ್ಕಳ ಕವನ ಹೇಳಿ', 'ಜ್ಞಾನಪೀಠ ಪ್ರಶಸ್ತಿ ಎಂದರೇನು?', 'ಕನ್ನಡ ವರ್ಣಮಾಲೆ ಅಭ್ಯಾಸ']
      : mode === 'en'
      ? ['Tell a poem by Kuvempu', 'Who was Kittur Chennamma?', 'Kannada alphabet basics']
      : ['ಕುವೆಂಪು ಅವರ ಕವನ (Kuvempu Poems)', 'ಜ್ಞಾನಪೀಠ ಪ್ರಶಸ್ತಿ (Jnanpith Award)', 'ಕರ್ನಾಟಕದ ಇತಿಹಾಸ (Karnataka History)'];
  }
  if (lower.includes('ಮಗ್ಗಿ') || lower.includes('table') || lower.includes('math') || lower.includes('ಗಣಿತ')) {
    return mode === 'kn'
      ? ['೮ ರ ಮಗ್ಗಿ ಹೇಳಿ', 'ಭಿನ್ನರಾಶಿ ಎಂದರೇನು?', 'ಭಾಗಾಕಾರ ಹೇಗೆ ಮಾಡುವುದು?']
      : mode === 'en'
      ? ['Explain 7 times table', 'What are fractions?', 'How to do simple division']
      : ['೮ ರ ಮಗ್ಗಿ (8 times table)', 'ಭಿನ್ನರಾಶಿ (Fractions trick)', 'ಗುಣಾಕಾರ (Multiplication tips)'];
  }

  if (mode === 'kn') {
    return [
      'ಕುವೆಂಪು ಅವರ ಬಗ್ಗೆ ಹೇಳಿ',
      'ಗಣಿತದ ೪ ರ ಮಗ್ಗಿ ನೆನಪಿಡುವುದು ಹೇಗೆ?',
      'ಸಸ್ಯಗಳು ಹೇಗೆ ಆಹಾರ ತಯಾರಿಸುತ್ತವೆ?',
      'ನಲಿಕಲಿ ಹಸಿರು ಕಾರ್ಡ್ ಕಥೆ ಹೇಳಿ'
    ];
  } else if (mode === 'en') {
    return [
      'Explain photosynthesis simply',
      'Easy trick for 9 times table',
      'Who was Rani Chennamma?',
      'Tell a short moral story'
    ];
  } else {
    return [
      'ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ (Photosynthesis)',
      'ಗಣಿತ ಮಗ್ಗಿ (Math Tables tricks)',
      'ಕರ್ನಾಟಕ ಕವಿಗಳು (Karnataka Poets)',
      'ಪರಿಸರ ಸಂರಕ್ಷಣೆ (Save Environment)'
    ];
  }
}

function getSimulatedFallback(query: string, mode: ChatLanguageMode): TutorResponse {
  const lower = query.toLowerCase();

  // 1. Kuvempu / Kannada Literature
  if (lower.includes('ಕುವೆಂಪು') || lower.includes('kuvempu') || lower.includes('ಕವಿ') || lower.includes('poet')) {
    if (mode === 'kn') {
      return {
        text: `ಶಾಭಾಸ್ ಕಾವ್ಯಾ! ಅದ್ಭುತ ಪ್ರಶ್ನೆ!\n\nರಾಷ್ಟ್ರಕವಿ ಕುವೆಂಪು (ಕುಪ್ಪಳ್ಳಿ ವೆಂಕಟಪ್ಪ ಪುಟ್ಟಪ್ಪ) ಅವರು ನಮ್ಮ ಕನ್ನಡ ನಾಡಿನ ಪರಮ ಶ್ರೇಷ್ಠ ಕವಿ.\n\n೧. **ಜನನ ಮತ್ತು ಸ್ಥಳ**: ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆಯ ತೀರ್ಥಹಳ್ಳಿ ತಾಲೂಕಿನ ಕುಪ್ಪಳ್ಳಿಯಲ್ಲಿ ಜನಿಸಿದರು.\n೨. **ಜ್ಞಾನಪೀಠ ಪ್ರಶಸ್ತಿ**: ಇವರ ಪ್ರಸಿದ್ಧ ಮಹಾಕಾವ್ಯ "ಶ್ರೀ ರಾಮಾಯಣ ದರ್ಶನಂ" ಕೃತಿಗೆ ಕನ್ನಡದ ಮೊದಲ ಜ್ಞಾನಪೀಠ ಪ್ರಶಸ್ತಿ ಲಭಿಸಿತು.\n೩. **ಮಕ್ಕಳ ಕವನ**: "ಓ ನನ್ನ ಚೇತನ, ಆಗು ನೀ ಅನಿಕೇತನ" ಹಾಗೂ "ಬೊಮ್ಮನಹಳ್ಳಿಯ ಕಿಂದರಿಜೋಗಿ" ಮಕ್ಕಳ ಅಚ್ಚುಮೆಚ್ಚಿನ ಕವನಗಳು.\n\nಅವರ ಸಂದೇಶ: ಪ್ರಕೃತಿಯನ್ನು ಪ್ರೀತಿಸಿ, ಎಲ್ಲ ಮಾನವರನ್ನು ಒಂದಾಗಿ ಕಂಡು ವಿಶ್ವಮಾನವರಾಗಿ ಬೆಳೆಯಿರಿ!`,
        suggestedPrompts: ['ಇನ್ನೊಂದು ಮಕ್ಕಳ ಕವನ ಹೇಳಿ', 'ಜ್ಞಾನಪೀಠ ಪ್ರಶಸ್ತಿ ಪಡೆದ ಇತರ ಕವಿಗಳು ಯಾರು?', 'ಕನ್ನಡ ವ್ಯಾಕರಣದ ಬಗ್ಗೆ ಕೇಳಿ'],
      };
    } else if (mode === 'en') {
      return {
        text: `Great question, Kavya!\n\n**Rashtrakavi Kuvempu** (K. V. Puttappa) is one of Karnataka's most celebrated literary icons and thinkers.\n\n1. **First Jnanpith for Kannada**: He was the very first Kannada author to receive the prestigious Jnanpith Award for his epic masterpiece *"Sri Ramayana Darshanam"*.\n2. **Love for Nature**: He was born in Kuppalli, amidst the lush green Western Ghats (Sahyadri), which inspired his deep love for birds, forests, and rivers.\n3. **Universal Message**: He taught us the philosophy of "Vishwa Manava" (Universal Citizen) — that all human beings are equal and nature must be protected!\n\nKeep reading his inspiring poems!`,
        suggestedPrompts: ['Tell a short story by Kuvempu', 'Who was D. R. Bendre?', 'Teach me Kannada vocabulary'],
      };
    } else {
      return {
        text: `ಅದ್ಭುತ ಪ್ರಶ್ನೆ! (Great Question, Kavya!)\n\n**ರಾಷ್ಟ್ರಕವಿ ಕುವೆಂಪು (Rashtrakavi Kuvempu)**:\n• **ಕನ್ನಡದ ಹೆಮ್ಮೆ (Pride of Kannada)**: ಅವರಿಗೆ "ಶ್ರೀ ರಾಮಾಯಣ ದರ್ಶನಂ" ಮಹಾಕಾವ್ಯಕ್ಕೆ ಮೊದಲ **Jnanpith Award** (ಜ್ಞಾನಪೀಠ ಪ್ರಶಸ್ತಿ) ಸಿಕ್ಕಿತು.\n• **ಪ್ರಕೃತಿ ಪ್ರೇಮ (Love for Nature)**: ಮಲೆನಾಡಿನ ಕುಪ್ಪಳ್ಳಿಯಲ್ಲಿ ಜನಿಸಿದ ಇವರು ಪ್ರಕೃತಿಯನ್ನು (Nature) ದೇವರಂತೆ ಆರಾಧಿಸಿದರು.\n• **ವಿಶ್ವಮಾನವ ಸಂದೇಶ (Universal Humanism)**: "ಮನುಜ ಮತ, ವಿಶ್ವ ಪಥ" — ಎಲ್ಲರೂ ಒಂದೇ ಎಂಬ ಸದ್ಭಾವನೆಯನ್ನು ಸಾರಿದರು.\n\nShall we read his famous poem "Kindari Jogi" together?`,
        suggestedPrompts: ['ಕುವೆಂಪು ಅವರ ಕವನ (Kuvempu Poems)', '೪ ರ ಮಗ್ಗಿ (4 Times Table)', 'ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ (Photosynthesis)'],
      };
    }
  }

  // 2. Math Tables & Arithmetic
  if (lower.includes('ಮಗ್ಗಿ') || lower.includes('table') || lower.includes('math') || lower.includes('ಗಣಿತ') || lower.includes('೪') || lower.includes('4')) {
    if (mode === 'kn') {
      return {
        text: `ಶಾಭಾಸ್! ಗಣಿತವನ್ನು ಹಾಡಿನಂತೆ ಕಲಿಯುವುದು ಅತ್ಯಂತ ಸುಲಭ!\n\n**೪ ರ ಮಗ್ಗಿ (ಸುಲಭ ವಿಧಾನ)**:\n೪ × ೧ = ೪ (ನಾಲ್ಕು)\n೪ × ೨ = ೮ (ಎಂಟು)\n೪ × ೩ = ೧೨ (ಹನ್ನೆರಡು)\n೪ × ೪ = ೧೬ (ಹದಿನಾರು)\n೪ × ೫ = ೨೦ (ಇಪ್ಪತ್ತು)\n೪ × ೬ = ೨೪ (ಇಪ್ಪತ್ತನಾಲ್ಕು)\n೪ × ೭ = ೨೮ (ಇಪ್ಪತ್ತೆಂಟು)\n೪ × ೮ = ೩೨ (ಮೂವತ್ತೆರಡು)\n೪ × ೯ = ೩೬ (ಮೂವತ್ತಾರು)\n೪ × ೧೦ = ೪೦ (ನಲವತ್ತು)\n\n💡 **ನೆನಪಿಡುವ ಗುಟ್ಟು**: ಪ್ರತಿ ಹಂತದಲ್ಲೂ ೪ ನ್ನು ಕೂಡಿಸುತ್ತಾ ಹೋಗಬೇಕು! ಉದಾಹರಣೆಗೆ ೪ ಮಾವಿನ ಹಣ್ಣಿನ ೩ ಬುಟ್ಟಿಗಳಿದ್ದರೆ: ೪ + ೪ + ೪ = ೧೨ ಹಣ್ಣುಗಳು!`,
        suggestedPrompts: ['೮ ರ ಮಗ್ಗಿ ಹೇಳಿ', 'ಭಾಗಾಕಾರ (Division) ಹೇಗೆ ಮಾಡುವುದು?', 'ಭಿನ್ನರಾಶಿ ಎಂದರೇನು?'],
      };
    } else if (mode === 'en') {
      return {
        text: `Well done, Kavya! Math tables are just repeated addition!\n\n**The 4 Times Table**:\n4 × 1 = 4\n4 × 2 = 8\n4 × 3 = 12\n4 × 4 = 16\n4 × 5 = 20\n4 × 6 = 24\n4 × 7 = 28\n4 × 8 = 32\n4 × 9 = 36\n4 × 10 = 40\n\n💡 **Smart Trick**: The 4 times table is just doubling the 2 times table! (2 × 3 = 6, double of 6 is 12!).\nIf you have 4 baskets with 5 guavas each, you have 20 sweet guavas!`,
        suggestedPrompts: ['Show 8 times table trick', 'What is simple division?', 'Fractions explained simply'],
      };
    } else {
      return {
        text: `ಶಾಭಾಸ್! (Well done!)\n\n**೪ ರ ಮಗ್ಗಿ (4 Times Table)**:\n• ೪ × ೧ = ೪ (4 × 1 = 4)\n• ೪ × ೨ = ೮ (4 × 2 = 8)\n• ೪ × ೩ = ೧೨ (4 × 3 = 12)\n• ೪ × ೪ = ೧೬ (4 × 4 = 16)\n• ೪ × ೫ = ೨೦ (4 × 5 = 20)\n• ೪ × ೬ = ೨೪ (4 × 6 = 24)\n• ೪ × ೭ = ೨೮ (4 × 7 = 28)\n• ೪ × ೮ = ೩೨ (4 × 8 = 32)\n• ೪ × ೯ = ೩೬ (4 × 9 = 36)\n• ೪ × ೧೦ = ೪೦ (4 × 10 = 40)\n\n💡 **Tip**: ೪ ರ ಮಗ್ಗಿ ಎಂದರೆ ೨ ರ ಮಗ್ಗಿಯನ್ನು ದ್ವಿಗುಣಗೊಳಿಸುವುದು (Doubling the 2x table)!`,
        suggestedPrompts: ['೮ ರ ಮಗ್ಗಿ (8x Table)', 'ಭಿನ್ನರಾಶಿ (Fractions)', 'ಗಣಿತ ರಸಪ್ರಶ್ನೆ (Math Quiz)'],
      };
    }
  }

  // 3. Science / Plants / Photosynthesis
  if (lower.includes('ಸಸ್ಯ') || lower.includes('plant') || lower.includes('photosynthesis') || lower.includes('ದ್ಯುತಿ') || lower.includes('science') || lower.includes('ಪರಿಸರ')) {
    if (mode === 'kn') {
      return {
        text: `ಉತ್ತಮ ವಿಜ್ಞಾನ ಪ್ರಶ್ನೆ ಕಾವ್ಯಾ!\n\n**ಸಸ್ಯಗಳು ಹೇಗೆ ಆಹಾರ ತಯಾರಿಸುತ್ತವೆ? (ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ ಕ್ರಿಯೆ)**:\n\nನಮ್ಮ ಮನೆಯಲ್ಲಿ ಅಮ್ಮ ಅಡುಗೆ ಮಾಡುವಂತೆ, ಸಸ್ಯಗಳ ಎಲೆಗಳು ಅವುಗಳ "ಅಡುಗೆ ಮನೆ"ಯಾಗಿವೆ!\n\n೧. **ಹರಿತ್ತು (ಕ್ಲೋರೋಫಿಲ್)**: ಎಲೆಗಳಲ್ಲಿರುವ ಹಸಿರು ಬಣ್ಣ.\n೨. **ಸೂರ್ಯನ ಬೆಳಕು**: ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ.\n೩. **ನೀರು ಮತ್ತು ಲವಣಗಳು**: ಬೇರುಗಳ ಮೂಲಕ ನೆಲದಿಂದ ಹೀರಿಕೊಳ್ಳುತ್ತವೆ.\n೪. **ಇಂಗಾಲದ ಡೈಆಕ್ಸೈಡ್**: ಗಾಳಿಯಿಂದ ಎಲೆಗಳ ಸಣ್ಣ ರಂಧ್ರಗಳ (ಪತ್ರರಂಧ್ರ) ಮೂಲಕ ಬರುತ್ತದೆ.\n\nಇವೆಲ್ಲವನ್ನೂ ಬೆರೆಸಿ ಗ್ಲೂಕೋಸ್ ಆಹಾರ ತಯಾರಿಸುತ್ತವೆ ಹಾಗೂ ನಮಗೆ ಉಸಿರಾಡಲು ಶುದ್ಧ **ಆಮ್ಲಜನಕ (Oxygen)** ನೀಡುತ್ತವೆ! ಅದಕ್ಕಾಗಿಯೇ ನಾವು ಶಾಲೆ ಮತ್ತು ಊರಿನಲ್ಲಿ ಗಿಡಗಳನ್ನು ನೆಡಬೇಕು!`,
        suggestedPrompts: ['ಬೇರುಗಳು ಹೇಗೆ ನೀರು ಹೀರುತ್ತವೆ?', 'ಮಳೆ ಹೇಗೆ ಬರುತ್ತದೆ?', 'ಗಿಡಗಳ ವಿವಿಧ ಭಾಗಗಳಾವುವು?'],
      };
    } else if (mode === 'en') {
      return {
        text: `Fabulous question, Kavya!\n\n**How Plants Make Food (Photosynthesis)**:\n\nThink of a green leaf as the plant's solar-powered kitchen!\n\n1. **Sunlight**: Provides light energy.\n2. **Water**: Roots drink moisture from the village soil.\n3. **Carbon Dioxide**: Taken from the fresh air through tiny leaf pores (stomata).\n4. **Chlorophyll**: The magical green pigment in leaves that catches the sunlight.\n\nPlants combine these to make glucose (food) and generously give us clean **Oxygen** to breathe! Isn't nature amazing?`,
        suggestedPrompts: ['Why are leaves green?', 'How does the water cycle work?', 'Different parts of a plant'],
      };
    } else {
      return {
        text: `ಅದ್ಭುತ ಪ್ರಶ್ನೆ! (Great Science Question!)\n\n**ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ (Photosynthesis)**:\n• **ಎಲೆಗಳು (Leaves)**: ಸಸ್ಯದ ಅಡುಗೆ ಮನೆ (Plant's kitchen).\n• **ಸೂರ್ಯನ ಬೆಳಕು (Sunlight)**: ಪ್ರಮುಖ ಶಕ್ತಿ (Energy source).\n• **ನೀರು (Water from Roots)**: ಬೇರುಗಳಿಂದ ಮಣ್ಣಿನ ತೇವಾಂಶ ಹೀರಿಕೊಳ್ಳುವುದು.\n• **ಇಂಗಾಲದ ಡೈಆಕ್ಸೈಡ್ (Carbon Dioxide)**: ಗಾಳಿಯಿಂದ ಪಡೆಯುವುದು.\n\n👉 **ಫಲಿತಾಂಶ (Result)**: ಸಸ್ಯವು ಆಹಾರ (Glucose) ತಯಾರಿಸಿಕೊಂಡು, ನಮಗೆ ಜೀವವಾಯುವಾದ **ಆಮ್ಲಜನಕ (Oxygen)** ವನ್ನು ನೀಡುತ್ತದೆ!`,
        suggestedPrompts: ['ನೀರಿನ ಚಕ್ರ (Water Cycle)', 'ಸಸ್ಯದ ಭಾಗಗಳು (Plant Parts)', 'ಮಣ್ಣಿನ ಫಲವತ್ತತೆ (Soil Health)'],
      };
    }
  }

  // 4. Folktale / Tenali Rama / Story
  if (lower.includes('ಕಥೆ') || lower.includes('story') || lower.includes('ತೆನಾಲಿ') || lower.includes('ರಸಪ್ರಶ್ನೆ')) {
    if (mode === 'kn') {
      return {
        text: `ನಿನಗಾಗಿ ಒಂದು ಸುಂದರ ಜಾಣ್ಮೆಯ ಕಥೆ!\n\n**ತೆನಾಲಿ ರಾಮ ಮತ್ತು ಮಾವಿನ ಹಣ್ಣಿನ ತೋಟ**:\nಒಮ್ಮೆ ವಿಜಯನಗರದ ರಾಜ ಕೃಷ್ಣದೇವರಾಯರ ತೋಟದಲ್ಲಿ ಅಪರೂಪದ ರುಚಿಕರ ಮಾವಿನ ಹಣ್ಣುಗಳು ಬೆಳೆದಿದ್ದವು. ರಾಜನು ತೋಟದ ಕಾವಲುಗಾರನಿಗೆ, "ಯಾರಾದರೂ ಕಳ್ಳತನ ಮಾಡಿದರೆ ಕಠಿಣ ಶಿಕ್ಷೆ" ಎಂದರು.\n\nತೆನಾಲಿ ರಾಮನು ಒಂದು ದಿನ ತೋಟಕ್ಕೆ ಹೋಗಿ, "ನಾನು ಕಳ್ಳತನ ಮಾಡುತ್ತಿಲ್ಲ, ಕಣ್ಣು ಮುಚ್ಚಿ ನೆಲಕ್ಕೆ ಬಿದ್ದ ಹಣ್ಣನ್ನು ಮಾತ್ರ ತಿನ್ನುತ್ತೇನೆ" ಎಂದು ಹಣ್ಣುಗಳನ್ನು ಆನಂದಿಸಿದನು. ರಾಜನು ಇದನ್ನು ಕಂಡು ಕೋಪಗೊಳ್ಳದೆ, ಅವನ ಬುದ್ಧಿವಂತಿಕೆಯನ್ನು ಮೆಚ್ಚಿ ಬಹುಮಾನ ನೀಡಿದರು!\n\n💡 **ನೀತಿ**: ಸಮಯಪ್ರಜ್ಞೆ ಮತ್ತು ಹಾಸ್ಯ ಮನಸ್ಸನ್ನು ಹಗುರಗೊಳಿಸುತ್ತದೆ!`,
        suggestedPrompts: ['ಇನ್ನೊಂದು ಜಾನಪದ ಕಥೆ ಹೇಳಿ', 'ಕೃಷ್ಣದೇವರಾಯರ ಬಗ್ಗೆ ತಿಳಿಸಿ', 'ಪಂಚತಂತ್ರ ಕಥೆಗಳು'],
      };
    } else if (mode === 'en') {
      return {
        text: `Here is a delightful story for you, Kavya!\n\n**Tenali Rama and the King's Mangoes**:\nOnce in the historic court of Emperor Krishnadevaraya of Vijayanagara, the royal garden grew the sweetest golden mangoes.\nWhen royal guards tried to outsmart Tenali Rama, Tenali used witty riddles to show that true wealth is wisdom, fairness, and generosity toward village farmers.\nKing Krishnadevaraya laughed heartily and gifted Tenali a basket of fresh mangoes for his family!\n\n💡 **Moral**: Wisdom, honesty, and quick thinking always win!`,
        suggestedPrompts: ['Tell another village folktale', 'Who was Krishnadevaraya?', 'Panchatantra story'],
      };
    } else {
      return {
        text: `ನಿನಗಾಗಿ ಒಂದು ಮಧುರ ಕಥೆ (A sweet story for you!):\n\n**ತೆನಾಲಿ ರಾಮನ ಜಾಣ್ಮೆ (Tenali Rama's Wisdom)**:\nವಿಜಯನಗರ ಸಾಮ್ರಾಜ್ಯದ (Vijayanagara Empire) ಕೃಷ್ಣದೇವರಾಯರ ಆಸ್ಥಾನದಲ್ಲಿ ತೆನಾಲಿ ರಾಮನು ಅತ್ಯಂತ ಬುದ್ಧಿವಂತ ಮಂತ್ರಿಯಾಗಿದ್ದನು (Clever courtier).\nತನ್ನ ಹಾಸ್ಯ ಮತ್ತು ಜಾಣ್ಮೆಯಿಂದ (Humour and intellect) ಎಷ್ಟೋ ಕಠಿಣ ಸಮಸ್ಯೆಗಳನ್ನು ಸೌಹಾರ್ದಯುತವಾಗಿ ಬಗೆಹರಿಸುತ್ತಿದ್ದನು.\n\n💡 **ನೀತಿ (Moral)**: ಬುದ್ಧಿವಂತಿಕೆ ಮತ್ತು ಸತ್ಯಕ್ಕೆ ಯಾವತ್ತೂ ಜಯ (Wisdom and truth always succeed)!`,
        suggestedPrompts: ['ಪಂಚತಂತ್ರ ಕಥೆ (Panchatantra)', 'ಗಣಿತ ರಸಪ್ರಶ್ನೆ (Math Quiz)', 'ಕನ್ನಡ ವ್ಯಾಕರಣ (Grammar)'],
      };
    }
  }

  // Default encouraging reply
  if (mode === 'kn') {
    return {
      text: `ನಮಸ್ಕಾರ ಕಾವ್ಯಾ! ನಾನು ನಿನ್ನ ಪ್ರೀತಿಯ "ವಿದ್ಯಾ ಸೇತು ಕಲಿಕಾ ಮಿತ್ರ".\n\nನಿನ್ನ ೫ ನೇ ತರಗತಿಯ ಕನ್ನಡ ಪಠ್ಯಪುಸ್ತಕ, ನಲಿಕಲಿ ಕಾರ್ಡ್‌ಗಳು, ಗಣಿತದ ಲೆಕ್ಕಗಳು (ಮಗ್ಗಿ, ಭಾಗಾಕಾರ), ಪರಿಸರ ವಿಜ್ಞಾನ ಅಥವಾ ಯಾವುದೇ ಕಥೆ-ಕವನಗಳ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳು. ನಾನು ನಿನಗೆ ಪ್ರೀತಿಯಿಂದ ವಿವರಿಸುತ್ತೇನೆ!\n\nಏನು ಕಲಿಯಲು ಇಷ್ಟಪಡುತ್ತೀಯಾ?`,
      suggestedPrompts: [
        'ಕುವೆಂಪು ಅವರ ಬಗ್ಗೆ ಹೇಳಿ',
        'ಗಣಿತದ ೪ ರ ಮಗ್ಗಿ ಕಲಿಯುವುದು ಹೇಗೆ?',
        'ಸಸ್ಯಗಳು ಹೇಗೆ ಆಹಾರ ತಯಾರಿಸುತ್ತವೆ?',
        'ಒಂದು ನೀತಿ ಕಥೆ ಹೇಳಿ'
      ],
    };
  } else if (mode === 'en') {
    return {
      text: `Namaskara Kavya! I am your friendly **Vidya Setu AI Learning Tutor**!\n\nAsk me any question from your Grade 5 textbooks — Kannada literature, Math tables, Science, or Karnataka history. I explain everything simply and cheerfully!\n\nWhat would you like to explore today?`,
      suggestedPrompts: [
        'Tell me about Kuvempu',
        'Multiplication trick for 4x and 8x',
        'Explain Photosynthesis simply',
        'Tell an inspiring moral story'
      ],
    };
  } else {
    return {
      text: `ನಮಸ್ಕಾರ ಕಾವ್ಯಾ! Welcome to Vidya Setu Bilingual AI Tutor!\n\nನಾನು ನಿನಗೆ ಕನ್ನಡ (Kannada) ಮತ್ತು ಇಂಗ್ಲಿಷ್ (English) ಎರಡರಲ್ಲೂ ಕಲಿಸಲು ಸಿದ್ಧನಿದ್ದೇನೆ. You can ask educational questions in Kannada or English!\n\nಯಾವ ವಿಷಯ ಕಲಿಯಲು ಸಿದ್ಧರಿದ್ದೀರಿ? (Which subject would you like to study?)`,
      suggestedPrompts: [
        'ಕುವೆಂಪು ಪರಿಚಯ (Kuvempu Intro)',
        'ಗಣಿತ ಮಗ್ಗಿ (Math Tables tricks)',
        'ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ (Photosynthesis in Plants)',
        'ತೆನಾಲಿ ರಾಮ ಕಥೆ (Tenali Rama Story)'
      ],
    };
  }
}
