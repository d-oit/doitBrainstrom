import { configureAxe } from 'axe-core';

export const axeConfig = configureAxe({
  rules: [
    // Example of customizing rules
    { id: 'color-contrast', enabled: true },
    { id: 'aria-roles', enabled: true },
    { id: 'button-name', enabled: true },
    { id: 'image-alt', enabled: true },
    { id: 'label', enabled: true },
    { id: 'link-name', enabled: true },
  ],
});
