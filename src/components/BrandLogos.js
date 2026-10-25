import React from 'react';

export const BrandLogo = ({ brandId, isActive }) => {
  const iconColor = isActive ? '#000000' : '#8a909d';

  switch (brandId) {
    case 'mahindra':
    case 'mahindra-thar':
    case 'mahindra-scorpio':
      return (
        <svg viewBox="0 0 44 40" width="38" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Mahindra Twin Peaks Logo */}
          <path
            d="M8 28L18 8L22 17L14 28H8Z"
            fill={isActive ? '#c48937' : '#8a909d'}
          />
          <path
            d="M36 28L26 8L22 17L30 28H36Z"
            fill={isActive ? '#c48937' : '#8a909d'}
          />
          <path
            d="M22 19L19 25H25L22 19Z"
            fill={isActive ? '#111111' : '#a0a6b2'}
          />
        </svg>
      );

    case 'tata':
      return (
        <svg viewBox="0 0 44 40" width="38" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Tata Motors Ring & T-Wing Crest */}
          <ellipse cx="22" cy="20" rx="18" ry="14" stroke={iconColor} strokeWidth="1.8" />
          <path
            d="M12 14C17 14 20 18 22 25C24 18 27 14 32 14"
            stroke={isActive ? '#00539C' : '#8a909d'}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M15 14H29"
            stroke={isActive ? '#00539C' : '#8a909d'}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'toyota':
      return (
        <svg viewBox="0 0 44 40" width="38" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Toyota Triple Ovals */}
          <ellipse cx="22" cy="20" rx="19" ry="13" stroke={iconColor} strokeWidth="1.8" />
          <ellipse cx="22" cy="18" rx="8" ry="11" stroke={iconColor} strokeWidth="1.6" />
          <ellipse cx="22" cy="14" rx="14" ry="5" stroke={iconColor} strokeWidth="1.6" />
        </svg>
      );

    case 'hyundai':
      return (
        <svg viewBox="0 0 44 40" width="38" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Hyundai Slanted H in Oval */}
          <ellipse
            cx="22"
            cy="20"
            rx="18"
            ry="13"
            stroke={iconColor}
            strokeWidth="1.8"
            transform="rotate(-8 22 20)"
          />
          <path
            d="M15 27L19 13H21L17 27H15Z"
            fill={isActive ? '#002C6C' : '#8a909d'}
          />
          <path
            d="M27 27L29 13H31L29 27H27Z"
            fill={isActive ? '#002C6C' : '#8a909d'}
          />
          <path
            d="M17 19.5C20 18.5 24 18.5 28 20.5"
            stroke={isActive ? '#002C6C' : '#8a909d'}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'maruti':
    case 'maruti-suzuki':
      return (
        <svg viewBox="0 0 44 40" width="38" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Suzuki 'S' Mark */}
          <path
            d="M30 11H18L14 18L24 22L14 30H26L30 23L20 19L30 11Z"
            fill={isActive ? '#E31E24' : '#8a909d'}
          />
        </svg>
      );

    case 'renault':
      return (
        <svg viewBox="0 0 44 40" width="38" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Renault Diamond Crest */}
          <path
            d="M22 6L33 20L22 34L11 20L22 6Z"
            stroke={isActive ? '#FFCC00' : iconColor}
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path
            d="M22 13L27 20L22 27L17 20L22 13Z"
            stroke={isActive ? '#111111' : '#94a3b8'}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'kia':
      return (
        <svg viewBox="0 0 44 40" width="40" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* New Modern Connected KIA Wordmark */}
          <path
            d="M8 27V13L16 27V13M19 13V27M24 27L28 13L32 27M25.5 22H30.5"
            stroke={iconColor}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'mg':
      return (
        <svg viewBox="0 0 44 40" width="38" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Morris Garages Octagon Badge */}
          <polygon
            points="14,9 30,9 37,16 37,24 30,31 14,31 7,24 7,16"
            stroke={iconColor}
            strokeWidth="1.8"
            fill="none"
          />
          <text
            x="22"
            y="23"
            textAnchor="middle"
            fill={iconColor}
            fontSize="10"
            fontWeight="900"
            fontFamily="sans-serif"
            letterSpacing="-0.5"
          >
            MG
          </text>
        </svg>
      );

    case 'honda':
      return (
        <svg viewBox="0 0 44 40" width="38" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Honda Trapezoid H Badge */}
          <path
            d="M10 11L12 29H32L34 11H10Z"
            stroke={iconColor}
            strokeWidth="1.8"
            fill="none"
            rx="2"
          />
          <path
            d="M15 13V27M29 13V27M15 20H29"
            stroke={iconColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 40 40" width="34" height="34" fill="none">
          <circle cx="20" cy="20" r="16" stroke={iconColor} strokeWidth="1.8" />
        </svg>
      );
  }
};
