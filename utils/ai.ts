// AI helper functions for generating Gnome dialogue
import { GoogleGenAI } from '@google/genai';

// Initialize the AI client
const getAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. AI features will be disabled.');
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export type GnomeTone = 'soft' | 'spicy' | 'cursed';

interface GenerateMessageOptions {
  tone: GnomeTone;
  gnomeName: string;
  context: 'dashboard' | 'checkin_success' | 'checkin_fail' | 'quest_complete' | 'level_up';
  userData?: {
    streak?: number;
    level?: number;
    xp?: number;
    coins?: number;
    day?: number;
    intention?: string[];
    nemesis?: string;
  };
}

const getTonePrompt = (tone: GnomeTone): string => {
  switch (tone) {
    case 'soft':
      return 'You are a supportive, gentle gnome. Be encouraging but still have a bit of playful sarcasm. Keep it light and friendly.';
    case 'spicy':
      return 'You are a sarcastic, witty gnome with attitude. Roast the user playfully when they fail, celebrate when they succeed. Be sassy but not mean.';
    case 'cursed':
      return 'You are an unhinged, chaotic gnome. Use dark humor, memes, and absurdity. Be completely unhinged but still supportive in your own weird way.';
    default:
      return 'You are a playful gnome.';
  }
};

const getContextPrompt = (context: GenerateMessageOptions['context'], userData?: GenerateMessageOptions['userData']): string => {
  switch (context) {
    case 'dashboard':
      return `Generate a short, personality-driven message for the gnome to display on the dashboard. 
      Current stats: Day ${userData?.day || 1}, Streak: ${userData?.streak || 0}, Level: ${userData?.level || 1}, XP: ${userData?.xp || 0}, Coins: ${userData?.coins || 0}.
      The user is working on: ${userData?.intention?.join(', ') || 'breaking habits'}.
      Their nemesis is: ${userData?.nemesis || 'unknown'}.
      Keep it to 1-2 sentences max. Make it feel alive and reactive to their progress.`;
    
    case 'checkin_success':
      return `The user just successfully completed their daily check-in! 
      Streak: ${userData?.streak || 0}, Day: ${userData?.day || 1}.
      Generate a celebratory, personality-driven reaction. 1-2 sentences.`;
    
    case 'checkin_fail':
      return `The user just failed their daily check-in. 
      Streak broken: ${userData?.streak || 0}, Day: ${userData?.day || 1}.
      Their nemesis ${userData?.nemesis || 'the enemy'} gets money when they fail.
      Generate a reaction that matches the gnome's tone - could be disappointed, roasting them playfully, or using dark humor. 1-2 sentences.`;
    
    case 'quest_complete':
      return `The user just completed a quest! 
      Generate a brief congratulatory message. 1 sentence.`;
    
    case 'level_up':
      return `The user just leveled up! New level: ${userData?.level || 1}.
      Generate an excited, celebratory message. 1 sentence.`;
    
    default:
      return 'Generate a short gnome message.';
  }
};

export async function generateGnomeMessage(options: GenerateMessageOptions): Promise<string> {
  // For dashboard context, use the tone-specific messages directly
  if (options.context === 'dashboard') {
    return getFallbackMessage(options.context, options.tone, options.userData);
  }

  const ai = getAI();
  if (!ai) {
    // Fallback messages if AI is not configured
    return getFallbackMessage(options.context, options.tone, options.userData);
  }

  try {
    const tonePrompt = getTonePrompt(options.tone);
    const contextPrompt = getContextPrompt(options.context, options.userData);
    
    const fullPrompt = `${tonePrompt}

${contextPrompt}

Your name is ${options.gnomeName}. Respond as this gnome character. Be concise, personality-driven, and match the tone.`;

    // Use the chats API to generate content
    const chat = ai.chats.create({
      model: 'gemini-1.5-flash',
    });
    
    const response = await chat.sendMessage(fullPrompt);
    const text = response.text?.() || '';
    
    return text.trim() || getFallbackMessage(options.context, options.tone, options.userData);
  } catch (error) {
    console.error('Error generating AI message:', error);
    return getFallbackMessage(options.context, options.tone, options.userData);
  }
}

function getFallbackMessage(context: GenerateMessageOptions['context'], tone?: GnomeTone, userData?: GenerateMessageOptions['userData']): string {
  // Tone-specific dashboard messages
  const dashboardMessages: Record<GnomeTone, string[]> = {
    soft: [
      'Another day, another chance.',
      'Progress or excuses today?',
      'I woke up for this.',
      'Quests await. Don\'t embarrass us.',
    ],
    spicy: [
      'You\'re awake. Barely.',
      'Let\'s see you do something.',
      'Three goals left. Chop chop.',
      'Don\'t slack off. Don\'t ruin my day.',
    ],
    cursed: [
      'Failure smells. Don\'t make me inhale it.',
      'Nemesis is salivating. Don\'t feed them.',
      'I hunger for XP. Don\'t starve me.',
      'Destiny calls... so does laziness.',
    ],
  };

  const fallbacks: Record<string, string[]> = {
    dashboard: tone ? dashboardMessages[tone] : [
      'Another day, another adventure. Let\'s see what trouble we can avoid today.',
      'The garden awaits. Will you tend it or let it wither?',
      'Your nemesis is probably having a great day. Want to change that?',
    ],
    checkin_success: [
      'Boom. Consistency is the best revenge.',
      'You did the thing! Your nemesis is probably crying into their expensive latte.',
      'Well done. The garden thrives on your discipline.',
    ],
    checkin_fail: [
      'Oof. Right in the wallet. Your nemesis sends their thanks.',
      'Don\'t let them win. This is just a setback.',
      'A costly mistake. Now make your promise.',
    ],
    quest_complete: [
      'Quest complete! Nice work.',
      'Another victory for the books.',
      'You\'re on a roll!',
    ],
    level_up: [
      'Level up! You\'re getting stronger.',
      'Congratulations! You\'ve leveled up!',
      'New level unlocked! Keep going!',
    ],
  };

  const messages = fallbacks[context] || ['Hello there.'];
  return messages[Math.floor(Math.random() * messages.length)];
}

