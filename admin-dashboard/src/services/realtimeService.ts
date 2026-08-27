import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

type RealtimeEventType = 'notifications' | 'activity_logs' | 'wifi_sessions' | 'orders' | 'reservations' | 'mall_dashboard_metrics';

type RealtimeCallback = (payload: any) => void;

class CentralizedRealtimeManager {
  private channel: RealtimeChannel | null = null;
  private listeners: Map<RealtimeEventType, Set<RealtimeCallback>> = new Map();
  private isSubscribed = false;
  private isInitializing = false;

  constructor() {
    this.listeners.set('notifications', new Set());
    this.listeners.set('activity_logs', new Set());
    this.listeners.set('wifi_sessions', new Set());
    this.listeners.set('orders', new Set());
    this.listeners.set('reservations', new Set());
    this.listeners.set('mall_dashboard_metrics', new Set());
  }

  public subscribe(eventType: RealtimeEventType, callback: RealtimeCallback): () => void {
    const set = this.listeners.get(eventType);
    if (set) {
      set.add(callback);
    }
    return () => {
      set?.delete(callback);
    };
  }

  private dispatch(eventType: RealtimeEventType, payload: any) {
    const set = this.listeners.get(eventType);
    if (set) {
      set.forEach(cb => {
        try {
          cb(payload);
        } catch (err) {
          console.warn(`[Realtime] Listener error on ${eventType}:`, err);
        }
      });
    }
  }

  public init() {
    if (!isSupabaseConfigured || this.isSubscribed || this.isInitializing) {
      return;
    }

    this.isInitializing = true;

    try {
      if (this.channel) {
        supabase.removeChannel(this.channel);
        this.channel = null;
      }

      this.channel = supabase.channel('axionix-admin-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications' },
          payload => this.dispatch('notifications', payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'activity_logs' },
          payload => this.dispatch('activity_logs', payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'wifi_sessions' },
          payload => this.dispatch('wifi_sessions', payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          payload => this.dispatch('wifi_sessions', payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'store_visits' },
          payload => this.dispatch('wifi_sessions', payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          payload => this.dispatch('orders', payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reservations' },
          payload => this.dispatch('reservations', payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'mall_dashboard_metrics' },
          payload => this.dispatch('mall_dashboard_metrics', payload)
        );

      this.channel.subscribe((status, err) => {
        this.isInitializing = false;
        if (status === 'SUBSCRIBED') {
          this.isSubscribed = true;
          console.log('[Supabase Realtime] Connected to live mall events feed.');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.isSubscribed = false;
          if (err) {
            console.warn('[Supabase Realtime] Channel status:', status, err.message);
          }
        }
      });
    } catch (err) {
      this.isInitializing = false;
      console.warn('[Supabase Realtime] Initialization failed:', err);
    }
  }

  public cleanup() {
    if (this.channel) {
      try {
        supabase.removeChannel(this.channel);
      } catch (err) {
        console.warn('[Supabase Realtime] Cleanup error:', err);
      }
      this.channel = null;
    }
    this.isSubscribed = false;
    this.isInitializing = false;
    console.log('[Supabase Realtime] Cleaned up subscriptions.');
  }

  public getStatus() {
    return {
      isSubscribed: this.isSubscribed,
      channelName: this.channel?.topic || null
    };
  }
}

export const realtimeManager = new CentralizedRealtimeManager();
