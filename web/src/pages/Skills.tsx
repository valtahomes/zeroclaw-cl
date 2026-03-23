import { useState, useEffect, useCallback } from 'react';
import { getSkills, installSkill, removeSkill, auditSkill } from '../lib/api';
import type { SkillsListResponse } from '../types/api';

export default function Skills() {
  const [data, setData] = useState<SkillsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installSource, setInstallSource] = useState('');
  const [installing, setInstalling] = useState(false);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getSkills();
      setData(result);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleInstall = async () => {
    if (!installSource.trim()) return;
    setInstalling(true);
    try {
      await installSkill(installSource.trim());
      setInstallSource('');
      await load(); // 刷新列表
    } catch (e: any) {
      setError(e.message);
    } finally {
      setInstalling(false);
    }
  };

  const handleRemove = async (name: string) => {
    if (!confirm(`Remove skill "${name}"?`)) return;
    try {
      await removeSkill(name);
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleAudit = async (name: string) => {
    try {
      const result = await auditSkill(name);
      alert(
        result.is_clean
          ? `✅ ${name}: Clean (${result.files_scanned} files scanned)`
          : `⚠️ ${name}: ${result.findings.join(', ')}`
      );
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <div className="p-6">Loading skills...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Skills</h1>
        <span className="text-sm text-gray-500">
          {data?.total ?? 0} installed
          {data?.open_skills_enabled && ' · Open Skills enabled'}
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {/* 安装区域 */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={installSource}
          onChange={(e) => setInstallSource(e.target.value)}
          placeholder="Git URL or local path (e.g. https://github.com/user/skill.git)"
          className="flex-1 px-3 py-2 border rounded text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleInstall()}
        />
        <button
          onClick={handleInstall}
          disabled={installing || !installSource.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
        >
          {installing ? 'Installing...' : 'Install'}
        </button>
      </div>

      {/* Skills 列表 */}
      <div className="space-y-3">
        {data?.skills.map((skill) => (
          <div key={skill.name} className="border rounded-lg overflow-hidden">
            {/* 卡片头部 */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedSkill(
                expandedSkill === skill.name ? null : skill.name
              )}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{skill.name}</span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                    v{skill.version}
                  </span>
                  {skill.always && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      always
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{skill.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {skill.tools.length} tools · {skill.prompts_count} prompts
                </span>
                <span className="text-gray-400">
                  {expandedSkill === skill.name ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {/* 展开详情 */}
            {expandedSkill === skill.name && (
              <div className="border-t px-4 py-3 bg-gray-50">
                {skill.author && (
                  <p className="text-sm text-gray-500 mb-2">Author: {skill.author}</p>
                )}
                {skill.location && (
                  <p className="text-xs text-gray-400 mb-2 font-mono">{skill.location}</p>
                )}

                {/* Tools 列表 */}
                {skill.tools.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">Tools:</p>
                    <div className="space-y-1">
                      {skill.tools.map((tool) => (
                        <div key={tool.name} className="text-sm flex items-center gap-2">
                          <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">
                            {tool.name}
                          </code>
                          <span className="text-xs bg-gray-100 px-1 rounded">{tool.kind}</span>
                          <span className="text-gray-500">{tool.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleAudit(skill.name)}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                  >
                    🔍 Audit
                  </button>
                  <button
                    onClick={() => handleRemove(skill.name)}
                    className="px-3 py-1 text-sm border border-red-200 text-red-600 rounded hover:bg-red-50"
                  >
                    🗑 Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {data?.skills.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No skills installed. Use the input above to install one.
          </div>
        )}
      </div>
    </div>
  );
}
