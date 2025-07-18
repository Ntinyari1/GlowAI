import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, ExternalLink } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { mockApi } from "@/lib/mockApi";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    brand: string;
    category: string;
    description?: string;
    price?: string;
    rating?: number;
    pros?: string[];
    cons?: string[];
    bestFor?: string[];
    imageUrl?: string;
    affiliateLink?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        await apiRequest('DELETE', '/api/users/1/favorites/product/' + product.id);
      } else {
        await apiRequest('POST', '/api/favorites', {
          userId: 1,
          type: 'product',
          itemId: product.id
        });
      }
    },
    onSuccess: () => {
      setIsFavorited(!isFavorited);
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/favorites'] });
    },
  });

  const getRecommendationBadge = () => {
    if (!product.rating) return null;
    
    const rating = product.rating / 10; // Convert from 1-50 scale to 1-5
    if (rating >= 4.5) return { text: "Recommended", color: "bg-green-100 text-green-800" };
    if (rating >= 4.0) return { text: "Top Pick", color: "bg-blue-100 text-blue-800" };
    if (rating >= 3.5) return { text: "Good Choice", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Average", color: "bg-gray-100 text-gray-800" };
  };

  const badge = getRecommendationBadge();

  const handleAddFavorite = async (favoriteData) => {
    await mockApi.addFavorite(favoriteData);
  };

  const handleRemoveFavorite = async (userId, type, itemId) => {
    await mockApi.removeFavorite(userId, type, itemId);
  };

  // Static array of card images
  const cardImages = [
    "/card-images/image1.webp",
    "/card-images/image2.webp",
    "/card-images/image3.webp",
    "/card-images/image4.webp",
    "/card-images/image5.webp",
  ];
  // Find the index for this product (assuming id starts at 1)
  const startIdx = (product.id - 1) % cardImages.length;
  // Rotate images so the first is the one for this card
  const images = [
    ...cardImages.slice(startIdx),
    ...cardImages.slice(0, startIdx)
  ];

  return (
    <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow">
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((img, idx) => (
            <CarouselItem key={idx}>
              <img
                src={img}
                alt={product.name + ' image ' + (idx + 1)}
                className="w-full h-48 object-cover"
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/fallback-product.png'; }}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          {badge && (
            <Badge className={`text-xs font-semibold px-3 py-1 ${badge.color}`}>
              {badge.text}
            </Badge>
          )}
          {product.rating && (
            <div className="flex items-center space-x-1">
              <Star className="text-yellow-400 w-4 h-4 fill-current" />
              <span className="font-semibold text-gray-800">
                {(product.rating / 10).toFixed(1)}
              </span>
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        )}
        
        {product.bestFor && product.bestFor.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Best for:</p>
            <div className="flex flex-wrap gap-1">
              {product.bestFor.slice(0, 2).map(item => (
                <Badge key={item} variant="outline" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          {product.price && (
            <span className="text-lg font-bold text-glow-purple">{product.price}</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => favoriteMutation.mutate()}
            disabled={favoriteMutation.isPending}
            className={isFavorited ? 'text-red-500' : 'text-glow-pink hover:text-glow-purple'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button className="flex-1 glow-gradient text-white font-semibold">
            View Review
          </Button>
          {product.affiliateLink && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(product.affiliateLink, '_blank')}
              className="px-3"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
