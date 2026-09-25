import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Calendar, MapPin, Video, Clock, Sparkles, ExternalLink } from 'lucide-react';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await apiRequest<any[]>('/public/events');
        if (res.success && res.data) {
          setEvents(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-50 border border-gold-300 text-gold-800 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-gold-600" />
          <span>Campus & Virtual Programmes</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-extrabold text-navy-950">
          Official Events & Sessions
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Upcoming academic conferences, samajam sessions, literary competitions, and youth gatherings.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">Loading upcoming events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-dashed border-slate-300 max-w-lg mx-auto space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-800 text-base">
            No upcoming events currently scheduled
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Official announcements and event schedules will appear here once finalized by the Executive Board (EB).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-navy-900 bg-navy-50 px-2.5 py-0.5 rounded-full border border-navy-200">
                    {evt.category || 'Official Session'}
                  </span>
                  {evt.is_online ? (
                    <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                      <Video className="w-3 h-3 text-red-600" />
                      Live Stream
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Campus Event
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-lg">{evt.title}</h3>
                {evt.description && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {evt.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gold-600" />
                  <span>{new Date(evt.event_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                {evt.event_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{evt.event_time}</span>
                  </div>
                )}
                {evt.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
