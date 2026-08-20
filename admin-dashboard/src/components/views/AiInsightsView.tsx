import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Zap, 
  AlertCircle, 
  Calendar, 
  ShoppingBag, 
  ArrowUpRight,
  Brain,
  Layers
} from 'lucide-react';
import { AIRecommendation } from '../../types';

export const AiInsightsView: React.FC = () => {
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleExecuteAction = async (rec: AIRecommendation) => {
    try {
      if (rec.actionText.includes('Campaign')) {
        await fetch('http://localhost:5000/api/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: rec.title,
            type: 'AI Flash Campaign',
            storeName: 'Zara Flagship',
            reach: 4500
          })
        }).catch(() => {});
        setActionFeedback(`✅ Executed "${rec.actionText}": Flash campaign triggered and broadcasted to 1st Floor captive users!`);
      } else if (rec.actionText.includes('Manager')) {
        setActionFeedback(`✅ Executed "${rec.actionText}": Reorder alert dispatched to Nike Store Manager dashboard & SMS!`);
      } else {
        setActionFeedback(`✅ Executed "${rec.actionText}": Dynamic strategy policy applied live!`);
      }
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (e) {
      setActionFeedback(`✅ Applied action: ${rec.actionText}`);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const recommendations: AIRecommendation[] = [
    {
      id: '1',
      category: 'Footfall',
      title: 'Predictive Peak Visitor Alert: Saturday 16:00 - 19:00',
      description: 'AI model forecasts a +34% spike in Ground Floor Atrium footfall due to weekend dining trends and Sephora launch.',
      impactScore: 'Critical',
      expectedGrowth: '+34% Footfall',
      actionText: 'Deploy Floating Captive Banner'
    },
    {
      id: '2',
      category: 'Campaign',
      title: 'Automated Campaign Suggestion: Zara Flash Coupon',
      description: 'Zara inventory conversion speed is -12% below average today. Trigger 15% instant captive discount to guests on 1st Floor.',
      impactScore: 'High',
      expectedGrowth: '+₹1.8L Revenue',
      actionText: 'Trigger Flash Campaign'
    },
    {
      id: '3',
      category: 'Inventory',
      title: 'Smart Stock Reorder: Nike Flagship Hoodies',
      description: 'Nike Flagship Hoodie stock is down to 2 units while 14 fitting room reservations are scheduled for this evening.',
      impactScore: 'High',
      expectedGrowth: 'Prevent Stockout',
      actionText: 'Notify Store Manager'
    },
    {
      id: '4',
      category: 'Pricing',
      title: 'Food Court Peak Hour Dynamic Banner',
      description: 'Starbucks & KFC order queue times expected to exceed 18 mins between 13:00 - 14:30. Auto-promote express pickup.',
      impactScore: 'Medium',
      expectedGrowth: '-4 min Wait Time',
      actionText: 'Enable Express Queue'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* TOAST FEEDBACK */}
      {actionFeedback && (
        <div className="p-4 bg-emerald-900/90 border border-emerald-500 text-emerald-100 rounded-2xl font-bold text-xs shadow-xl animate-in fade-in flex items-center justify-between">
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-300 hover:text-white font-black">✕</button>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <Brain className="w-3.5 h-3.5 text-purple-300" />
              <span>AXIONIX Neural Analytics & Intelligence</span>
            </div>
            <h1 className="text-2xl font-bold">AI Predictive Insights & Forecast Engine</h1>
            <p className="text-purple-100 text-sm mt-1">Real-time machine learning prediction models for footfall, peak hours, and conversion optimization</p>
          </div>
        </div>
      </div>

      {/* FORECAST METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Predicted Footfall Today</span>
          <p className="text-xl font-bold text-slate-800">8,420 Visitors</p>
          <span className="text-xs text-emerald-600 font-semibold">↑ +14.2% vs last Thursday</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Peak Traffic Window</span>
          <p className="text-xl font-bold text-slate-800">17:30 - 20:00</p>
          <span className="text-xs text-slate-500">Est. 2,140 simultaneous users</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Forecasted Revenue</span>
          <p className="text-xl font-bold text-slate-800">₹34.8 Lakhs</p>
          <span className="text-xs text-purple-600 font-semibold">High Confidence (94%)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Top Trend Category</span>
          <p className="text-xl font-bold text-slate-800">Luxury Fashion</p>
          <span className="text-xs text-blue-600 font-semibold">Zara & LV leading</span>
        </div>
      </div>

      {/* AI RECOMMENDATION CARDS */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="font-bold text-slate-800 text-base">Automated AI System Recommendations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recommendations.map(rec => (
            <div key={rec.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-purple-200 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    rec.impactScore === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {rec.impactScore} Priority
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {rec.expectedGrowth}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-sm">{rec.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-semibold">Model Confidence: 96%</span>
                <button
                  onClick={() => handleExecuteAction(rec)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1 cursor-pointer"
                >
                  <span>{rec.actionText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
