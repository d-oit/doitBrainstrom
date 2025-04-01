// src/components/accessibility/SkipLinks.tsx
import React from 'react';
import { styled } from '@mui/material/styles';
import { useI18n } from '../../contexts/I18nContext';

// Define the styled components
const SkipLinksContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
}));

const SkipLink = styled('a')(({ theme }) => ({
  position: 'absolute',
  top: '-40px',
  left: 0,
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  textDecoration: 'none',
  borderRadius: theme.shape.borderRadius,
  fontWeight: 500,
  zIndex: 9999,
  transition: 'top 0.2s ease-in-out',
  '&:focus': {
    top: 0,
    outline: `3px solid ${theme.palette.secondary.main}`,
  },
}));

interface SkipLinksProps {
  links?: Array<{
    id: string;
    label: string;
  }>;
}

/**
 * SkipLinks component
 * Provides keyboard-accessible links to skip to main content areas
 * These links are visually hidden until focused, making them
 * accessible to keyboard and screen reader users without affecting
 * the visual design for mouse users.
 */
const SkipLinks: React.FC<SkipLinksProps> = ({ links = [] }) => {
  const { t } = useI18n();
  
  // Default links if none provided
  const defaultLinks = [
    {
      id: 'main-content',
      label: t('accessibility.skipToMainContent')
    },
    {
      id: 'navigation',
      label: t('accessibility.skipToNavigation')
    }
  ];
  
  // Use provided links or defaults
  const skipLinks = links.length > 0 ? links : defaultLinks;
  
  return (
    <SkipLinksContainer aria-label={t('accessibility.skipLinks')}>
      {skipLinks.map((link) => (
        <SkipLink
          key={link.id}
          href={`#${link.id}`}
          onClick={(e) => {
            // Prevent default behavior to handle focus manually
            e.preventDefault();
            
            // Find the target element
            const target = document.getElementById(link.id);
            
            if (target) {
              // Set tabindex to make it focusable if it isn't already
              if (!target.hasAttribute('tabindex')) {
                target.setAttribute('tabindex', '-1');
              }
              
              // Focus the element
              target.focus();
              
              // Update URL hash
              window.location.hash = link.id;
            }
          }}
        >
          {link.label}
        </SkipLink>
      ))}
    </SkipLinksContainer>
  );
};

export default SkipLinks;
