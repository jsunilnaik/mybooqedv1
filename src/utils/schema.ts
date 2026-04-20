import { buildSalonUrl, getCanonicalUrl } from './seo';
import type { SalonDetail, Category } from '../types/salon';

/**
 * Generates a JSON-LD structured data string for a HairSalon
 * @param salonData The complete salon data object including staff, gallery, and services
 * @param categories Optional array of categories to map service category IDs to names
 * @returns A JSON string to be injected into <script type="application/ld+json">
 */
export function generateSalonSchema(salonData: SalonDetail, categories: Category[] = []): string {
  if (!salonData) return '';

  const urlPath = buildSalonUrl({
    slug: salonData.slug,
    uniqueId: salonData.uniqueId,
    address: salonData.address,
  });
  
  const url = getCanonicalUrl(urlPath);

  // Dynamically determine @type based on services offered
  const schemaTypes = new Set<string>();
  
  if (salonData.services && categories.length > 0) {
    salonData.services.forEach(service => {
      const cat = categories.find(c => c.id === service.categoryId);
      if (cat) {
        const catName = cat.name.toLowerCase();
        if (catName.includes('hair') || catName.includes('beard') || catName.includes('styling')) {
          schemaTypes.add('HairSalon');
        } else if (catName.includes('spa') || catName.includes('massage') || catName.includes('body')) {
          schemaTypes.add('DaySpa');
        } else {
          schemaTypes.add('BeautySalon'); // Catch-all for nails, makeup, waxing, mehendi, facials
        }
      }
    });
  }

  // Fallback to salon name mapping if no services match
  if (schemaTypes.size === 0) {
    const sName = salonData.name.toLowerCase();
    if (sName.includes('spa') || sName.includes('massage')) schemaTypes.add('DaySpa');
    if (sName.includes('beauty') || sName.includes('parlor') || sName.includes('studio') || sName.includes('makeup') || sName.includes('nails')) schemaTypes.add('BeautySalon');
    if (sName.includes('hair') || sName.includes('barber') || sName.includes('cut')) schemaTypes.add('HairSalon');
    if (schemaTypes.size === 0) schemaTypes.add('HairSalon'); // Default fallback
  }

  const finalTypes = Array.from(schemaTypes);

  const schema: any = {
    "@context": "https://schema.org",
    "@type": finalTypes.length === 1 ? finalTypes[0] : finalTypes,
    "name": salonData.name,
    "description": salonData.description,
    "url": url,
    "telephone": salonData.phone || undefined,
  };

  if (salonData.address) {
    schema.address = {
      "@type": "PostalAddress",
      "streetAddress": [salonData.address.line1, salonData.address.area].filter(Boolean).join(', '),
      "addressLocality": salonData.address.city,
      "addressRegion": salonData.address.state,
      "postalCode": salonData.address.pincode,
      "addressCountry": "IN"
    };
  }

  // Map & Location
  if (salonData.coordinates) {
    schema.hasMap = `https://maps.google.com/?q=${salonData.coordinates.lat},${salonData.coordinates.lng}`;
    schema.geo = {
      "@type": "GeoCoordinates",
      "latitude": salonData.coordinates.lat,
      "longitude": salonData.coordinates.lng
    };
  }

  // Opening Hours
  if (salonData.openingHours) {
    const daysMap: Record<string, string> = {
      monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
      thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday"
    };
    const openingHoursSpec: any[] = [];
    Object.entries(salonData.openingHours).forEach(([day, hours]: [string, any]) => {
      if (daysMap[day] && !hours.isClosed && hours.open && hours.close) {
        // Strip out spaces just in case (e.g., "10:00 AM" -> "10:00" if required, though typically it's HH:mm text)
        openingHoursSpec.push({
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": daysMap[day],
          "opens": hours.open,
          "closes": hours.close
        });
      }
    });
    if (openingHoursSpec.length > 0) {
      schema.openingHoursSpecification = openingHoursSpec;
    }
  }

  // Staff
  if (salonData.staff && salonData.staff.length > 0) {
    schema.employee = salonData.staff.map((employee: any) => ({
      "@type": "Person",
      "name": employee.name,
      "jobTitle": employee.role || 'Staff',
      "image": employee.avatar || undefined
    }));
  }

  // Gallery
  if (salonData.gallery && salonData.gallery.length > 0) {
    schema.image = salonData.gallery.map((item: any) => ({
      "@type": "ImageObject",
      "contentUrl": item.imageUrl,
      "caption": item.caption
    }));
  } else if (salonData.images) {
    const backupImages: any[] = [];
    if (salonData.images.cover) {
      backupImages.push({
        "@type": "ImageObject",
        "contentUrl": salonData.images.cover
      });
    }
    if (salonData.images.gallery && salonData.images.gallery.length > 0) {
      salonData.images.gallery.forEach((imgUrl: string) => {
        backupImages.push({
          "@type": "ImageObject",
          "contentUrl": imgUrl
        });
      });
    }
    if (backupImages.length > 0) {
      schema.image = backupImages;
    }
  }

  // Services Menu
  if (salonData.services && salonData.services.length > 0) {
    // Group services by category name (or fallback to id)
    const servicesByCategory = salonData.services.reduce((acc: any, service: any) => {
      const categoryObj = categories.find(c => c.id === service.categoryId);
      const catKey = categoryObj ? categoryObj.name : (service.categoryId || 'General Services');
      if (!acc[catKey]) acc[catKey] = [];
      acc[catKey].push(service);
      return acc;
    }, {});

    const itemListElement = Object.entries(servicesByCategory).map(([catKey, servs]: [string, any]) => ({
      "@type": "OfferCatalog",
      "name": catKey,
      "itemListElement": servs.map((service: any) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service.name,
          "description": service.description || undefined
        },
        "price": service.discountPrice !== null && service.discountPrice !== undefined ? service.discountPrice : service.price,
        "priceCurrency": "INR"
      }))
    }));

    schema.hasOfferCatalog = {
      "@type": "OfferCatalog",
      "name": "Services Menu",
      "itemListElement": itemListElement
    };
  }

  return JSON.stringify(schema, null, 2);
}
