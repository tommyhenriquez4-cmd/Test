import React, { useState } from 'react';
import { Terminal, X, Send, RotateCw, Copy, Check } from 'lucide-react';
import { Device } from '../../types';
import { useFarm } from '../../context/FarmContext';

interface AdbTerminalModalProps {
  device: Device;
  onClose: () => void;
}

export const AdbTerminalModal: React.FC<AdbTerminalModalProps> = ({ device, onClose }) => {
  const { executeAdbCommand } = useFarm();
  const [command, setCommand] = useState('adb shell dumpsys battery');
  const [history, setHistory] = useState<Array<{ cmd: string; out: string }>>([
    {
      cmd: `adb -s ${device.serial} get-state`,
      out: 'device'
    },
    {
      cmd: `adb -s ${device.serial} shell dumpsys battery`,
      out: `Current Battery Service state:\n  AC powered: true\n  USB powered: true\n  level: ${device.battery}\n  scale: 100\n  temperature: ${Math.round(device.temperature * 10)}\n  technology: Li-poly`
    }
  ]);
  const [executing, setExecuting] = useState(false);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || executing) return;

    setExecuting(true);
    const cmdToRun = command;
    const output = await executeAdbCommand(device.id, cmdToRun);
    setHistory((prev) => [...prev, { cmd: cmdToRun, out: output }]);
    setExecuting(false);
    setCommand('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#111113] border border-white/10 rounded-2xl p-5 space-y-4 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono font-bold text-white">
              ADB Shell Terminal: {device.serial} ({device.name})
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Commands */}
        <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
          {[
            'dumpsys battery',
            'pm list packages',
            'wm size',
            'input keyevent 26',
            'cat /sdcard/laixi/results/task_latest.json'
          ].map((quickCmd, idx) => (
            <button
              key={idx}
              onClick={() => setCommand(`adb shell ${quickCmd}`)}
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-slate-300 transition-colors"
            >
              {quickCmd}
            </button>
          ))}
        </div>

        {/* Console Output Screen */}
        <div className="flex-1 min-h-[300px] overflow-y-auto p-4 rounded-xl bg-[#0a0a0b] border border-white/5 font-mono text-xs text-slate-200 space-y-3 leading-relaxed">
          <div className="text-slate-500"># Android Debug Bridge v1.0.41 connected to {device.ip}:5555</div>

          {history.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-indigo-400 flex items-center gap-1.5">
                <span className="text-indigo-300 font-bold">$</span>
                <span>{item.cmd}</span>
              </div>
              <div className="text-slate-300 whitespace-pre-wrap pl-3 border-l border-white/10 text-[11px]">
                {item.out}
              </div>
            </div>
          ))}

          {executing && (
            <div className="text-amber-400 animate-pulse flex items-center gap-2">
              <RotateCw className="w-3 h-3 animate-spin" />
              <span>Executing ADB command on physical hardware...</span>
            </div>
          )}
        </div>

        {/* Command Input */}
        <form onSubmit={handleRun} className="flex gap-2">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Type ADB command (e.g. adb shell input tap 500 1000)"
            className="flex-1 p-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={executing}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_10px_rgba(99,102,241,0.25)] transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
