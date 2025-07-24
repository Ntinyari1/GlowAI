import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, Calendar, Sparkles } from "lucide-react";
import SkinQuestionnaire from "@/components/skin-questionnaire";

export default function Home() {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [activeFeature, setActiveFeature] = useState<'tips' | 'reviews' | 'glow'>('tips');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
              Your Personalized Skincare
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"> Journey</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get AI-powered skincare advice, honest product reviews, and personalized routines 
              tailored specifically for your skin's unique needs.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              onClick={() => setShowQuestionnaire(true)}
              className="glow-gradient text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="mr-2 w-5 h-5" />
              Start Your Glow Journey
            </Button>
            <Link href="/tips">
              <Button variant="ghost" className="text-glow-pink font-semibold px-8 py-4 text-lg hover:bg-white/50">
                Learn More
              </Button>
            </Link>
          </div>
          
          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow" onClick={() => setActiveFeature('tips')} style={{ cursor: 'pointer', border: activeFeature === 'tips' ? '2px solid #ec4899' : 'none' }}>
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Heart className="text-white w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Personalized Tips</h3>
                <p className="text-gray-600">AI-curated advice for your unique skin type and concerns</p>
              </CardContent>
            </Card>
            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow" onClick={() => setActiveFeature('reviews')} style={{ cursor: 'pointer', border: activeFeature === 'reviews' ? '2px solid #a78bfa' : 'none' }}>
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Star className="text-white w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Smart Reviews</h3>
                <p className="text-gray-600">Honest, AI-analyzed product reviews you can trust</p>
              </CardContent>
            </Card>
            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow" onClick={() => setActiveFeature('glow')} style={{ cursor: 'pointer', border: activeFeature === 'glow' ? '2px solid #3b82f6' : 'none' }}>
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Calendar className="text-white w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Daily Glow</h3>
                <p className="text-gray-600">3 daily posts to keep your skincare game strong</p>
              </CardContent>
            </Card>
          </div>
          {/* Feature Tab Content */}
          <div className="mt-8 max-w-3xl mx-auto text-center">
            {activeFeature === 'tips' && (
              <div>
                <h4 className="text-2xl font-bold mb-2 text-pink-500">Personalized Tips</h4>
                <p className="text-gray-700 mb-4">Get AI-powered advice tailored to your skin type, goals, and concerns. Answer a few questions and receive daily tips to help you glow!</p>
                <Button onClick={() => setShowQuestionnaire(true)} className="bg-pink-500 text-white">Start Questionnaire</Button>
              </div>
            )}
            {activeFeature === 'reviews' && (
              <div>
                <h4 className="text-2xl font-bold mb-2 text-purple-500">Smart Reviews</h4>
                <p className="text-gray-700 mb-4">See honest, AI-analyzed reviews for thousands of skincare products. Find what works for you, avoid what doesn't, and share your own experiences.</p>
                <Button asChild className="bg-purple-500 text-white"><a href="/products">Browse Products</a></Button>
              </div>
            )}
            {activeFeature === 'glow' && (
              <div>
                <h4 className="text-2xl font-bold mb-2 text-blue-500">Daily Glow</h4>
                <p className="text-gray-700 mb-4">Get 3 daily posts with tips, reminders, and motivation to keep your skincare routine on track. Stay consistent and see results!</p>
                <Button asChild className="bg-blue-500 text-white"><a href="/tips">See Today's Glow</a></Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Explore GlowAI</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover everything you need for your perfect skincare routine</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/dashboard">
              <Card className="h-32 cursor-pointer hover:shadow-lg transition-shadow border-none bg-gradient-to-br from-pink-100 to-pink-200">
                <CardContent className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-semibold text-gray-800">Dashboard</h3>
                  <p className="text-sm text-gray-600">Track your progress</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/tips">
              <Card className="h-32 cursor-pointer hover:shadow-lg transition-shadow border-none bg-gradient-to-br from-purple-100 to-purple-200">
                <CardContent className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="text-2xl mb-2">💡</div>
                  <h3 className="font-semibold text-gray-800">Daily Tips</h3>
                  <p className="text-sm text-gray-600">AI-powered advice</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/products">
              <Card className="h-32 cursor-pointer hover:shadow-lg transition-shadow border-none bg-gradient-to-br from-blue-100 to-blue-200">
                <CardContent className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="text-2xl mb-2">🧴</div>
                  <h3 className="font-semibold text-gray-800">Products</h3>
                  <p className="text-sm text-gray-600">Smart reviews</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/routine">
              <Card className="h-32 cursor-pointer hover:shadow-lg transition-shadow border-none bg-gradient-to-br from-green-100 to-green-200">
                <CardContent className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="text-2xl mb-2">📅</div>
                  <h3 className="font-semibold text-gray-800">My Routine</h3>
                  <p className="text-sm text-gray-600">Build & track</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Questionnaire Modal */}
      {showQuestionnaire && (
        <SkinQuestionnaire onClose={() => setShowQuestionnaire(false)} />
      )}
    </div>
  );
}
