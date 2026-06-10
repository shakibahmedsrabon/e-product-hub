import { Product } from "@/hooks/useProducts";

interface ProductImageGalleryProps {
  product?: Product;
}

const ProductImageGallery = ({ product }: ProductImageGalleryProps) => {
  return (
    <div className="w-full">
      <div className="w-full aspect-square overflow-hidden bg-muted/10">
        {product?.image && (
          <img
            src={product.image}
            alt={product.title || "Product view"}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
};

export default ProductImageGallery;
