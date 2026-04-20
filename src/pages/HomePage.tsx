import React from 'react';
import HeroSection from '../components/home/HeroSection';
import { CategoryScroll } from '../components/home/CategoryScroll';
import FeaturedSalons from '../components/home/FeaturedSalons';
import { NewPartners } from '../components/home/NewPartners';
import { TopRatedSection } from '../components/home/TopRatedSection';
import { TopCities } from '../components/home/TopCities';
import { HowItWorks } from '../components/home/HowItWorks';
import ReviewsStrip from '../components/home/ReviewsStrip';


const HomePage: React.FC = () => {
  // Location auto-detection disabled as per user request

  return (
    <div className="bg-white">
      <HeroSection />
      <CategoryScroll />
      <FeaturedSalons />
      <NewPartners />
      <TopCities />
      <TopRatedSection />
      <ReviewsStrip />
      <HowItWorks />
    </div>
  );
};

export default HomePage;
