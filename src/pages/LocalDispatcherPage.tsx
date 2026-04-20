import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { salonService } from '../lib/dataService';
import SalonDetailPage from './SalonDetailPage';
import CityPage from './CityPage';

/**
 * LocalDispatcherPage
 * Acts as a traffic controller for ambiguous /salons-in/:citySlug/:subSlug routes.
 * It determines if :subSlug is a specific Salon or a Neighborhood and renders the 
 * appropriate component.
 */
const LocalDispatcherPage: React.FC = () => {
  const { businessSlug } = useParams<{ businessSlug: string }>();

  const isSalon = useMemo(() => {
    if (!businessSlug) return false;
    
    // 1. Try matching by slug directly
    const salonBySlug = salonService.getBySlug(businessSlug);
    if (salonBySlug) return true;

    // 2. Try parsing uniqueId if present (hyphenated 5-char tail)
    const lastHyphenIndex = businessSlug.lastIndexOf('-');
    if (lastHyphenIndex !== -1 && businessSlug.length - lastHyphenIndex - 1 === 5) {
      const uniqueId = businessSlug.substring(lastHyphenIndex + 1);
      const salonById = salonService.getByUniqueId(uniqueId);
      if (salonById) return true;
    }

    return false;
  }, [businessSlug]);

  if (isSalon) {
    return <SalonDetailPage />;
  }

  // Otherwise, treat it as a Neighborhood and render CityPage.
  return <CityPage />;
};

export default LocalDispatcherPage;
