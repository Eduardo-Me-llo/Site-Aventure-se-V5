import Link from 'next/link';
import { Trip } from '@/types';
import { formatCurrency, formatDateRange, calculateDays, getScarcityBadge, getDifficultyColor } from '@/lib/utils';
import { MapPin, Calendar, Clock, Star, Users, ChevronRight } from 'lucide-react';

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const days = calculateDays(trip.start_date, trip.end_date);
  const difficultyColor = getDifficultyColor(trip.difficulty);
  const firstAcc = trip.accommodations?.[0];
  const scarcity = firstAcc ? getScarcityBadge(firstAcc.capacity, firstAcc.booked_count) : null;
  const lowestPrice = trip.accommodations?.length ? Math.min(...trip.accommodations.map(a => a.price)) : 0;

  return (
    <Link href={`/trips/${trip.slug}`} className="group block h-full">
      <div className="bg-adventure-card rounded-2xl overflow-hidden h-full flex flex-col border border-neutral-300 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(15,131,247,0.15)] relative">
        
        {/* Image & Top Badges */}
          <div className="relative aspect-[4/3] w-full overflow-hidden">
          <img 
            src={trip.cover_image} 
            alt={trip.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-black/10"></div>
          
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="flex flex-col gap-2">
              {trip.is_featured && (
                <span className="inline-flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm text-black text-xs font-bold px-2.5 py-1 rounded-full">
                  <Star className="w-3 h-3 fill-black" /> Destaque
                </span>
              )}
              {scarcity && (
                <span className={`inline-flex items-center gap-1 backdrop-blur-sm text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full ${
                  scarcity.variant === 'danger' ? 'bg-red-500/90' : 
                  scarcity.variant === 'warning' ? 'bg-amber-500/90 text-black' : 
                  'bg-blue-500/90'
                }`}>
                  <Users className="w-3 h-3" /> {scarcity.text}
                </span>
              )}
            </div>
            
            <span className={`inline-flex items-center backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-full ${difficultyColor}`}>
              {trip.difficulty}
            </span>
          </div>
          
          {/* Title overlayed on image bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-blue-500 transition-colors">
              {trip.title}
            </h3>
            <div className="flex items-center gap-1 text-slate-700 text-sm">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span>{trip.location}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow gap-4">
          
          {/* Details Row */}
          <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-slate-700">{formatDateRange(trip.start_date, trip.end_date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{days} dias</span>
            </div>
          </div>

          {/* Highlights */}
          {trip.highlights && trip.highlights.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto">
              {trip.highlights.slice(0, 3).map((highlight, idx) => (
                <span key={idx} className="bg-adventure-card/50 border border-neutral-300/50 text-slate-700 text-xs px-2 py-1 rounded-md">
                  {highlight}
                </span>
              ))}
            </div>
          )}
          
          {/* Divider */}
          <div className="h-px w-full bg-slate-800 my-1"></div>

          {/* Footer: Price & CTA */}
          <div className="flex items-end justify-between mt-auto">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">A partir de</p>
              <p className="text-lg font-bold text-slate-900">
                {formatCurrency(lowestPrice)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-adventure-card flex items-center justify-center group-hover:bg-blue-600 transition-colors border border-neutral-300">
              <ChevronRight className="w-4 h-4 text-slate-900" />
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
}
