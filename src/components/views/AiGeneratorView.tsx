import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  Hash,
  Copy,
  Check,
  Send,
  Zap,
  Flame,
  Lightbulb,
  Share2
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

export const AiGeneratorView: React.FC = () => {
  const { devices, dispatchInstantTask } = useFarm();
  const [niche, setNiche] = useState('Tech & Gadgets');
  const [topic, setTopic] = useState('AI phone farm automation in 2026');
  const [tone, setTone] = useState<'enthusiastic' | 'analytical' | 'questioning' | 'funny'>('enthusiastic');
  const [generatedComments, setGeneratedComments] = useState<string[]>([
    'The latency on this setup is mind-blowing! Are you running dedicated proxies per device? 🔥',
    'Most people don’t realize how hard anti-detection jitter is to tune. Brilliant engineering!',
    'Can this be scaled to 50+ Pixel devices on a single USB hub without dropouts? 🤔'
  ]);
  const [generatedCaption, setGeneratedCaption] = useState(
    'How 1 person controls 50 physical phones autonomously in 2026 🤖📱 Full breakdown of WebSocket & accessibility services. #ai #automation #tech #trending #farm'
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      if (niche === 'Crypto & Trading') {
        setGeneratedComments([
          'The Fibonacci retracement on this setup is spotless. Watching the 4H breakout! 📈',
          'Risk management > everything else. Great reminder! 💎',
          'Are you using stop-losses on this liquidity zone or holding spot?'
        ]);
        setGeneratedCaption(
          'Top 3 indicators every crypto trader must master before the next bull leg 📈💎 #crypto #bitcoin #trading #finance #wealth'
        );
      } else if (niche === 'Fitness & Gym') {
        setGeneratedComments([
          'Form on that last rep was textbook! Adding this to my leg day split 💪',
          'The pump is insane! How many sets per week for triceps are you doing?',
          'Consistency always wins. Let’s get it! 🔥'
        ]);
        setGeneratedCaption(
          'Save this explosive Chest & Shoulder routine for instant hypertrophy 💪🔥 #gym #fitness #workout #motivation #gains'
        );
      } else {
        setGeneratedComments([
          `The automation on ${topic} is next-level! Super clean execution 🚀`,
          `Been testing similar setups, but this workflow is way more resilient. Awesome share!`,
          `What happens if one device accessibility service crashes? Does the mutex handle auto-restart?`
        ]);
        setGeneratedCaption(
          `The breakthrough strategy for ${topic} everyone is talking about! 🤖✨ #automation #tech #viral #2026 #trends`
        );
      }
      setIsGenerating(false);
    }, 600);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">AI Content & Comment Generator</h1>
          <p className="text-xs text-slate-400">
            Generate organic, non-repetitive comments and viral captions for automated accounts
          </p>
        </div>
      </div>

      {/* Generator Form & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Box (Left 5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#111113] border border-white/5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Prompt Parameters</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Content Niche</label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Tech & Gadgets" className="bg-[#111113]">Tech & Phone Automation</option>
                <option value="Crypto & Trading" className="bg-[#111113]">Crypto & Trading Alpha</option>
                <option value="Fitness & Gym" className="bg-[#111113]">Fitness & Bodybuilding</option>
                <option value="Luxury & Lifestyle" className="bg-[#111113]">Luxury Lifestyle & Real Estate</option>
                <option value="Comedy & Viral" className="bg-[#111113]">Comedy & Entertainment</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Target Video Topic / Hook</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Next-gen battery tech"
                className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Comment Tone</label>
              <div className="grid grid-cols-2 gap-2">
                {(['enthusiastic', 'analytical', 'questioning', 'funny'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`p-2.5 rounded-xl border capitalize text-xs font-medium transition-all ${
                      tone === t
                        ? 'bg-indigo-500/10 border-indigo-500 text-white'
                        : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="btn-generate-ai-comments"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(99,102,241,0.25)] transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isGenerating ? 'Synthesizing with Gemini...' : 'Generate New Content Batch'}</span>
            </button>
          </div>
        </div>

        {/* Results Output (Right 7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Viral Caption Card */}
          <div className="p-5 rounded-2xl bg-[#111113] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-400" />
                <span>Generated Viral Video Caption & Hashtags</span>
              </span>
              <button
                onClick={() => handleCopy(generatedCaption, 99)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                {copiedIndex === 99 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 99 ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0a0b] border border-white/5 text-xs text-slate-200 font-sans leading-relaxed">
              {generatedCaption}
            </div>
          </div>

          {/* Natural Human Comments */}
          <div className="p-5 rounded-2xl bg-[#111113] border border-white/5 space-y-3">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Humanized Comment Variations (Ready for Post_Comment script)</span>
            </span>

            <div className="space-y-2.5">
              {generatedComments.map((comment, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all flex items-start justify-between gap-3 text-xs"
                >
                  <p className="text-slate-200">{comment}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopy(comment, index)}
                      className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        const targetDev = devices[0]?.id;
                        if (targetDev) {
                          dispatchInstantTask('post_comment', targetDev, undefined, { comment_text: comment });
                          alert(`Comment dispatched to phone ${devices[0].laixiId}!`);
                        }
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 shadow-[0_0_8px_rgba(99,102,241,0.25)]"
                    >
                      <Send className="w-2.5 h-2.5" />
                      <span>Post</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
