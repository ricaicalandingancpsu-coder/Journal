import { Brush, CloudRain, Flame, Leaf, Moon, Sparkles, Sprout, Sun, Wind } from 'lucide-react';

export const MOODS = [
    { key: 'happy', label: 'Happy', color: '#D9A441', icon: Sun },
    { key: 'grateful', label: 'Grateful', color: '#7FA17B', icon: Sprout },
    { key: 'loved', label: 'Loved', color: '#CF7F8B', icon: Sparkles },
    { key: 'excited', label: 'Excited', color: '#DB8D5C', icon: Brush },
    { key: 'calm', label: 'Calm', color: '#7FA6BA', icon: Leaf },
    { key: 'tired', label: 'Tired', color: '#9C90B4', icon: Moon },
    { key: 'anxious', label: 'Anxious', color: '#AD8FBC', icon: Wind },
    { key: 'sad', label: 'Sad', color: '#7088AE', icon: CloudRain },
    { key: 'angry', label: 'Frustrated', color: '#C06A63', icon: Flame },
];

export const moodByKey = Object.fromEntries(MOODS.map((m) => [m.key, m]));
