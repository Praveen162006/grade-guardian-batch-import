import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrandSentimentRequest {
  comment: string;
  brandName: string;
  context?: string;
}

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1 scale
  confidence: number; // 0 to 1 scale
  analysis: string;
  keywords: string[];
  brandMentions: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { comment, brandName, context }: BrandSentimentRequest = await req.json();
    
    if (!GEMINI_API_KEY) {
      throw new Error("Missing Gemini API key");
    }

    if (!comment || !brandName) {
      throw new Error("Comment and brand name are required");
    }

    console.log(`Analyzing sentiment for brand "${brandName}" in comment:`, comment.substring(0, 100) + "...");

    // Prepare the prompt for sentiment analysis
    const prompt = `
    As a brand sentiment analysis expert, analyze the following comment for sentiment towards the specified brand.

    Brand Name: "${brandName}"
    Comment: "${comment}"
    ${context ? `Context: ${context}` : ''}

    Please provide a comprehensive sentiment analysis including:

    1. Overall Sentiment: Classify as positive, negative, or neutral
    2. Sentiment Score: Provide a numerical score from -1 (very negative) to +1 (very positive)
    3. Confidence Level: How confident are you in this analysis (0-1 scale)
    4. Analysis: Explain the reasoning behind the sentiment classification
    5. Keywords: List key words/phrases that influenced the sentiment
    6. Brand Mentions: Identify all mentions or references to the brand (including variations, misspellings)

    Return your response in this exact JSON format:
    {
      "sentiment": "positive|negative|neutral",
      "score": 0.0,
      "confidence": 0.0,
      "analysis": "detailed explanation",
      "keywords": ["keyword1", "keyword2"],
      "brandMentions": ["mention1", "mention2"]
    }

    Focus on:
    - Direct mentions of the brand name
    - Contextual references to the brand
    - Emotional indicators in the language
    - Overall tone and intent
    - Potential sarcasm or irony
    `;

    // Call Gemini API
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.1, // Low temperature for consistent analysis
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    const data = await response.json();
    console.log("API response status:", response.status);
    
    if (data.error) {
      console.error("Gemini API error:", data.error);
      throw new Error(`Gemini API error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    // Extract and parse the response
    const analysisText = data.candidates[0].content.parts[0].text;
    console.log("Raw AI response:", analysisText);

    // Try to extract JSON from the response
    let sentimentResult: SentimentResult;
    try {
      // Look for JSON in the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        sentimentResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.log("Failed to parse JSON, creating structured response from text");
      // Fallback: parse the response manually
      sentimentResult = parseUnstructuredResponse(analysisText, brandName);
    }

    // Validate and ensure all required fields
    sentimentResult = validateSentimentResult(sentimentResult);

    console.log("Successfully analyzed brand sentiment");
    
    return new Response(JSON.stringify({
      success: true,
      result: sentimentResult,
      brandName,
      originalComment: comment
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in brand-sentiment-analysis function:", error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || "Failed to analyze brand sentiment",
      brandName: "",
      originalComment: ""
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function parseUnstructuredResponse(text: string, brandName: string): SentimentResult {
  // Extract sentiment
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (text.toLowerCase().includes('positive')) {
    sentiment = 'positive';
  } else if (text.toLowerCase().includes('negative')) {
    sentiment = 'negative';
  }

  // Extract score (look for numbers between -1 and 1)
  const scoreMatch = text.match(/-?0?\.\d+|-?1\.0?|0/g);
  let score = 0;
  if (scoreMatch) {
    score = Math.max(-1, Math.min(1, parseFloat(scoreMatch[0])));
  }

  // Default confidence
  const confidence = 0.7;

  return {
    sentiment,
    score,
    confidence,
    analysis: text.substring(0, 500),
    keywords: extractKeywords(text),
    brandMentions: [brandName]
  };
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction
  const words = text.toLowerCase().split(/\W+/);
  const sentimentWords = words.filter(word => 
    ['good', 'bad', 'great', 'terrible', 'love', 'hate', 'amazing', 'awful', 'excellent', 'poor'].includes(word)
  );
  return sentimentWords.slice(0, 5);
}

function validateSentimentResult(result: unknown): SentimentResult {
  const safeResult = result as Record<string, unknown>;
  return {
    sentiment: ['positive', 'negative', 'neutral'].includes(safeResult.sentiment as string) ? safeResult.sentiment as 'positive' | 'negative' | 'neutral' : 'neutral',
    score: typeof safeResult.score === 'number' ? Math.max(-1, Math.min(1, safeResult.score)) : 0,
    confidence: typeof safeResult.confidence === 'number' ? Math.max(0, Math.min(1, safeResult.confidence)) : 0.5,
    analysis: typeof safeResult.analysis === 'string' ? safeResult.analysis : 'No analysis available',
    keywords: Array.isArray(safeResult.keywords) ? (safeResult.keywords as string[]).slice(0, 10) : [],
    brandMentions: Array.isArray(safeResult.brandMentions) ? (safeResult.brandMentions as string[]).slice(0, 5) : []
  };
}