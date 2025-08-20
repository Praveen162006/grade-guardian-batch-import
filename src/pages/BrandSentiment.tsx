import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import BrandSentimentDashboard from '@/components/BrandSentimentDashboard';
import { BrandConfig } from '@/types/BrandSentiment';
import { supabase } from '@/integrations/supabase/client';

const BrandSentiment = () => {
  const [brands, setBrands] = useState<BrandConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadBrands();
    }
  }, [user]);

  const loadBrands = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // For now, we'll create some mock brands since we haven't set up the database tables yet
      // In a real implementation, this would fetch from the brand_configs table
      const mockBrands: BrandConfig[] = [
        {
          id: '1',
          name: 'Grade Guardian',
          keywords: ['grade guardian', 'gradeguardian', 'grade-guardian'],
          monitoringEnabled: true,
          alertThreshold: -0.3,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Education Platform',
          keywords: ['education platform', 'eduplatform', 'learning management'],
          monitoringEnabled: true,
          alertThreshold: -0.4,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setBrands(mockBrands);
    } catch (error: unknown) {
      console.error('Error loading brands:', error);
      toast({
        title: "Error loading brands",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading brand sentiment dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand Sentiment Analysis</h1>
          <p className="text-gray-600">
            Monitor and analyze sentiment for your brand mentions across various platforms
          </p>
        </div>

        <BrandSentimentDashboard brands={brands} />
      </div>
    </div>
  );
};

export default BrandSentiment;