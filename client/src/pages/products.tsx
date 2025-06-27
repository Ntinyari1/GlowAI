import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/product-card";
import { Search } from "lucide-react";

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products', selectedCategory !== "all" ? selectedCategory : undefined],
    retry: false,
  });

  const { data: searchResults } = useQuery({
    queryKey: ['/api/products', { search: searchQuery }],
    enabled: searchQuery.length > 2,
    retry: false,
  });

  const displayProducts = searchQuery.length > 2 ? searchResults : products;

  const categories = [
    { value: "all", label: "All Products" },
    { value: "cleanser", label: "Cleansers" },
    { value: "serum", label: "Serums" },
    { value: "moisturizer", label: "Moisturizers" },
    { value: "sunscreen", label: "Sunscreen" },
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Smart Product Reviews</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            AI-analyzed reviews you can trust, tailored to your skin type and concerns
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          {categories.map(category => (
            <Badge
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "secondary"}
              className={`cursor-pointer px-6 py-2 ${
                selectedCategory === category.value 
                  ? "glow-gradient text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Badge>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-2xl mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProducts?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {displayProducts?.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">
              {searchQuery ? `No products found for "${searchQuery}"` : "No products found"}
            </p>
          </div>
        )}

        {/* Load More Button */}
        {displayProducts && displayProducts.length > 0 && (
          <div className="text-center mt-12">
            <Button className="bg-white text-glow-purple font-semibold px-8 py-4 shadow-lg hover:shadow-xl border-2 border-glow-purple">
              Load More Reviews
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
