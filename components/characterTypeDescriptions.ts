
import { CharacterType } from '../types';

export const characterTypeDescriptions: Record<CharacterType, string> = {
  [CharacterType.PROTAGONIST]: "The main character the story follows, whose fate is most closely tied to the resolution of the plot.",
  [CharacterType.ANTAGONIST]: "The primary character or force that opposes the protagonist, creating the central conflict of the story.",
  [CharacterType.DEUTERAGONIST]: "A secondary main character who is crucial to the plot and often serves as a close companion or counterpoint to the protagonist.",
  [CharacterType.MENTOR]: "A wise and experienced character who guides, teaches, or provides aid to the protagonist.",
  [CharacterType.LOVE_INTEREST]: "A character with whom another key character, often the protagonist, has a romantic relationship or tension.",
  [CharacterType.FOIL]: "A character who contrasts with the protagonist to highlight particular qualities or traits of the main character.",
  [CharacterType.SUPPORTING_CHARACTER]: "A recurring character who has a significant role in the story but is not the primary focus.",
  [CharacterType.MINOR_CHARACTER]: "A character with a small, often brief role, used to advance the plot or reveal information about other characters.",
};
