import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { JobsMarketplace } from '@/components/marketplace/JobsMarketplace';
import { JobBoardHeroSection } from '@/components/marketplace/JobBoardHeroSection';
import { JobBoardStatsBar } from '@/components/marketplace/JobBoardStatsBar';
import { JobBoardSidebar } from '@/components/marketplace/JobBoardSidebar';
import { JobBoardFloatingActions } from '@/components/marketplace/JobBoardFloatingActions';
import { ScrollProgress } from '@/components/professionals/ScrollProgress';

export default function JobBoardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleQuickFilter = (filter: string) => {
    setQuickFilter(filter);
  };

  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <JobBoardHeroSection 
          onSearch={handleSearch}
          onQuickFilter={handleQuickFilter}
        />

        {/* Stats Bar */}
        <JobBoardStatsBar />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <JobsMarketplace 
              searchQuery={searchQuery}
              quickFilter={quickFilter}
            />
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="hidden lg:block"
          >
            <JobBoardSidebar />
          </motion.div>
        </div>
      </div>

      {/* Mobile Floating Actions */}
      <JobBoardFloatingActions />
    </div>
  );
}
