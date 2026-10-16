"use client";

import { useEffect, useState, useCallback } from "react";
import { api, Project, Task } from "@/lib/api";
import { CreateRunModal } from "@/components/CreateRunModal";

export default function ProjectsAndTasksPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Project Form
  const [showNewProject, setShowNewProject] = useState<boolean>(false);
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projRepo, setProjRepo] = useState("./examples/invoice-service");
  const [projBranch, setProjBranch] = useState("main");
  const [savingProject, setSavingProject] = useState(false);

  // New Task Form
  const [showNewTask, setShowNewTask] = useState<boolean>(false);
  const [taskName, setTaskName] = useState("");
  const [taskMode, setTaskMode] = useState("optimize");
  const [taskFile, setTaskFile] = useState("app/invoices.py");
  const [taskSymbol, setTaskSymbol] = useState("get_object");
  const [taskBaseline, setTaskBaseline] = useState("3f9c2ab");
  const [taskBenchCmd, setTaskBenchCmd] = useState("python -m bench.invoice_read");
  const [taskTestCmd, setTaskTestCmd] = useState("python -m pytest -q tests/");
  const [savingTask, setSavingTask] = useState(false);

  // Task validation results
  const [validatingTaskId, setValidatingTaskId] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{ id: string; valid: boolean; errors: string[] } | null>(null);

  // Run creation modal state
  const [activeModalTaskId, setActiveModalTaskId] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.listProjects();
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  const loadTasks = useCallback(async (projectId: string) => {
    try {
      const data = await api.listTasks(projectId);
      setTasks(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      loadTasks(selectedProjectId);
    }
  }, [selectedProjectId, loadTasks]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim() || !projRepo.trim()) return;
    setSavingProject(true);
    setError(null);
    try {
      const created = await api.createProject({
        name: projName.trim(),
        description: projDesc.trim(),
        repository_path: projRepo.trim(),
        default_branch: projBranch.trim() || "main",
      });
      setProjects((prev) => [created, ...prev]);
      setSelectedProjectId(created.id);
      setShowNewProject(false);
      setProjName("");
      setProjDesc("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSavingProject(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !taskName.trim() || !taskFile.trim()) return;
    setSavingTask(true);
    setError(null);
    try {
      const created = await api.createTask({
        project_id: selectedProjectId,
        name: taskName.trim(),
        mode: taskMode,
        target_file: taskFile.trim(),
        target_symbol: taskSymbol.trim(),
        target_kind: "function",
        baseline_commit: taskBaseline.trim(),
        benchmark_command: taskBenchCmd.trim().split(" "),
        workload_seed: 20261013,
        warmups: 3,
        samples: 20,
        tau_noise: 0.05,
        regression_budget: 0.05,
        noise_max_rel_mad: 0.1,
        test_command: taskTestCmd.trim().split(" "),
        protected_paths: ["tests/**", "bench/**"],
        sandbox_backend: "nebius",
        require_backend: "nebius",
      });
      setTasks((prev) => [created, ...prev]);
      setShowNewTask(false);
      setTaskName("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSavingTask(false);
    }
  };

  const handleValidateTask = async (taskId: string) => {
    setValidatingTaskId(taskId);
    setValidationResult(null);
    try {
      const res = await api.validateTask(taskId);
      setValidationResult({ id: taskId, valid: res.valid, errors: res.errors });
    } catch (err: unknown) {
      setValidationResult({
        id: taskId,
        valid: false,
        errors: [err instanceof Error ? err.message : "Validation request failed"],
      });
    } finally {
      setValidatingTaskId(null);
    }
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ps-rule">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ps-ink">Projects & Verification Tasks</h1>
          <p className="text-sm text-ps-ink-2">Manage intake contracts, target repositories, and benchmark baselines</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewProject(true)}
            className="badge badge-focus px-3 py-1.5 text-xs cursor-pointer font-medium"
          >
            + Register Project
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-ps-breach/10 border border-ps-breach/30 text-ps-breach text-sm rounded-sm">
          {error}
        </div>
      )}

      {/* Register Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="panel max-w-md w-full bg-ps-sheet shadow-xl border border-ps-rule">
            <h2 className="text-base font-bold mb-1">Register New Project</h2>
            <p className="text-xs text-ps-ink-2 mb-4">Connect a software repository to the verification gauntlet</p>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  placeholder="e.g. Core Payment Service"
                  className="w-full text-sm border border-ps-rule rounded-sm px-2.5 py-1.5 bg-ps-paper"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Repository Path *</label>
                <input
                  type="text"
                  required
                  value={projRepo}
                  onChange={(e) => setProjRepo(e.target.value)}
                  placeholder="e.g. ./examples/invoice-service or https://github.com/..."
                  className="w-full text-sm font-mono border border-ps-rule rounded-sm px-2.5 py-1.5 bg-ps-paper"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Default Branch</label>
                  <input
                    type="text"
                    value={projBranch}
                    onChange={(e) => setProjBranch(e.target.value)}
                    className="w-full text-sm font-mono border border-ps-rule rounded-sm px-2.5 py-1.5 bg-ps-paper"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  rows={2}
                  placeholder="Operational context and security profile"
                  className="w-full text-sm border border-ps-rule rounded-sm px-2.5 py-1.5 bg-ps-paper"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-ps-rule">
                <button
                  type="button"
                  onClick={() => setShowNewProject(false)}
                  className="text-xs px-3 py-1.5 border border-ps-rule rounded-sm text-ps-ink-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProject}
                  className="badge badge-focus text-xs px-4 py-1.5"
                >
                  {savingProject ? "Registering..." : "Register Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: Projects List on Left, Tasks on Right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Project Selector Column */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ps-ink-2 mb-2">Registered Projects ({projects.length})</h2>
          {loading ? (
            <div className="panel text-xs text-ps-ink-2">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="panel text-xs text-ps-ink-2">
              No projects registered yet. Click &quot;+ Register Project&quot; to begin or Seed the Demo.
            </div>
          ) : (
            projects.map((p) => {
              const isSelected = p.id === selectedProjectId;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`panel cursor-pointer transition-all ${
                    isSelected ? "border-ps-focus bg-ps-paper shadow-xs" : "hover:border-ps-edge"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-ps-ink">{p.name}</span>
                    <span className="text-xs text-ps-ink-2 font-mono">v{p.version}</span>
                  </div>
                  <div className="text-xs text-ps-ink-2 font-mono truncate mt-1">{p.repository_path}</div>
                  {p.description && (
                    <p className="text-xs text-ps-ink-2 mt-2 line-clamp-2">{p.description}</p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Task Detail Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-ps-ink-2">
                Tasks for {activeProject ? activeProject.name : "Selected Project"}
              </h2>
            </div>
            {activeProject && (
              <button
                onClick={() => setShowNewTask(true)}
                className="badge badge-focus text-xs px-2.5 py-1 cursor-pointer font-medium"
              >
                + Define Task
              </button>
            )}
          </div>

          {/* New Task Inline Modal */}
          {showNewTask && (
            <div className="panel border-ps-focus bg-ps-sheet space-y-3">
              <div className="flex items-center justify-between border-b border-ps-rule pb-2">
                <h3 className="text-sm font-bold">New Verification Task Intake</h3>
                <button onClick={() => setShowNewTask(false)} className="text-xs text-ps-ink-2">✕</button>
              </div>
              <form onSubmit={handleCreateTask} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Task Identifier *</label>
                    <input
                      type="text"
                      required
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                      placeholder="e.g. invoice-cache-idor"
                      className="w-full text-xs font-mono border border-ps-rule rounded-sm px-2 py-1.5 bg-ps-paper"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Verification Mode</label>
                    <select
                      value={taskMode}
                      onChange={(e) => setTaskMode(e.target.value)}
                      className="w-full text-xs border border-ps-rule rounded-sm px-2 py-1.5 bg-ps-paper"
                    >
                      <option value="optimize">optimize (Perf + Security + Correctness)</option>
                      <option value="audit">audit (DAST + Exploit Discovery)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Target File *</label>
                    <input
                      type="text"
                      required
                      value={taskFile}
                      onChange={(e) => setTaskFile(e.target.value)}
                      placeholder="app/invoices.py"
                      className="w-full text-xs font-mono border border-ps-rule rounded-sm px-2 py-1.5 bg-ps-paper"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Target Symbol *</label>
                    <input
                      type="text"
                      required
                      value={taskSymbol}
                      onChange={(e) => setTaskSymbol(e.target.value)}
                      placeholder="get_object"
                      className="w-full text-xs font-mono border border-ps-rule rounded-sm px-2 py-1.5 bg-ps-paper"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Baseline Commit</label>
                    <input
                      type="text"
                      value={taskBaseline}
                      onChange={(e) => setTaskBaseline(e.target.value)}
                      className="w-full text-xs font-mono border border-ps-rule rounded-sm px-2 py-1.5 bg-ps-paper"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold mb-1">Benchmark Command</label>
                    <input
                      type="text"
                      value={taskBenchCmd}
                      onChange={(e) => setTaskBenchCmd(e.target.value)}
                      className="w-full text-xs font-mono border border-ps-rule rounded-sm px-2 py-1.5 bg-ps-paper"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-ps-rule">
                  <button
                    type="button"
                    onClick={() => setShowNewTask(false)}
                    className="text-xs px-3 py-1 border border-ps-rule rounded-sm text-ps-ink-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingTask}
                    className="badge badge-focus text-xs px-3 py-1"
                  >
                    {savingTask ? "Saving..." : "Create Task"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {tasks.length === 0 ? (
            <div className="panel text-sm text-ps-ink-2 py-8 text-center">
              No tasks defined for this project yet. Click &quot;+ Define Task&quot; to configure a target workload.
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="panel space-y-3 border border-ps-rule">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-ps-ink">{task.name}</span>
                        <span className="badge badge-focus text-xs">{task.mode}</span>
                        <span className="text-xs text-ps-ink-2 font-mono">v{task.version}</span>
                      </div>
                      <div className="font-mono text-xs text-ps-ink-2 mt-1">
                        {task.target_file} :: <span className="text-ps-focus font-bold">{task.target_symbol}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleValidateTask(task.id)}
                        disabled={validatingTaskId === task.id}
                        className="text-xs border border-ps-rule px-2.5 py-1 rounded-sm text-ps-ink-2 hover:text-ps-ink hover:bg-ps-paper cursor-pointer"
                      >
                        {validatingTaskId === task.id ? "Validating..." : "Validate Intake"}
                      </button>
                      <button
                        onClick={() => setActiveModalTaskId(task.id)}
                        className="badge badge-focus text-xs px-3 py-1 cursor-pointer font-medium"
                      >
                        🚀 Dispatch Run
                      </button>
                    </div>
                  </div>

                  {/* Benchmark & Isolation Specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-ps-paper p-2 rounded-sm font-mono">
                    <div>
                      <span className="text-ps-ink-2 block">Baseline:</span>
                      <span>{task.baseline_commit}</span>
                    </div>
                    <div>
                      <span className="text-ps-ink-2 block">Samples:</span>
                      <span>{task.samples} (rel_MAD &le; {task.noise_max_rel_mad})</span>
                    </div>
                    <div>
                      <span className="text-ps-ink-2 block">Sandbox:</span>
                      <span>{task.sandbox_backend}</span>
                    </div>
                    <div>
                      <span className="text-ps-ink-2 block">Test Cmd:</span>
                      <span className="truncate block">{task.test_command?.join(" ") || "pytest"}</span>
                    </div>
                  </div>

                  {/* Validation Feedback */}
                  {validationResult && validationResult.id === task.id && (
                    <div
                      className={`p-2 rounded-sm text-xs ${
                        validationResult.valid
                          ? "bg-ps-seated/10 border border-ps-seated/30 text-ps-seated"
                          : "bg-ps-breach/10 border border-ps-breach/30 text-ps-breach"
                      }`}
                    >
                      {validationResult.valid ? (
                        <div className="font-semibold">✓ Task Intake Schema Validated: Ready for execution gauntlet.</div>
                      ) : (
                        <div>
                          <div className="font-semibold mb-1">✗ Intake Schema Violations:</div>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {validationResult.errors.map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Run Creation Modal */}
      {activeModalTaskId && (
        <CreateRunModal
          isOpen={true}
          onClose={() => setActiveModalTaskId(null)}
          initialProjectId={selectedProjectId || undefined}
          initialTaskId={activeModalTaskId}
        />
      )}
    </div>
  );
}
