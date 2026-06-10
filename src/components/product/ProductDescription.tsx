import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReviewProduct from "./ReviewProduct";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import type { Product } from "@/hooks/useProducts";
import { useReviews } from "@/hooks/useReviews";
import { useSiteConfig } from "@/hooks/useSiteConfig";

interface ProductDescriptionProps {
  product?: Product;
}

const CustomStar = ({ filled, className }: { filled: boolean; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`w-3 h-3 ${filled ? 'text-foreground' : 'text-muted-foreground/30'} ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
      clipRule="evenodd"
    />
  </svg>
);

const ProductDescription = ({ product }: ProductDescriptionProps) => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isDescriptionBnOpen, setIsDescriptionBnOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const { config } = useSiteConfig();
  const showReview = config?.showReview !== false;
  const { reviews, average, refetch } = useReviews(showReview ? product?.id : undefined);

  const description = product?.description?.trim();
  const descriptionBn = product?.description_bn?.trim();
  const avgDisplay = average > 0 ? average.toFixed(1) : "0.0";

  return (
    <div className="space-y-0 mt-8 border-t border-border">
      {/* Description (English) */}
      {description && (
        <div className="border-b border-border">
          <Button
            variant="ghost"
            onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
            className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
          >
            <span>Description</span>
            {isDescriptionOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          {isDescriptionOpen && (
            <div className="pb-6">
              <MarkdownRenderer content={description} />
            </div>
          )}
        </div>
      )}

      {/* Description (Bangla) */}
      {descriptionBn && (
        <div className="border-b border-border">
          <Button
            variant="ghost"
            onClick={() => setIsDescriptionBnOpen(!isDescriptionBnOpen)}
            className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
          >
            <span>Description (বাংলা)</span>
            {isDescriptionBnOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          {isDescriptionBnOpen && (
            <div className="pb-6">
              <MarkdownRenderer content={descriptionBn} />
            </div>
          )}
        </div>
      )}

      {/* Customer Reviews */}
      {showReview && (
      <div className="border-b border-border lg:mb-16">
        <Button
          variant="ghost"
          onClick={() => setIsReviewsOpen(!isReviewsOpen)}
          className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
        >
          <div className="flex items-center gap-3">
            <span>Customer Reviews ({reviews.length})</span>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <CustomStar key={star} filled={star <= Math.round(average)} />
              ))}
              <span className="text-sm font-light text-muted-foreground ml-1">{avgDisplay}</span>
            </div>
          </div>
          {isReviewsOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        {isReviewsOpen && (
          <div className="pb-6 space-y-6">
            <ReviewProduct onSubmitted={refetch} productId={product?.id} />

            {reviews.length === 0 ? (
              <p className="text-sm font-light text-muted-foreground">
                No reviews yet. Be the first to share your thoughts.
              </p>
            ) : (
              <div className="space-y-6">
                {reviews.map((r) => (
                  <div key={r.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      {r.profile ? (
                        <img
                          src={r.profile}
                          alt={r.FullName || "Reviewer"}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => ((e.currentTarget.style.display = "none"))}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-light">
                          {(r.FullName || "A").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <CustomStar key={star} filled={star <= (r.star || 0)} />
                          ))}
                        </div>
                        <span className="text-sm font-light text-muted-foreground">
                          {r.FullName || "Anonymous"}
                        </span>
                      </div>
                    </div>
                    {r.description && (
                      <p className="text-sm font-light text-muted-foreground leading-relaxed">
                        {r.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default ProductDescription;
