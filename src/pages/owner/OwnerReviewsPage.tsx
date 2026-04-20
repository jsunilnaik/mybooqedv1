import { useState, useMemo } from 'react';
import { Star, MessageCircle, Flag, Send, Filter, ThumbsUp } from 'lucide-react';
import { useOwnerStore } from '../../store/useOwnerStore';

const STAR_COLORS = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-400', 'bg-blue-500', 'bg-green-500'];

export default function OwnerReviewsPage() {
  const { reviews, replyToReview, flagReview } = useOwnerStore();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'lowest' | 'unanswered'>('recent');

  const filtered = useMemo(() => {
    let list = [...reviews];
    if (filterRating !== null) list = list.filter((r) => r.rating === filterRating);
    if (sortBy === 'lowest') list = list.sort((a, b) => a.rating - b.rating);
    else if (sortBy === 'unanswered') list = list.filter((r) => !r.reply).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else list = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [reviews, filterRating, sortBy]);

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';
  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: reviews.filter((rv) => rv.rating === r).length,
    pct: reviews.length > 0 ? Math.round((reviews.filter((rv) => rv.rating === r).length / reviews.length) * 100) : 0,
  }));

  const handleSubmitReply = (reviewId: string) => {
    if (replyText.trim()) {
      replyToReview(reviewId, replyText.trim());
      setReplyingTo(null);
      setReplyText('');
    }
  };

  const recommendPct = reviews.length > 0
    ? Math.round((reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100)
    : 0;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-black">Reviews</h1>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="text-center">
            <p className="text-6xl font-black text-black">{avgRating}</p>
            <div className="flex items-center justify-center gap-0.5 my-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} className={parseFloat(avgRating) >= s ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
              ))}
            </div>
            <p className="text-sm text-gray-500">{reviews.length} reviews</p>
          </div>
          <div className="flex-1 w-full space-y-2">
            {ratingDist.map(({ rating, count, pct }) => (
              <div key={rating} className="flex items-center gap-2">
                <button
                  onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                  className="flex items-center gap-0.5 w-16 flex-shrink-0 hover:opacity-70"
                >
                  <span className="text-xs font-medium text-gray-700 w-3">{rating}</span>
                  <Star size={11} className="text-yellow-400 fill-yellow-400" />
                </button>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${STAR_COLORS[rating]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-1 text-green-600">
              <ThumbsUp size={16} />
              <span className="text-sm font-semibold">{recommendPct}%</span>
            </div>
            <p className="text-xs text-gray-400">Recommend</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Filter size={14} /> Filter:
        </div>
        {([null, 5, 4, 3, 2, 1] as (number | null)[]).map((r) => (
          <button
            key={r ?? 'all'}
            onClick={() => setFilterRating(r)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${filterRating === r ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
          >
            {r === null ? 'All' : <>{r} <Star size={10} className="fill-current" /></>}
          </button>
        ))}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="ml-auto text-xs border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:border-black bg-white"
        >
          <option value="recent">Most Recent</option>
          <option value="lowest">Lowest Rating</option>
          <option value="unanswered">Unanswered</option>
        </select>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((review) => (
          <div
            key={review.id}
            className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${review.flagged ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-700 flex-shrink-0">
                  {review.customerName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">{review.customerName}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={13} className={review.rating >= s ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                ))}
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.comment}</p>

            {review.reply && (
              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">Your Reply</p>
                <p className="text-xs text-gray-700">{review.reply}</p>
              </div>
            )}

            {replyingTo === review.id ? (
              <div className="space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a professional reply..."
                  className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-black h-20"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSubmitReply(review.id)}
                    className="flex items-center gap-1.5 bg-black text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Send size={12} /> Reply
                  </button>
                  <button
                    onClick={() => { setReplyingTo(null); setReplyText(''); }}
                    className="text-xs text-gray-500 hover:text-black px-3 py-2 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setReplyingTo(review.id); setReplyText(review.reply || ''); }}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-black border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-full transition-colors"
                >
                  <MessageCircle size={12} /> {review.reply ? 'Edit Reply' : 'Reply'}
                </button>
                <button
                  onClick={() => flagReview(review.id)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${review.flagged ? 'border-red-300 text-red-500 bg-red-50' : 'border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300'}`}
                >
                  <Flag size={12} /> {review.flagged ? 'Flagged' : 'Flag'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Star size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No reviews found</p>
        </div>
      )}
    </div>
  );
}
