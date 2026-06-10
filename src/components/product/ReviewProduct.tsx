import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "linea.reviewer";

interface SavedReviewer {
  fullName: string;
  profile: string;
}

const CustomStar = ({ filled, onClick, className }: { filled: boolean; onClick: () => void; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`w-6 h-6 cursor-pointer transition-colors ${filled ? 'text-foreground' : 'text-muted-foreground/30'} ${className}`}
    onClick={onClick}
  >
    <path
      fillRule="evenodd"
      d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
      clipRule="evenodd"
    />
  </svg>
);

interface ReviewProductProps {
  onSubmitted?: () => void;
  productId?: number;
}

const ReviewProduct = ({ onSubmitted, productId }: ReviewProductProps) => {
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [fullName, setFullName] = useState("");
  const [profile, setProfile] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedReviewer, setSavedReviewer] = useState<SavedReviewer | null>(null);
  const [editingIdentity, setEditingIdentity] = useState(false);

  // Load saved reviewer identity from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedReviewer;
        if (parsed?.fullName) {
          setSavedReviewer(parsed);
          setFullName(parsed.fullName);
          setProfile(parsed.profile || "");
        }
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  const submitReview = async () => {
    if (rating === 0 || description.trim() === "") return;
    const nameToSave = fullName.trim() || "Anonymous";
    const profileToSave = profile.trim();

    setSubmitting(true);
    const { error } = await (supabase as any).from("Reviews").insert({
      FullName: nameToSave,
      star: rating,
      profile: profileToSave || null,
      description: description.trim(),
      product_id: productId ?? null,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Could not submit review", description: error.message, variant: "destructive" });
      return;
    }

    // Persist identity for next time
    try {
      const reviewer: SavedReviewer = { fullName: nameToSave, profile: profileToSave };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviewer));
      setSavedReviewer(reviewer);
    } catch {
      // ignore
    }

    toast({ title: "Thank you!", description: "Your review has been posted." });
    setIsOpen(false);
    setRating(0);
    setDescription("");
    setEditingIdentity(false);
    onSubmitted?.();
  };

  const clearIdentity = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setSavedReviewer(null);
    setFullName("");
    setProfile("");
    setEditingIdentity(false);
  };

  const showIdentityForm = !savedReviewer || editingIdentity;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-12 font-light rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background"
        >
          Write a review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md !rounded-none">
        <DialogHeader>
          <DialogTitle className="font-light text-xl">Write a review</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Saved identity card */}
          {savedReviewer && !editingIdentity && (
            <div className="flex items-center gap-3 p-3 border border-border">
              {savedReviewer.profile ? (
                <img
                  src={savedReviewer.profile}
                  alt={savedReviewer.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => ((e.currentTarget.style.display = "none"))}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-light">
                  {savedReviewer.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-light truncate">{savedReviewer.fullName}</p>
                <p className="text-xs text-muted-foreground">Saved on this device</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingIdentity(true)}
                className="text-xs font-light text-muted-foreground hover:text-foreground transition-colors"
              >
                Change
              </button>
            </div>
          )}

          {/* Identity form (first time or editing) */}
          {showIdentityForm && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-light text-foreground">Full name</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  maxLength={100}
                  className="rounded-none font-light"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-light text-foreground">Profile picture URL (optional)</label>
                <Input
                  value={profile}
                  onChange={(e) => setProfile(e.target.value)}
                  placeholder="https://..."
                  className="rounded-none font-light"
                />
              </div>
              {savedReviewer && editingIdentity && (
                <button
                  type="button"
                  onClick={clearIdentity}
                  className="text-xs font-light text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear saved identity
                </button>
              )}
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm font-light text-foreground">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <CustomStar
                  key={star}
                  filled={star <= rating}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-light text-foreground">Your review</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share your thoughts about this product..."
              maxLength={1000}
              className="min-h-24 resize-none rounded-none font-light"
            />
          </div>

          <Button
            onClick={submitReview}
            disabled={rating === 0 || description.trim() === "" || submitting}
            className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-light rounded-none"
          >
            {submitting ? "Submitting..." : "Submit review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewProduct;
