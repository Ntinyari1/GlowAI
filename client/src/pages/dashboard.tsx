import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, CheckCircle, Star, Calendar, Lightbulb, Heart, X, StickyNote, Eye, Plus } from "lucide-react";
import { UserStats } from "@/lib/types";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

type Product = {
  id: number;
  name: string;
  image: string;
  overrideImage?: string;
  brand: string;
  description: string;
  price: string;
  step: number;
};

const mockProducts = [
  {
    id: 1,
    name: "Nivea Perfect & Radiant Even Tone Day Cream SPF 15",
    image: "/card-images/image1.webp",
    overrideImage: "https://images-us.nivea.com/-/media/miscellaneous/media-center-items/8/d/f/a6199fb0be184230b1183227fb15edd1-screen.jpg",
    brand: "Nivea",
    description: "Brightens skin, evens tone, protects from sun.",
    price: "KES 950",
    step: 1
  },
  {
    id: 2,
    name: "Garnier Micellar Cleansing Water",
    image: "/card-images/image2.webp",
    overrideImage: "https://tse2.mm.bing.net/th/id/OIP.NVIUPSFzO_BfAu1aP3gDmwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
    brand: "Garnier",
    description: "Removes makeup, cleanses, soothes.",
    price: "KES 1,200",
    step: 2
  },
  {
    id: 3,
    name: "Neutrogena Hydro Boost Water Gel",
    image: "/card-images/image3.webp",
    overrideImage: "https://blufashionbd.com/wp-content/uploads/2024/02/Neutrogena-Hydro-Boost-Water-Gel.jpg",
    brand: "Neutrogena",
    description: "Intense hydration for smooth, supple skin.",
    price: "KES 2,500",
    step: 3
  },
  {
    id: 4,
    name: "Simple Kind to Skin Refreshing Facial Wash",
    image: "/card-images/image4.webp",
    overrideImage: "https://tse2.mm.bing.net/th/id/OIP.I6dTSlFbn_xpMqmPH0CqLgAAAA?rs=1&pid=ImgDetMain&o=7&rm=3",
    brand: "Simple",
    description: "Gentle cleanser for all skin types.",
    price: "KES 800",
    step: 4
  },
  {
    id: 5,
    name: "Vaseline Blue Seal Petroleum Jelly",
    image: "/card-images/image5.webp",
    overrideImage: "https://www.yourglamlb.com/cdn/shop/files/VASELINE-Petroleum-Jelly-Original.webp?v=1712408072&width=1445",
    brand: "Vaseline",
    description: "Locks in moisture, protects skin.",
    price: "KES 200",
    step: 5
  },
];

const mockRoutine = [
  { day: "Mon", product: mockProducts[0] },
  { day: "Tue", product: mockProducts[1] },
  { day: "Wed", product: mockProducts[2] },
  { day: "Thu", product: mockProducts[3] },
  { day: "Fri", product: mockProducts[1] },
];

const mockTips = [
  "Apply gently in circular motions for best results.",
  "Use lukewarm water to rinse your face before applying.",
  "Don’t forget to moisturize after cleansing.",
  "Apply sunscreen as the last step in your routine.",
  "Be consistent for visible results!"
];

