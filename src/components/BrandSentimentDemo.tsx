import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const BrandSentimentDemo = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [newComment, setNewComment] = useState({
    comment: '',
    brandName: 'Grade Guardian',
    source: 'manual'
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [mockAnalysis, setMockAnalysis] = useState<{
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    confidence: number;
    analysis: string;
    keywords: string[];
    brandMentions: string[];
  } | null>(null);

  // Mock data for demonstration
  const mockStats = [
    {
      brandId: '1',
      brandName: 'Grade Guardian',
      totalComments: 45,
      positiveCount: 28,
      negativeCount: 8,
      neutralCount: 9,
      averageScore: 0.6,
      alertCount: 2,
      lastAnalyzed: new Date().toISOString()
    },
    {
      brandId: '2',
      brandName: 'Education Platform',
      totalComments: 32,
      positiveCount: 20,
      negativeCount: 5,
      neutralCount: 7,
      averageScore: 0.7,
      alertCount: 1,
      lastAnalyzed: new Date().toISOString()
    }
  ];

  const mockBrands = [
    {
      id: '1',
      name: 'Grade Guardian',
      keywords: ['grade guardian', 'gradeguardian', 'grade-guardian'],
      monitoringEnabled: true,
      alertThreshold: -0.3
    },
    {
      id: '2',
      name: 'Education Platform',
      keywords: ['education platform', 'eduplatform', 'learning management'],
      monitoringEnabled: true,
      alertThreshold: -0.4
    }
  ];

  const mockTrendData = [
    { date: '2024-01-01', positive: 15, negative: 3, neutral: 8, score: 0.6 },
    { date: '2024-01-02', positive: 12, negative: 5, neutral: 6, score: 0.4 },
    { date: '2024-01-03', positive: 18, negative: 2, neutral: 10, score: 0.7 },
    { date: '2024-01-04', positive: 20, negative: 4, neutral: 12, score: 0.6 },
    { date: '2024-01-05', positive: 16, negative: 6, neutral: 9, score: 0.4 },
  ];

  const mockAnalyses = [
    {
      id: '1',
      sentiment: 'positive',
      score: 0.8,
      confidence: 0.9,
      analysis: 'The comment expresses high satisfaction with Grade Guardian\'s user interface and functionality. Key positive indicators include "love", "amazing", and "easy to use".',
      keywords: ['love', 'amazing', 'easy'],
      brandMentions: ['Grade Guardian'],
      created_at: new Date().toISOString(),
      brand_comments: {
        comment: 'I absolutely love Grade Guardian! The interface is amazing and so easy to use for tracking student progress.',
        source: 'manual',
        author_name: 'Teacher Jane'
      }
    },
    {
      id: '2',
      sentiment: 'negative',
      score: -0.6,
      confidence: 0.8,
      analysis: 'The comment indicates frustration with the platform. Negative sentiment is driven by words like "horrible", "crashes", and "waste of time".',
      keywords: ['horrible', 'crashes', 'waste'],
      brandMentions: ['Grade Guardian'],
      created_at: new Date(Date.now() - 3600000).toISOString(),
      brand_comments: {
        comment: 'Grade Guardian is horrible! It keeps crashing and is a waste of time.',
        source: 'manual',
        author_name: 'Frustrated User'
      }
    },
    {
      id: '3',
      sentiment: 'neutral',
      score: 0.1,
      confidence: 0.7,
      analysis: 'The comment provides a balanced view with both positive and negative aspects mentioned. Overall neutral due to mixed sentiment indicators.',
      keywords: ['okay', 'decent', 'could be better'],
      brandMentions: ['Grade Guardian'],
      created_at: new Date(Date.now() - 7200000).toISOString(),
      brand_comments: {
        comment: 'Grade Guardian is okay for basic student management. It\'s decent but could be better.',
        source: 'manual',
        author_name: 'Neutral User'
      }
    }
  ];

  const simulateAnalysis = async () => {
    if (!newComment.comment.trim() || !newComment.brandName.trim()) {
      alert('Please provide both comment text and brand name');
      return;
    }

    setAnalyzing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simple sentiment analysis simulation
    const lowerComment = newComment.comment.toLowerCase();
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let score = 0;
    
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'awesome', 'fantastic', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'horrible', 'awful', 'hate', 'worst', 'useless', 'crashes'];
    
    const positiveCount = positiveWords.filter(word => lowerComment.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerComment.includes(word)).length;
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      score = Math.min(0.9, 0.3 + (positiveCount * 0.2));
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      score = Math.max(-0.9, -0.3 - (negativeCount * 0.2));
    } else {
      sentiment = 'neutral';
      score = 0.1;
    }

    const result = {
      sentiment,
      score,
      confidence: 0.8,
      analysis: `Demo analysis: This comment shows ${sentiment} sentiment towards ${newComment.brandName}. Score: ${score.toFixed(2)}`,
      keywords: positiveCount > 0 ? positiveWords.filter(w => lowerComment.includes(w)) : 
                negativeCount > 0 ? negativeWords.filter(w => lowerComment.includes(w)) : ['neutral'],
      brandMentions: [newComment.brandName]
    };

    setMockAnalysis(result);
    setAnalyzing(false);
    
    // Clear form
    setNewComment({ comment: '', brandName: 'Grade Guardian', source: 'manual' });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand Sentiment Analysis</h1>
          <p className="text-gray-600">
            Monitor and analyze sentiment for your brand mentions across various platforms
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">🚀 Demo Mode</p>
            <p className="text-blue-700 text-sm">
              This is a demonstration of the Brand Sentiment Analysis feature. The AI analysis is simulated for demo purposes.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Brand Sentiment Dashboard
              </CardTitle>
              <CardDescription>
                Automated sentiment analysis for brand mentions
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
                        <p className="text-2xl font-bold">{mockStats.reduce((sum, s) => sum + s.totalComments, 0)}</p>
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
                        <p className="text-2xl font-bold text-green-600">{mockStats.reduce((sum, s) => sum + s.positiveCount, 0)}</p>
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
                        <p className="text-2xl font-bold text-red-600">{mockStats.reduce((sum, s) => sum + s.negativeCount, 0)}</p>
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
                        <p className="text-2xl font-bold text-orange-600">{mockStats.reduce((sum, s) => sum + s.alertCount, 0)}</p>
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
                      <BarChart data={mockStats.map(s => ({
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
                    Manually analyze a comment for brand sentiment (Demo Mode - Simulated Analysis)
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
                      placeholder="Enter comment text to analyze (try words like 'love', 'great', 'terrible', 'horrible')..."
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
                    onClick={simulateAnalysis}
                    disabled={analyzing || !newComment.comment.trim() || !newComment.brandName.trim()}
                    className="w-full"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Sentiment (Demo)'
                    )}
                  </Button>

                  {mockAnalysis && (
                    <div className="mt-6 p-4 border rounded-lg bg-card">
                      <h3 className="font-medium mb-2">Analysis Result:</h3>
                      <div className="flex items-center gap-2 mb-2">
                        {getSentimentIcon(mockAnalysis.sentiment)}
                        <Badge className={getSentimentColor(mockAnalysis.sentiment)}>
                          {mockAnalysis.sentiment}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Score: {mockAnalysis.score.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{mockAnalysis.analysis}</p>
                      <div>
                        <p className="text-sm font-medium">Keywords:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {mockAnalysis.keywords.map((keyword: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Analyses</CardTitle>
                  <CardDescription>
                    Latest sentiment analyses for your brands (Demo Data)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalyses.map((analysis) => (
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
                          {analysis.brand_comments.comment}
                        </p>
                        
                        <p className="text-sm font-medium">Analysis:</p>
                        <p className="text-sm text-muted-foreground">
                          {analysis.analysis}
                        </p>
                        
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
                      </div>
                    ))}
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
                    Configure brands to monitor and set up alerts (Demo Data)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockBrands.map((brand) => (
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
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default BrandSentimentDemo;