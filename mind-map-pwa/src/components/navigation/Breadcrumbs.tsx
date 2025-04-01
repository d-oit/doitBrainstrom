// src/components/navigation/Breadcrumbs.tsx
import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import '../../styles/breadcrumbs.css';

interface BreadcrumbsProps {
  currentTab: number;
  onTabChange: (tabIndex: number) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentTab, onTabChange }) => {
  const { t } = useI18n();
  
  // Get the current tab name
  const getCurrentTabName = () => {
    switch (currentTab) {
      case 0:
        return t('tabs.mindMap');
      case 1:
        return t('tabs.s3Connection');
      case 2:
        return t('tabs.sampleCards');
      default:
        return '';
    }
  };
  
  return (
    <nav className="breadcrumbs" aria-label={t('navigation.breadcrumbsLabel')}>
      <div className="breadcrumb-item">
        <button 
          className="breadcrumb-link"
          onClick={() => onTabChange(0)}
        >
          {t('app.title')}
        </button>
      </div>
      
      <div className="breadcrumb-item">
        <span className="breadcrumb-separator" aria-hidden="true">/</span>
      </div>
      
      <div className="breadcrumb-item">
        <span className="breadcrumb-current">{getCurrentTabName()}</span>
      </div>
    </nav>
  );
};

export default Breadcrumbs;