// Add this utility function to fetch images from Pexels
async function fetchPexelsImages(productNames: string[]): Promise<Record<string, string>> {
  const apiKey = "YOUR_PEXELS_API_KEY"; // Replace with your Pexels API key
  const results: Record<string, string> = {};
  for (const name of productNames) {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(name)}&per_page=1`,
        { headers: { Authorization: apiKey } }
      );
      const data = await res.json();
      if (data.photos && data.photos.length > 0) {
        results[name] = data.photos[0].src.medium;
      }
    } catch (e) {
      // Ignore errors, fallback will be used
    }
  }
  return results;
}

export default function Dashboard() {
  const skinProfile = JSON.parse(localStorage.getItem('skinProfile') || '{}');
  const userName = skinProfile.name || "GlowAI User";
  const profileFields = [
    !!skinProfile.name,
    !!skinProfile.email,
    !!skinProfile.age,
    !!skinProfile.skinType,
    Array.isArray(skinProfile.goals) && skinProfile.goals.length > 0,
    Array.isArray(skinProfile.concerns) && skinProfile.concerns.length > 0,
    !!skinProfile.routinePref,
    !!skinProfile.photo
  ];
  const profileCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);
  const [selectedDay, setSelectedDay] = useState(1);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [notes, setNotes] = useState<string[]>(["", "", "", "", ""]);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [progress, setProgress] = useState([false, false, false, false, false]);
  const [pexelsImages, setPexelsImages] = useState<Record<string, string>>({});

  // Mock user stats
  const userStats: UserStats = {
    tipsCompleted: 87,
    productsReviewed: 23,
    dayStreak: 42
  };
  const recentActivities = [
    {
      type: 'completed_tip',
      description: 'Completed morning routine tip',
      timeAgo: '2 hours ago',
      icon: Lightbulb,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      type: 'saved_product',
      description: 'Saved CeraVe Hydrating Cleanser',
      timeAgo: '5 hours ago',
      icon: Heart,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      type: 'reviewed_product',
      description: 'Reviewed The Ordinary Niacinamide',
      timeAgo: '1 day ago',
      icon: Star,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    }
  ];

  useEffect(() => {
    const productNames = mockProducts.map(p => p.name);
    fetchPexelsImages(productNames).then(setPexelsImages);
  }, []);

  // Add fade-in animation on mount
  useEffect(() => {
    document.body.classList.add("bg-glow-bg");
    return () => document.body.classList.remove("bg-glow-bg");
  }, []);

  return (
    <div className="relative min-h-[100vh] flex flex-col gap-8 md:gap-12 md:max-w-5xl mx-auto px-2 md:px-0 animate-fade-in">
      {/* Soft background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="w-full h-full bg-gradient-to-br from-glow-rose/70 via-glow-lavender/60 to-glow-pink/40" />
      </div>
      {/* Header Card */}
      <div className="w-full max-w-5xl rounded-2xl shadow-2xl p-8 md:p-1 flex flex-col md:flex-row items-centre gap-8 bg-white/70 backdrop-blur-2xl mb-2 mt-8 border border-glow-lavender/30 animate-slide-in-down">
        <div className="flex-shrink-0">
          <div className="w-30 h-30 glow-gradient rounded-full flex items-center justify-center overflow-hidden border-4 border-glow-pink shadow-lg mx-auto md:mx-0">
            {skinProfile.photo ? (
              <img src={skinProfile.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="text-white w-12 h-12" />
            )}
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-extrabold text-glow-purple mb-3 drop-shadow">Hello, {userName}!</h2>
          <p className="text-gray-700 mb-4 text-lg">Let’s take care of your skin today.</p>
          <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
            <span className="text-xs text-gray-700 font-bold">Profile completion</span>
            <div className="w-40 h-4 bg-white border-2 border-glow-purple rounded-full overflow-hidden shadow">
              <div className="h-4 bg-gradient-to-r from-glow-pink to-glow-purple rounded-full transition-all animate-pulse" style={{ width: `${profileCompletion}%` }} />
            </div>
            <span className="text-sm font-extrabold text-glow-purple ml-2 drop-shadow">{profileCompletion}%</span>
          </div>
        </div>
        <Link href="/profile">
          <Button className="glow-gradient-soft text-glow-purple font-semibold shadow px-6 py-3 text-base rounded-xl mt-4 md:mt-0">Update Profile</Button>
        </Link>
      </div>
      {/* Special for you - Product Grid */}
      <div className="w-full mx-auto animate-slide-in-up">
        <h3 className="text-lg font-bold text-glow-purple mb-4 ml-2">Special for you</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-center items-start">
          {mockProducts.map((product) => {
            const mainImage = product.overrideImage || pexelsImages[product.name];
            return (
              <div key={product.id} className="w-64 max-w-xs bg-white/80 rounded-2xl shadow-xl p-4 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-glow-lavender/20 relative">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="h-40 w-40 object-contain drop-shadow rounded-xl mb-2"
                  />
                ) : (
                  <div className="h-24 w-full flex items-center justify-center bg-glow-lavender/30 rounded-xl mb-2 text-xs text-gray-400">No image</div>
                )}
                <div className="absolute top-3 right-3 bg-glow-pink text-white text-xs px-2 py-1 rounded-full shadow">{product.price}</div>
                <div className="text-xs text-gray-500 mb-1">{product.brand}</div>
                <div className="text-sm font-bold text-gray-800 text-center mb-1 line-clamp-2">{product.name}</div>
                <div className="text-xs text-gray-600 text-center mb-2 line-clamp-2">{product.description}</div>
                <Button className="glow-gradient-soft text-glow-purple text-xs px-4 py-1 mt-1 rounded-lg shadow" onClick={() => setModalProduct(product)}>View</Button>
              </div>
            );
          })}
        </div>
      </div>
      {/* Product Modal - unchanged */}
      {modalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xs w-full relative animate-slide-in-up">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-glow-pink" onClick={() => setModalProduct(null)}><X className="w-5 h-5" /></button>
            <img
              src={modalProduct.overrideImage || pexelsImages[modalProduct.name]}
              alt={modalProduct.name}
              className="w-48 h-48 rounded-xl object-contain mx-auto mb-3 bg-glow-lavender"
            />
            <div className="text-lg font-bold text-glow-purple text-center mb-1">{modalProduct.name}</div>
            <div className="text-xs text-gray-500 text-center mb-1">Brand: {modalProduct.brand}</div>
            <div className="text-gray-600 text-sm text-center mb-2">{modalProduct.description}</div>
            <div className="text-xs font-semibold text-glow-pink text-center mb-2">Price: {modalProduct.price}</div>
            <Badge className="bg-glow-pink text-white">Step {modalProduct.step}</Badge>
          </div>
        </div>
      )}
      {/* Daily Routine - Checklist style */}
      <div className="w-full mx-auto animate-slide-in-up">
        <h3 className="text-lg font-bold text-glow-purple mb-4 ml-2">Daily routine</h3>
        {/* Progress Tracker */}
        <div className="flex justify-center gap-4 mb-4">
          {mockRoutine.map((r, idx) => (
            <div key={r.day} className="flex flex-col items-center">
              <button
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-centre font-bold text-base transition shadow-sm focus:outline-none focus:ring-2 focus:ring-glow-pink
                  ${progress[idx] ? 'bg-glow-pink text-white border-glow-pink shadow-md' : 'bg-glow-lavender/40 text-glow-purple border-glow-lavender hover:bg-glow-lavender/70'}
                  ${selectedDay === idx ? 'ring-2 ring-glow-pink scale-105' : ''}`}
                onClick={() => setSelectedDay(idx)}
                aria-label={r.day}
              >
                {progress[idx] ? <CheckCircle className="w-5 h-5" /> : r.day[0]}
              </button>
              <span className="text-xs mt-1 text-glow-purple font-medium">{r.day}</span>
            </div>
          ))}
        </div>
        {/* Progress Bar Chart */}
        <div className="flex justify-center gap-2 mb-6">
          {progress.map((done, idx) => (
            <div key={idx} className={`w-8 h-3 rounded-full transition-all duration-200 ${done ? 'bg-glow-pink' : 'bg-glow-lavender/40'}`}></div>
          ))}
        </div>
        {/* Unified Routine Card - Two Columns */}
        <div className="w-full max-w-5xl mx-auto bg-white/90 rounded-xl shadow-2xl p-4 md:p-6 flex flex-col md:flex-row items-start gap-4 md:gap-8 border border-glow-lavender/30 animate-fade-in">
          {/* Left Column: Product image, name, step, tip */}
          <div className="flex flex-col items-start justify-center gap-3 w-full md:w-1/2">
            <div className="w-24 h-24 rounded-lg border-2 border-glow-lavender bg-white/70 flex items-center justify-center shadow overflow-hidden">
              <img src={mockRoutine[selectedDay].product.overrideImage} alt={mockRoutine[selectedDay].product.name} className="w-20 h-20 object-contain" />
            </div>
            <div className="text-base font-extrabold text-glow-purple text-left">{mockRoutine[selectedDay].product.name}</div>
            <Badge className="bg-glow-pink text-white">Step {mockRoutine[selectedDay].product.step}</Badge>
            <div className="flex items-center gap-2 text-xs text-glow-purple bg-glow-lavender/30 rounded px-2 py-1 text-left shadow-sm">
              <StickyNote className="w-4 h-4 text-glow-pink" />
              <span className="font-semibold">Tip:</span> {mockTips[selectedDay % mockTips.length]}
            </div>
          </div>
          {/* Right Column: Brand, desc, actions, note */}
          <div className="flex flex-col items-start justify-center gap-2 w-full md:w-1/2">
            <div className="text-sm font-bold text-glow-purple">{mockRoutine[selectedDay].product.brand}</div>
            <div className="text-xs text-gray-600 mb-1 text-left">{mockRoutine[selectedDay].product.description}</div>
            {/* Actions and notes can be added here if needed */}
          </div>
        </div>
      </div>
      {/* Stats Row - glassy cards */}
      <div className="w-full mx-auto flex flex-col md:flex-row gap-4 justify-between mb-2 animate-fade-in">
        <div className="flex-1 bg-white/80 rounded-2xl shadow-xl flex flex-col items-center py-6 border border-glow-lavender/20 animate-bounce-in">
          <CheckCircle className="text-green-500 w-8 h-8 mb-2" />
          <div className="text-2xl font-bold text-gray-800">{userStats.tipsCompleted}</div>
          <div className="text-xs text-gray-500">Tips Completed</div>
        </div>
        <div className="flex-1 bg-white/80 rounded-2xl shadow-xl flex flex-col items-center py-6 border border-glow-lavender/20 animate-bounce-in">
          <Star className="text-blue-500 w-8 h-8 mb-2" />
          <div className="text-2xl font-bold text-gray-800">{userStats.productsReviewed}</div>
          <div className="text-xs text-gray-500">Products Reviewed</div>
        </div>
        <div className="flex-1 bg-white/80 rounded-2xl shadow-xl flex flex-col items-center py-6 border border-glow-lavender/20 animate-bounce-in">
          <Calendar className="text-purple-500 w-8 h-8 mb-2" />
          <div className="text-2xl font-bold text-gray-800">{userStats.dayStreak}</div>
          <div className="text-xs text-gray-500">Day Streak</div>
        </div>
      </div>
      {/* Recent Activity - timeline style */}
      <div className="w-full mx-auto animate-fade-in mb-8">
        <h3 className="text-lg font-bold text-glow-purple mb-4 ml-2">Recent Activity</h3>
        <div className="bg-white/80 rounded-2xl shadow-xl p-6 space-y-4 border border-glow-lavender/20">
          {recentActivities.map((activity, index) => {
            const IconComponent = activity.icon;
            return (
              <div key={index} className="flex items-center gap-4 relative">
                <div className={`w-10 h-10 ${activity.bgColor} rounded-full flex items-center justify-center shadow-lg`}>
                  <IconComponent className={`${activity.iconColor} w-6 h-6`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800 text-base">{activity.description}</div>
                  <div className="text-xs text-gray-500">{activity.timeAgo}</div>
                </div>
                {index < recentActivities.length - 1 && (
                  <div className="absolute left-5 top-10 w-0.5 h-6 bg-glow-lavender/30" />
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Bottom Navigation Bar (Mobile Only) - floating, rounded, shadow */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md border border-glow-lavender/40 shadow-2xl flex justify-around items-center h-16 w-[95vw] max-w-md rounded-2xl md:hidden animate-fade-in-up">
        <Link href="/dashboard" className="flex flex-col items-center text-glow-purple hover:text-glow-pink transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0a2 2 0 002-2V7a2 2 0 00-2-2h-3.5a2 2 0 00-2 2v1" /></svg>
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/routine" className="flex flex-col items-center text-glow-purple hover:text-glow-pink transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m0-5V3m-8 9v6a2 2 0 002 2h4a2 2 0 002-2v-6" /></svg>
          <span className="text-xs">Routine</span>
        </Link>
        <Link href="/tips" className="flex flex-col items-center text-glow-purple hover:text-glow-pink transition">
          <Lightbulb className="w-6 h-6 mb-1" />
          <span className="text-xs">Tips</span>
        </Link>
        <Link href="/products" className="flex flex-col items-center text-glow-purple hover:text-glow-pink transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21V7a2 2 0 00-2-2H6a2 2 0 00-2 2v14m16 0H4" /></svg>
          <span className="text-xs">Products</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-glow-purple hover:text-glow-pink transition">
          <User className="w-6 h-6 mb-1" />
          <span className="text-xs">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
