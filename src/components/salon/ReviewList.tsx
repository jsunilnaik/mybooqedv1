import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Review } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { bookingService, reviewService } from '../../lib/dataService';

interface ReviewListProps {
  salonId: string;
  reviews: Review[];
  overallRating: number;
  totalReviews: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''} ago`;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function StarRow({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? 'text-[#FFB800] fill-[#FFB800]' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

export const ReviewList: React.FC<ReviewListProps> = ({ salonId, reviews, overallRating, totalReviews }) => {
  const { user } = useAuthStore();
  const [showAll, setShowAll] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  
  // Local state for reviews and formulation
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews);
  const [canReview, setCanReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  // Check review eligibility
  useEffect(() => {
    if (user) {
      const isEligible = bookingService.canUserReviewSalon(user.id, salonId);
      setCanReview(isEligible);
    } else {
      setCanReview(false);
    }
  }, [user, salonId]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const addedReview = reviewService.create(user.id, user.name, {
        salonId,
        rating: newRating,
        comment: newComment,
        isVerified: true
      });
      // Prepend to local reviews
      setLocalReviews([addedReview, ...localReviews]);
      // Reset form & hide to prevent spamming
      setNewComment('');
      setCanReview(false); 
    } catch (err) {
      console.error(err);
    }
  };

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: localReviews.filter((r) => Math.round(r.rating) === star).length,
    pct: localReviews.length > 0 ? (localReviews.filter((r) => Math.round(r.rating) === star).length / localReviews.length) * 100 : 0,
  }));

  const displayedReviews = showAll ? localReviews : localReviews.slice(0, 6);

  const toggleExpand = (id: string) => {
    setExpandedReviews(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      {/* ── Review Formulation Area ── */}
      <div className="mb-8">
        {!user ? (
          <div className="bg-gray-50 text-[#71717A] p-4 rounded-xl text-sm border border-gray-100 flex items-center justify-center">
            Log in to leave a review for this salon.
          </div>
        ) : canReview ? (
          <form onSubmit={handleReviewSubmit} className="bg-white border border-[#E4E4E7] p-6 rounded-2xl shadow-sm">
            <h4 className="font-bold text-black mb-4">Write a Verified Review</h4>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={24}
                      className={star <= newRating ? 'text-[#FFB800] fill-[#FFB800]' : 'text-gray-200 fill-gray-200'}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Experience</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tell others about your service..."
                required
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none h-24"
              />
            </div>
            <button
              type="submit"
              className="bg-black text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-gray-900 transition-colors"
            >
              Post Review
            </button>
          </form>
        ) : (
          <div className="bg-[#F7F9FA] text-[#71717A] p-4 rounded-xl text-sm border border-gray-100 flex items-center gap-3">
            <CheckCircle2 size={18} className="text-gray-400" />
            <span>You can only review this salon after completing an appointment here.</span>
          </div>
        )}
      </div>

      {/* Rating Summary */}
      <div className="flex flex-col sm:flex-row gap-8 p-6 bg-[#F7F9FA] rounded-2xl mb-8">
        {/* Big rating */}
        <div className="text-center flex-shrink-0">
          <div className="text-5xl font-bold text-black leading-none mb-2">
            {overallRating.toFixed(1)}
          </div>
          <StarRow rating={overallRating} size={16} />
          <div className="text-xs text-[#71717A] mt-2">{totalReviews} reviews</div>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-2.5">
          {distribution.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-xs text-[#71717A] w-2 flex-shrink-0">{star}</span>
              <Star size={10} className="text-[#FFB800] fill-[#FFB800] flex-shrink-0" />
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FFB800] rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-[#71717A] w-4 text-right flex-shrink-0">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews 2-col grid */}
      {localReviews.length === 0 ? (
        <div className="text-center py-12">
          <Star size={32} className="mx-auto text-gray-200 mb-3" />
          <p className="text-[#71717A] text-sm">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedReviews.map((review) => {
              const isExpanded = expandedReviews.has(review.id);
              const isLong = review.comment.length > 120;

              return (
                <div
                  key={review.id}
                  className="bg-[#F7F9FA] rounded-2xl p-6 flex flex-col justify-between"
                >
                  {/* Stars */}
                  <div className="mb-3">
                    <StarRow rating={review.rating} size={13} />
                  </div>

                  {/* Comment */}
                  <p className={cn(
                    'text-sm text-black leading-relaxed mb-4',
                    !isExpanded && isLong && 'line-clamp-3'
                  )}>
                    {review.comment}
                  </p>

                  {/* "Read more" blue link */}
                  {isLong && (
                    <button
                      onClick={() => toggleExpand(review.id)}
                      className="text-xs text-blue-600 hover:underline mb-4 text-left font-medium"
                    >
                      {isExpanded ? 'Read less' : 'Read more'}
                    </button>
                  )}

                  {/* User row — avatar at bottom */}
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-200">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden flex-none">
                      {review.userAvatar ? (
                        <img
                          src={review.userAvatar}
                          alt={review.userName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const sibling = target.nextElementSibling as HTMLElement;
                            if (sibling) sibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span
                        className="text-xs font-bold text-gray-600 items-center justify-center"
                        style={{ display: review.userAvatar ? 'none' : 'flex' }}
                      >
                        {getInitials(review.userName)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-semibold text-black">{review.userName}</div>
                        {review.isVerified && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#059669] bg-[#d1fae5] px-1.5 py-0.5 rounded-full">
                            <CheckCircle2 size={10} />
                            Verified Visit
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#71717A]">{timeAgo(review.createdAt)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {localReviews.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full mt-6 py-3 text-sm font-medium text-black border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
            >
              {showAll ? 'Show Less' : `See all ${localReviews.length} reviews`}
            </button>
          )}
        </>
      )}
    </div>
  );
};
