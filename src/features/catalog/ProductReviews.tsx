import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, AlertCircle, Sparkles, Check } from 'lucide-react';
import API from '../../config/api';
import { useDialog } from '../../components/Dialog';

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  createdAt: string;
}

interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  distribution: Record<string, number>;
}

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { showAlert } = useDialog();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  // Flipkart UI States
  const [showForm, setShowForm] = useState(false);
  const [votedReviews, setVotedReviews] = useState<Record<string, 'up' | 'down'>>({});

  const handleVote = (reviewId: string, type: 'up' | 'down') => {
    setVotedReviews(prev => {
      const current = prev[reviewId];
      if (current === type) {
        const next = { ...prev };
        delete next[reviewId];
        return next;
      }
      return { ...prev, [reviewId]: type };
    });
  };

  useEffect(() => {
    loadReviewsAndSummary();
  }, [productId]);

  const loadReviewsAndSummary = async () => {
    setLoading(true);
    try {
      const [reviewsRes, summaryRes] = await Promise.all([
        API.get<{ content: ReviewItem[] }>(`/reviews/product/${productId}?size=10`),
        API.get<RatingSummary>(`/reviews/product/${productId}/summary`),
      ]);
      setReviews(reviewsRes.data.content);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('Failed to load reviews or ratings summary', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showAlert('Please write a comment for your review', 'warning');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await API.post('/reviews', {
        productId,
        rating,
        comment: comment.trim(),
      });
      setComment('');
      setRating(5);
      showAlert('Review successfully submitted!', 'success');
      loadReviewsAndSummary();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review. Check if you bought this product variant.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-50 border-b-50 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 border-t border-slate-200 pt-10">
      {/* Header with collapsible Rate Product trigger */}
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="text-[#2874f0] h-5 w-5" />
          Ratings & Reviews
        </h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-sm hover:bg-slate-50 transition shadow-sm"
        >
          {showForm ? 'Cancel Rating' : 'Rate Product'}
        </button>
      </div>

      {/* Full width Horizontal Ratings summary box */}
      {summary && (
        <div className="border border-slate-200 bg-white p-6 rounded-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Average Rating Block (takes 3 cols) */}
          <div className="md:col-span-3 text-center md:text-left space-y-2 flex flex-col items-center md:items-start justify-center">
            <div className="flex items-center gap-1 text-3xl font-bold text-slate-900">
              <span>{summary.averageRating.toFixed(1)}</span>
              <Star className="h-6 w-6 fill-slate-800 stroke-none" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">
                {summary.totalReviews.toLocaleString()} Ratings &
              </p>
              <p className="text-xs font-semibold text-slate-400">
                {reviews.length} Verified Reviews
              </p>
            </div>
          </div>

          {/* Star Distribution chart (takes 4 cols) */}
          <div className="md:col-span-4 space-y-1.5 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 text-xs text-slate-500">
            {['5', '4', '3', '2', '1'].map((star) => {
              const count = (summary.distribution && summary.distribution[star]) || 0;
              const percent = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
              
              let barColor = 'bg-[#388e3c]';
              if (star === '3') barColor = 'bg-[#388e3c]';
              else if (star === '2') barColor = 'bg-amber-500';
              else if (star === '1') barColor = 'bg-rose-500';

              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-6 font-bold text-slate-600 flex items-center gap-0.5">
                    {star} <Star className="h-3 w-3 fill-slate-400 stroke-none" />
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor}`} style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-8 text-right font-medium text-slate-400">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Aspect Ratings Block (takes 5 cols) */}
          <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 space-y-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Features Rating</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Camera', rating: 4.1, color: 'bg-[#388e3c]' },
                { label: 'Battery', rating: 4.4, color: 'bg-[#388e3c]' },
                { label: 'Display', rating: 4.2, color: 'bg-[#388e3c]' },
                { label: 'Design', rating: 4.3, color: 'bg-[#388e3c]' },
              ].map((aspect) => (
                <div key={aspect.label} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>{aspect.label}</span>
                    <span className="text-slate-800 font-bold">{aspect.rating} ★</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${aspect.color}`} 
                      style={{ width: `${(aspect.rating / 5) * 100}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Collapsible Review Submission Form */}
      {showForm && (
        <div className="p-6 bg-white border border-slate-200 rounded-sm space-y-4 shadow-sm animate-fadeIn">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <Sparkles size={16} className="text-[#2874f0]" />
            Write a Review
          </h4>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-sm flex items-start gap-1 text-xs">
              <AlertCircle className="shrink-0 mt-0.5" size={14} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400 uppercase mr-2">Your Rating:</span>
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const val = idx + 1;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRating(val)}
                      onMouseEnter={() => setHoveredStar(val)}
                      onMouseLeave={() => setHoveredStar(null)}
                      className="focus:outline-none transition-transform hover:scale-110 p-0.5"
                    >
                      <Star
                        fill={val <= (hoveredStar ?? rating) ? 'currentColor' : 'none'}
                        className="h-6 w-6 shrink-0"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Your Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={3}
                placeholder="Share your detailed experience using this product variant..."
                className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-[#2874f0] focus:ring-1 focus:ring-blue-100/50 text-slate-800 rounded-sm text-xs outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="py-2.5 px-6 bg-[#2874f0] hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 font-bold rounded-sm text-white text-xs shadow-sm transition"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Verified Reviews list (borderless, divided by border lines) */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-800">Customer Reviews ({reviews.length})</h4>
          <span className="text-xs text-slate-400 font-medium">Showing latest feedback</span>
        </div>
        
        {reviews.length === 0 ? (
          <div className="p-8 text-center bg-blue-50/10 border border-dashed border-blue-200/50 rounded-sm">
            <p className="text-xs text-slate-400">No reviews have been written for this product yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="py-5 flex flex-col gap-2 text-xs first:pt-0 last:pb-0"
              >
                {/* Rating Badge & Header Comment */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${
                    r.rating >= 3 ? 'bg-[#388e3c]' : r.rating === 2 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}>
                    {r.rating} <Star className="h-2.5 w-2.5 fill-white stroke-none" />
                  </span>
                  <span className="font-semibold text-slate-900 leading-snug">
                    {r.comment.length > 55 ? r.comment.substring(0, 55) + '...' : 'Verified Buyer Review'}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-slate-700 leading-relaxed font-normal">
                  {r.comment}
                </p>

                {/* Footer details: Name, date, certified buyer, helpful voting */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-bold">{r.reviewerName}</span>
                    <span>•</span>
                    <span>{new Date(r.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-0.5 text-[#388e3c] font-bold">
                      <Check size={10} className="stroke-[3]" /> Certified Buyer
                    </span>
                  </div>
                  
                  {/* Helpful Voting */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400">Helpful?</span>
                    <button 
                      onClick={() => handleVote(r.id, 'up')}
                      className={`flex items-center gap-1 hover:text-[#2874f0] transition-colors ${
                        votedReviews[r.id] === 'up' ? 'text-[#2874f0] font-bold' : 'text-slate-400'
                      }`}
                    >
                      <svg className="h-3.5 w-3.5" fill={votedReviews[r.id] === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                      </svg>
                      <span>{votedReviews[r.id] === 'up' ? 13 : 12}</span>
                    </button>
                    <button 
                      onClick={() => handleVote(r.id, 'down')}
                      className={`flex items-center gap-1 hover:text-rose-600 transition-colors ${
                        votedReviews[r.id] === 'down' ? 'text-rose-600 font-bold' : 'text-slate-400'
                      }`}
                    >
                      <svg className="h-3.5 w-3.5" fill={votedReviews[r.id] === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h3a2 2 0 012 2v7a2 2 0 01-2 2h-3" />
                      </svg>
                      <span>{votedReviews[r.id] === 'down' ? 3 : 2}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
