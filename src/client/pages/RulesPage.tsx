import React, { useEffect, useState, useMemo } from 'react';
import { Sliders, Plus, Trash2, ArrowUp, ArrowDown, Play, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import type { ScrobbleRule } from '../../services/apiToken';
import { fetchRules, saveRules } from '../services/api';

export default function RulesPage() {
  const [rules, setRules] = useState<ScrobbleRule[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Rule Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRule, setNewRule] = useState<Partial<ScrobbleRule>>({
    name: 'Clean Remastered Tags',
    enabled: true,
    field: 'track',
    operator: 'regex',
    pattern: '\\s*\\((Remastered|Remaster).*?\\)',
    action: 'replace',
    replaceValue: '',
  });

  // Sandbox Test Input
  const [testTrack, setTestTrack] = useState('Never Gonna Give You Up (2021 Remaster)');
  const [testArtist, setTestArtist] = useState('Rick Astley');
  const [testRelease, setTestRelease] = useState('Whenever You Need Somebody');

  useEffect(() => {
    fetchRules().then((loaded) => {
      if (loaded.length === 0) {
        // Initialize default demo rules if empty
        const initialDefaultRules: ScrobbleRule[] = [
          {
            id: 'rule_1',
            name: 'Strip Remastered / Deluxe tags',
            enabled: true,
            field: 'track',
            operator: 'regex',
            pattern: '\\s*\\((Remastered|Deluxe Edition|20\\d\\d Remaster).*?\\)',
            action: 'replace',
            replaceValue: '',
          },
          {
            id: 'rule_2',
            name: 'Trim leading & trailing whitespace',
            enabled: true,
            field: 'track',
            operator: 'regex',
            pattern: '^\\s+|\\s+$',
            action: 'replace',
            replaceValue: '',
          },
        ];
        setRules(initialDefaultRules);
        saveRules(initialDefaultRules);
      } else {
        setRules(loaded);
      }
    });
  }, []);

  const handleSaveRules = async (updated: ScrobbleRule[]) => {
    setRules(updated);
    setSaving(true);
    try {
      await saveRules(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      alert('Failed to persist rules to server');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRule = (id: string) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    handleSaveRules(updated);
  };

  const handleDeleteRule = (id: string) => {
    const updated = rules.filter((r) => r.id !== id);
    handleSaveRules(updated);
  };

  const handleMoveRule = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rules.length) return;
    const copy = [...rules];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    handleSaveRules(copy);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.name || !newRule.pattern) return;
    const rule: ScrobbleRule = {
      id: `rule_${Date.now()}`,
      name: newRule.name || 'Custom Rule',
      enabled: newRule.enabled ?? true,
      field: newRule.field || 'track',
      operator: newRule.operator || 'contains',
      pattern: newRule.pattern || '',
      action: newRule.action || 'replace',
      replaceValue: newRule.replaceValue || '',
    };
    handleSaveRules([...rules, rule]);
    setShowAddForm(false);
  };

  // Sandbox evaluation engine
  const evaluatedResult = useMemo(() => {
    let track = testTrack;
    let artist = testArtist;
    let release = testRelease;
    const appliedRules: string[] = [];
    let isDropped = false;

    for (const rule of rules) {
      if (!rule.enabled || isDropped) continue;

      let targetVal = rule.field === 'track' ? track : rule.field === 'artist' ? artist : release;
      let matched = false;

      try {
        if (rule.operator === 'contains') {
          matched = targetVal.includes(rule.pattern);
        } else if (rule.operator === 'equals') {
          matched = targetVal.toLowerCase() === rule.pattern.toLowerCase();
        } else if (rule.operator === 'regex') {
          const re = new RegExp(rule.pattern, 'gi');
          matched = re.test(targetVal);
        }
      } catch {
        matched = false;
      }

      if (matched) {
        appliedRules.push(rule.name);
        if (rule.action === 'drop') {
          isDropped = true;
          break;
        } else if (rule.action === 'replace') {
          try {
            const re = rule.operator === 'regex' ? new RegExp(rule.pattern, 'gi') : rule.pattern;
            const res = targetVal.replace(re, rule.replaceValue || '');
            if (rule.field === 'track') track = res;
            else if (rule.field === 'artist') artist = res;
            else release = res;
          } catch {
            // invalid regex fallback
          }
        }
      }
    }

    return {
      track,
      artist,
      release,
      isDropped,
      appliedRules,
    };
  }, [testTrack, testArtist, testRelease, rules]);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Scrobble Edit Rules</h2>
              <p className="text-xs text-gray-500">
                Transform or filter incoming metadata before committing to upstream services.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-600 font-medium inline-flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Saved
              </span>
            )}
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Rule
            </button>
          </div>
        </div>

        {/* Add Rule Drawer/Form */}
        {showAddForm && (
          <form onSubmit={handleAddRule} className="p-5 bg-indigo-50/40 border-b border-indigo-100 space-y-4">
            <h3 className="text-sm font-semibold text-indigo-950">Create New Filter Rule</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={newRule.name || ''}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full text-sm px-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:outline-none"
                  placeholder="e.g. Remove (Remastered)"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target Field</label>
                <select
                  value={newRule.field}
                  onChange={(e) => setNewRule({ ...newRule, field: e.target.value as any })}
                  className="w-full text-sm px-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:outline-none"
                >
                  <option value="track">Track Title</option>
                  <option value="artist">Artist Name</option>
                  <option value="release">Release / Album</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Match Type</label>
                <select
                  value={newRule.operator}
                  onChange={(e) => setNewRule({ ...newRule, operator: e.target.value as any })}
                  className="w-full text-sm px-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:outline-none"
                >
                  <option value="regex">Regular Expression (Regex)</option>
                  <option value="contains">Contains Substring</option>
                  <option value="equals">Exact Match</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Pattern</label>
                <input
                  type="text"
                  required
                  value={newRule.pattern || ''}
                  onChange={(e) => setNewRule({ ...newRule, pattern: e.target.value })}
                  className="w-full text-sm font-mono px-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:outline-none"
                  placeholder="e.g. \s*\(Remastered\)"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Action</label>
                <select
                  value={newRule.action}
                  onChange={(e) => setNewRule({ ...newRule, action: e.target.value as any })}
                  className="w-full text-sm px-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:outline-none"
                >
                  <option value="replace">Replace with value</option>
                  <option value="drop">Drop (Ignore scrobble)</option>
                </select>
              </div>

              {newRule.action === 'replace' && (
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Replace With (Leave blank to remove)</label>
                  <input
                    type="text"
                    value={newRule.replaceValue || ''}
                    onChange={(e) => setNewRule({ ...newRule, replaceValue: e.target.value })}
                    className="w-full text-sm font-mono px-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:outline-none"
                    placeholder="Replacement string"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-300 bg-white rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
              >
                Save New Rule
              </button>
            </div>
          </form>
        )}

        {/* Rules List */}
        <div className="divide-y divide-gray-100">
          {rules.length > 0 ? (
            rules.map((rule, idx) => (
              <div key={rule.id} className="p-4 flex items-center justify-between hover:bg-gray-50/70 transition-colors">
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => handleToggleRule(rule.id)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${rule.enabled ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                        {rule.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                        {rule.field} • {rule.operator}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                        {rule.action} {rule.action === 'replace' ? `-> "${rule.replaceValue}"` : ''}
                      </span>
                    </div>
                    <code className="text-xs text-gray-500 font-mono block truncate">
                      {rule.pattern}
                    </code>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleMoveRule(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-20 text-gray-500 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveRule(idx, 'down')}
                    disabled={idx === rules.length - 1}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-20 text-gray-500 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-1 rounded hover:bg-rose-100 text-rose-500 cursor-pointer"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-400">
              <Sliders className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No rules configured yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Rule Testing Sandbox */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Play className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Live Rule Sandbox (Tester)</h2>
              <p className="text-xs text-gray-500">
                Simulate your active rule chain against sample track metadata in real time.
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">
            Live Preview
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Before (Input Metadata)</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Track Name</label>
                <input
                  type="text"
                  value={testTrack}
                  onChange={(e) => setTestTrack(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Artist Name</label>
                <input
                  type="text"
                  value={testArtist}
                  onChange={(e) => setTestArtist(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Release Name</label>
                <input
                  type="text"
                  value={testRelease}
                  onChange={(e) => setTestRelease(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">After (Transformed Output)</h3>
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-3">
              {evaluatedResult.isDropped ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span><strong>Dropped:</strong> This scrobble matched a drop rule and would not be submitted upstream.</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="text-base font-bold text-gray-900">{evaluatedResult.track}</div>
                  <div className="text-sm font-medium text-gray-700">{evaluatedResult.artist}</div>
                  <div className="text-xs text-gray-500">{evaluatedResult.release}</div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200">
                <span className="text-xs font-medium text-gray-600 block mb-1">Applied Rules ({evaluatedResult.appliedRules.length}):</span>
                {evaluatedResult.appliedRules.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {evaluatedResult.appliedRules.map((name, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                        ✓ {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">No rules matched (Metadata left untouched)</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
