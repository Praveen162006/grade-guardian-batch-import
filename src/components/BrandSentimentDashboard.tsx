import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  ThumbsDown, 
  Minus, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  MessageSquare,
  BarChart3,
  Settings,
  Plus,
  Loader2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { BrandSentimentAnalysis, BrandConfig, CommentInput, BrandSentimentStats } from '@/types/BrandSentiment';
import { supabase } from '@/integrations/supabase/client';

interface BrandSentimentDashboardProps {
  brands?: BrandConfig[];
}

const BrandSentimentDashboard: React.FC<BrandSentimentDashboardProps> = ({ brands = [] }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analyses, setAnalyses] = useState<BrandSentimentAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<BrandSentimentStats[]>([]);
  const [newComment, setNewComment] = useState<CommentInput>({
    comment: '',
    brandName: '',
    source: 'manual'
  });
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (brands.length > 0) {
      loadSentimentData();
    }
  }, [brands]);

  const loadSentimentData = async () => {
    setLoading(true);
    try {
      // Load recent sentiment analyses
      const { data: analysisData, error: analysisError } = await supabase
        .from('brand_sentiment_analyses')
        .select(`
          *,
          brand_comments(comment, source, author_name, timestamp),
          brand_configs(name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (analysisError) throw analysisError;
      setAnalyses(analysisData || []);

      // Calculate stats for each brand
      const brandStats = await Promise.all(
        brands.map(async (brand) => {
          const { data: brandAnalyses, error } = await supabase
            .from('brand_sentiment_analyses')
            .select('*')
            .eq('brand_id', brand.id);

          if (error) throw error;

          const totalComments = brandAnalyses?.length || 0;
          const positiveCount = brandAnalyses?.filter(a => a.sentiment === 'positive').length || 0;
          const negativeCount = brandAnalyses?.filter(a => a.sentiment === 'negative').length || 0;
          const neutralCount = brandAnalyses?.filter(a => a.sentiment === 'neutral').length || 0;
          const averageScore = totalComments > 0 
            ? brandAnalyses!.reduce((sum, a) => sum + a.score, 0) / totalComments 
            : 0;

          return {
            brandId: brand.id,
            brandName: brand.name,
            totalComments,
            positiveCount,
            negativeCount,
            neutralCount,
            averageScore,
            alertCount: brandAnalyses?.filter(a => a.alert_triggered).length || 0,
            lastAnalyzed: brandAnalyses?.[0]?.created_at || '',
            trends: [] // TODO: Implement trends calculation
          };
        })
      );

      setStats(brandStats);
    } catch (error: unknown) {
      console.error('Error loading sentiment data:', error);
      toast({
        title: "Error loading data",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeBrandSentiment = async () => {
    if (!newComment.comment.trim() || !newComment.brandName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both comment text and brand name",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('brand-sentiment-analysis', {
        body: {
          comment: newComment.comment,
          brandName: newComment.brandName,
          context: newComment.source
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Analysis Complete",
          description: `Sentiment: ${data.result.sentiment} (Score: ${data.result.score.toFixed(2)})`,
          variant: data.result.sentiment === 'negative' ? 'destructive' : 'default'
        });

        // Clear form and reload data
        setNewComment({ comment: '', brandName: '', source: 'manual' });
        loadSentimentData();
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error: unknown) {
      console.error('Error analyzing sentiment:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Heart className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock data for charts when no real data is available
  const mockTrendData = [
    { date: '2024-01-01', positive: 15, negative: 3, neutral: 8, score: 0.6 },
    { date: '2024-01-02', positive: 12, negative: 5, neutral: 6, score: 0.4 },
    { date: '2024-01-03', positive: 18, negative: 2, neutral: 10, score: 0.7 },
    { date: '2024-01-04', positive: 20, negative: 4, neutral: 12, score: 0.6 },
    { date: '2024-01-05', positive: 16, negative: 6, neutral: 9, score: 0.4 },
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading brand sentiment data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Brand Sentiment Dashboard
          </CardTitle>
          <CardDescription>
            Monitor and analyze sentiment for your brand mentions
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analyze">Analyze</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Comments</p>
                    <p className="text-2xl font-bold">{stats.reduce((sum, s) => sum + s.totalComments, 0)}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Positive</p>
                    <p className="text-2xl font-bold text-green-600">{stats.reduce((sum, s) => sum + s.positiveCount, 0)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Negative</p>
                    <p className="text-2xl font-bold text-red-600">{stats.reduce((sum, s) => sum + s.negativeCount, 0)}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Alerts</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.reduce((sum, s) => sum + s.alertCount, 0)}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="positive" stroke="#22c55e" name="Positive" />
                    <Line type="monotone" dataKey="negative" stroke="#ef4444" name="Negative" />
                    <Line type="monotone" dataKey="neutral" stroke="#6b7280" name="Neutral" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.map(s => ({
                    brand: s.brandName,
                    positive: s.positiveCount,
                    negative: s.negativeCount,
                    neutral: s.neutralCount
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="brand" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="positive" fill="#22c55e" name="Positive" />
                    <Bar dataKey="negative" fill="#ef4444" name="Negative" />
                    <Bar dataKey="neutral" fill="#6b7280" name="Neutral" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analyze" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyze New Comment</CardTitle>
              <CardDescription>
                Manually analyze a comment for brand sentiment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Brand Name</label>
                <Input
                  placeholder="Enter brand name..."
                  value={newComment.brandName}
                  onChange={(e) => setNewComment(prev => ({ ...prev, brandName: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Comment Text</label>
                <Textarea
                  placeholder="Enter comment text to analyze..."
                  value={newComment.comment}
                  onChange={(e) => setNewComment(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Source</label>
                <Input
                  placeholder="e.g., Twitter, Facebook, Review Site..."
                  value={newComment.source}
                  onChange={(e) => setNewComment(prev => ({ ...prev, source: e.target.value }))}
                />
              </div>

              <Button 
                onClick={analyzeBrandSentiment}
                disabled={analyzing || !newComment.comment.trim() || !newComment.brandName.trim()}
                className="w-full"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Sentiment'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Analyses</CardTitle>
              <CardDescription>
                Latest sentiment analyses for your brands
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No sentiment analyses found. Try analyzing some comments first.
                  </p>
                ) : (
                  analyses.map((analysis) => (
                    <div key={analysis.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(analysis.sentiment)}
                          <Badge className={getSentimentColor(analysis.sentiment)}>
                            {analysis.sentiment}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Score: {analysis.score.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(analysis.created_at).toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium">Comment:</p>
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {analysis.brand_comments?.comment || 'Comment not available'}
                      </p>
                      
                      <p className="text-sm font-medium">Analysis:</p>
                      <p className="text-sm text-muted-foreground">
                        {analysis.analysis}
                      </p>
                      
                      {analysis.keywords.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">Keywords:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {analysis.keywords.map((keyword, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Brand Configuration
              </CardTitle>
              <CardDescription>
                Configure brands to monitor and set up alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {brands.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No brands configured yet</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Brand
                    </Button>
                  </div>
                ) : (
                  brands.map((brand) => (
                    <div key={brand.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{brand.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Keywords: {brand.keywords.join(', ')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Alert threshold: {brand.alertThreshold}
                          </p>
                        </div>
                        <Badge variant={brand.monitoringEnabled ? 'default' : 'secondary'}>
                          {brand.monitoringEnabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrandSentimentDashboard;