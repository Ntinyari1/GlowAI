import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { searchProducts, Product, SearchResponse } from "@/services/beautyFactsService";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

function ProductList() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Fetch user skin profile from localStorage or context (adjust as needed)
  const skinProfile = useMemo(() => {
    try {
      const stored = localStorage.getItem("skinProfile");
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Error parsing skin profile:", error);
      toast.error("Error loading your skin profile");
      return {};
    }
  }, []);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["personalizedProducts", searchQuery, page, skinProfile],
    queryFn: async () => {
      try {
        return await searchProducts({
          query: searchQuery,
          page,
          pageSize,
          skinType: skinProfile?.skinType,
          concerns: skinProfile?.concerns,
          goals: skinProfile?.goals,
        });
      } catch (err) {
        console.error("Error fetching products:", err);
        toast.error("Failed to load products. Please try again later.");
        throw err; // Re-throw to let React Query handle the error state
      }
    },
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Use pagination data from backend
  const displayProducts = data?.products || [];
  const totalProducts = data?.count || 0;
  const totalPages = data?.totalPages || 1;
  const hasNextPage = data?.hasNextPage || false;
  const hasPrevPage = data?.hasPrevPage || false;

  // Product categories (can be personalized if needed)
  const categories = [
    { value: "", label: "All Products" },
    { value: "face-moisturizers", label: "Moisturizers" },
    { value: "face-cleansers", label: "Cleansers" },
    { value: "sunscreens", label: "Sunscreen" },
    { value: "face-serums", label: "Serums" },
  ];

  // Handle error state
  if (isError) {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading products</AlertTitle>
            <AlertDescription className="mb-4">
              {error instanceof Error ? error.message : 'Failed to load products'}
            </AlertDescription>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="mt-2"
            >
              Retry
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Finding Your Perfect Products</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're searching our database for products that match your skin profile...
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-lg" />
                <CardContent className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Handle no results state
  if (displayProducts.length === 0) {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 mb-4">
            <Search className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No products found</h2>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? `We couldn't find any products matching "${searchQuery}".`
              : 'No products match your current filters.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setPage(1);
              }}
              className="min-w-[160px]"
            >
              Clear search
            </Button>
            <Button
              variant="default"
              onClick={() => refetch()}
              className="min-w-[160px]"
            >
              Refresh results
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Personalized Beauty Products</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {searchQuery 
              ? `Search results for "${searchQuery}"` 
              : "Discover the most used and recommended products for your skin type and goals."}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search for products by name or brand..."
              className="pl-10 w-full h-12 text-base"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // Reset to first page when searching
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  refetch();
                }
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                  refetch();
                }}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500 text-center">
            {totalProducts} {totalProducts === 1 ? 'product' : 'products'} found
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={searchQuery === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSearchQuery(category.value);
                setPage(1);
              }}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-gray-100 animate-pulse" />
                <CardHeader>
                  <CardTitle className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                  <CardDescription className="h-4 bg-gray-100 rounded w-1/2" />
                </CardHeader>
              </Card>
            ))
          ) : isError ? (
            <div className="col-span-full text-center py-12">
              <p className="text-red-500">Failed to load products. Please try again later.</p>
            </div>
          ) : displayProducts.length > 0 ? (
            displayProducts.map((product: Product) => (
              <Card key={product.code} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-50 flex items-center justify-center p-4">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.product_name || 'Product image'}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-gray-400 text-sm">No image available</div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2 h-14">
                    {product.product_name || 'Unknown Product'}
                  </CardTitle>
                  <CardDescription className="line-clamp-1">
                    {product.brands || 'Brand not specified'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {product.nutriscore_grade && (
                      <Badge variant="outline">
                        Nutri-Score: {product.nutriscore_grade.toUpperCase()}
                      </Badge>
                    )}
                    {product.quantity && (
                      <Badge variant="secondary">
                        {product.quantity}
                      </Badge>
                    )}
                    {product.ingredients_text && (
                      <Badge variant="outline">
                        Ingredients: {product.ingredients_text.length > 30 ? product.ingredients_text.slice(0, 30) + '...' : product.ingredients_text}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2">
                    <Button
                      variant="link"
                      size="sm"
                      className="px-0 text-blue-600"
                      asChild
                    >
                      <a href={`https://world.openbeautyfacts.org/product/${product.code}`} target="_blank" rel="noopener noreferrer">
                        View Details
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No products found. Try a different search term or category.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mb-12">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!hasPrevPage || isLoading}
              className="min-w-[100px]"
            >
              Previous
            </Button>
            <div className="flex items-center px-4 text-sm text-gray-600">
              Page {page} of {totalPages} • {totalProducts} total products
            </div>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={!hasNextPage || isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Next'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Products() {
  return (
    <ErrorBoundary 
      onReset={() => window.location.reload()}
    >
      <ProductList />
    </ErrorBoundary>
  );
}
