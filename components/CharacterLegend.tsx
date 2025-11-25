
import React from 'react';
import { CharacterType } from '../types';
import { characterTypeDescriptions } from './characterTypeDescriptions';
import { CrownIcon, SkullIcon, UsersIcon, DramaIcon, HeartIcon, GraduationCapIcon, UserIcon } from './icons';

const getCharacterColor = (type: CharacterType): string => {
    switch (type) {
        case CharacterType.PROTAGONIST: return '#fbbF24'; // amber-400
        case CharacterType.ANTAGONIST: return '#f87171'; // red-400
        case CharacterType.DEUTERAGONIST: return '#6ee7b7'; // emerald-300
        case CharacterType.MENTOR: return '#60a5fa'; // blue-400
        case CharacterType.LOVE_INTEREST: return '#f472b6'; // pink-400
        case CharacterType.FOIL: return '#c084fc'; // purple-400
        default: return '#9ca3af'; // gray-400
    }
}

const getCharacterIcon = (type: CharacterType, color: string) => {
    const iconProps = { className: "w-5 h-5 flex-shrink-0", style: { color } };
    switch (type) {
        case CharacterType.PROTAGONIST: return <CrownIcon {...iconProps} />;
        case CharacterType.ANTAGONIST: return <SkullIcon {...iconProps} />;
        case CharacterType.DEUTERAGONIST: return <UsersIcon {...iconProps} />;
        case CharacterType.SUPPORTING_CHARACTER: return <UsersIcon {...iconProps} />;
        case CharacterType.MENTOR: return <GraduationCapIcon {...iconProps} />;
        case CharacterType.LOVE_INTEREST: return <HeartIcon {...iconProps} />;
        case CharacterType.FOIL: return <DramaIcon {...iconProps} />;
        case CharacterType.MINOR_CHARACTER: return <UserIcon {...iconProps} />;
        default: return null;
    }
}

const CharacterLegend: React.FC = () => {
    return (
        <div className="space-y-3">
            {Object.values(CharacterType).map(type => {
                const color = getCharacterColor(type);
                const icon = getCharacterIcon(type, color);
                const description = characterTypeDescriptions[type];
                return (
                    <div key={type} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition">
                        {icon}
                        <div>
                            <p className="font-bold text-sm" style={{color}}>{type}</p>
                            <p className="text-xs text-brand-text-muted leading-relaxed">{description}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CharacterLegend;
