import React from 'react';
import { PlayerAppearance, FaceId, HairId, SkinColorId, HairColorId } from '../../types';
import { ALL_SKIN_COLOR_OPTIONS, ALL_HAIR_COLOR_OPTIONS } from '../../constants';

interface PlayerAvatarProps {
  appearance: PlayerAppearance;
  className?: string;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ appearance, className }) => {
  const skinColorHex = ALL_SKIN_COLOR_OPTIONS.find(c => c.id === appearance.skinColor)?.hexColor || '#CD853F'; // Default medium skin
  const hairColorHex = ALL_HAIR_COLOR_OPTIONS.find(c => c.id === appearance.hairColor)?.hexColor || '#A0522D'; // Default brown hair

  let facePath;
  switch (appearance.faceId) {
    case FaceId.FACE_1: // Standard Oval
      facePath = <ellipse cx="50" cy="53" rx="32" ry="38" fill={skinColorHex} />;
      break;
    case FaceId.FACE_2: // Slightly Wider/Rounder
      facePath = <circle cx="50" cy="50" r="36" fill={skinColorHex} />;
      break;
    case FaceId.FACE_3: // More Defined/Slightly Angular
      facePath = <rect x="15" y="18" width="70" height="74" rx="15" fill={skinColorHex} />;
      break;
    default:
      facePath = <circle cx="50" cy="50" r="35" fill={skinColorHex} />;
  }

  let hairPath;
  // Adjusted hair paths for better appearance and differentiation
  switch (appearance.hairId) {
    case HairId.HAIR_1: // Short, neat
      hairPath = (
        <path
          d="M20,45 Q50,25 80,45 L78,55 Q50,40 22,55 Z M25,42 Q50,20 75,42 A35,35 0 0,0 25,42"
          fill={hairColorHex}
        />
      );
      break;
    case HairId.HAIR_2: // Medium Bob-like
      hairPath = (
        <path
          d="M18,38 Q50,20 82,38 L75,65 Q50,55 25,65 Z"
          fill={hairColorHex}
        />
      );
      break;
    case HairId.HAIR_3: // Longer, flowing
      hairPath = (
        <path
          d="M15,35 Q50,18 85,35 L80,80 Q50,70 20,80 Z"
          fill={hairColorHex}
        />
      );
      break;
    case HairId.HAIR_4: // Spiky
      hairPath = (
        <>
          <path d="M25 45 L30 30 L40 40 L50 25 L60 40 L70 30 L75 45 Z" fill={hairColorHex} />
          <path d="M28 43 L33 28 L43 38 L53 23 L63 38 L73 28 L78 43 Z" fill={hairColorHex} transform="translate(0, 2)" />
        </>
      );
      break;
    case HairId.HAIR_5: // Bun/Updo
      hairPath = (
        <>
          <path d="M22,40 Q50,28 78,40 L75,60 Q50,50 25,60 Z" fill={hairColorHex} />
          <circle cx="50" cy="25" r="13" fill={hairColorHex} />
          <circle cx="50" cy="25" r="10" fill={hairColorHex} stroke={skinColorHex} strokeWidth="1"/>
        </>
      );
      break;
    default:
      hairPath = <circle cx="50" cy="30" r="25" fill={hairColorHex} />;
  }

  // Eyes with pupils
  const eyes = (
    <>
      <ellipse cx="38" cy="50" rx="5" ry="6" fill="white" />
      <ellipse cx="62" cy="50" rx="5" ry="6" fill="white" />
      <circle cx="38" cy="51" r="2.5" fill="#333" />
      <circle cx="62" cy="51" r="2.5" fill="#333" />
       {/* Eyebrows */}
      <path d="M32 42 Q38 40 44 42" stroke="#543b24" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M56 42 Q62 40 68 42" stroke="#543b24" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </>
  );

  // Simple smile
  const smile = <path d="M40,65 Q50,72 60,65" stroke="#D97706" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  
  // Subtle nose
  const nose = <path d="M48 56 Q50 59 52 56" stroke={skinColorHex} strokeWidth="2" fill="none" strokeLinecap="round" style={{filter: 'brightness(0.85)'}}/>;


  return (
    <svg viewBox="0 0 100 100" className={className || "w-full h-full"}>
      {facePath}
      {/* Hair should be rendered after face but before eyes/mouth for layering */}
      {hairPath}
      {eyes}
      {nose}
      {smile}
    </svg>
  );
};

export default PlayerAvatar;
