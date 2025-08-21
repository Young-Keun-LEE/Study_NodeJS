import React, { useEffect, useMemo, useRef, useState } from "react";

// Single-file React Todo List
// - Add / edit / delete / toggle complete
// - Filters: All / Active / Completed
// - Search
// - Persistent via localStorage
// - Keyboard friendly (Enter to add/save, Esc to cancel edit)
// - Clean Tailwind styling

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `t_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const FILTERS = {
  all: {
    label: "All",
    fn: () => true,
  },
  active: {
    label: "Active",
    fn: (t) => !t.done,
  },
  completed: {
    label: "Completed",
    fn: (t) => t.done,
  },
};

export default function TodoApp() {
  const [todos, setTodos] = useLocalStorage("todos.v1", []);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    const byFilter = todos.filter(FILTERS[filter].fn);
    const q = search.trim().toLowerCase();
    return q ? byFilter.filter((t) => t.text.toLowerCase().includes(q)) : byFilter;
  }, [todos, filter, search]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.done).length;
    const active = total - completed;
    return { total, completed, active };
  }, [todos]);

  function addTodo() {
    const val = text.trim();
    if (!val) return;
    const newTodo = { id: uid(), text: val, done: false, createdAt: Date.now() };
    setTodos([newTodo, ...todos]);
    setText("");
    inputRef.current?.focus();
  }

  function toggle(id) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.done));
  }

  function startEdit(todo) {
    setEditingId(todo.id);
    setEditingText(todo.text);
  }

  function saveEdit() {
    const val = editingText.trim();
    if (!editingId) return;
    if (!val) {
      // empty -> delete
      setTodos((prev) => prev.filter((t) => t.id !== editingId));
    } else {
      setTodos((prev) => prev.map((t) => (t.id === editingId ? { ...t, text: val } : t)));
    }
    setEditingId(null);
    setEditingText("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingText("");
  }

  function toggleAll(done) {
    setTodos((prev) => prev.map((t) => ({ ...t, done })));
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Todo List</h1>
            <p className="text-sm text-gray-500">Lightweight • Persistent • Keyboard-friendly</p>
          </div>
          <div className="text-sm text-gray-600">
            <div className="font-medium">{stats.active} active</div>
            <div className="text-gray-500">{stats.completed} completed</div>
          </div>
        </header>

        {/* Input Row */}
        <div className="flex gap-2 mb-4">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTodo();
            }}
            placeholder="Add a new task and press Enter"
            className="flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-4 focus:ring-gray-200"
          />
          <button
            onClick={addTodo}
            className="rounded-2xl px-4 py-3 border border-gray-300 bg-white hover:shadow-sm active:scale-[0.99]"
            aria-label="Add todo"
          >
            Add
          </button>
        </div>

        {/* Controls */}
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-2">
            {Object.entries(FILTERS).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-xl px-3 py-2 text-sm transition ${
                  filter === key ? "bg-gray-900 text-white" : "hover:bg-gray-100"
                }`}
              >
                {cfg.label}
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks"
              className="w-full rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-gray-200 bg-white p-2">
            <button
              onClick={() => toggleAll(true)}
              className="rounded-xl px-3 py-2 text-sm hover:bg-gray-100"
              title="Mark all as completed"
            >
              Complete all
            </button>
            <button
              onClick={() => toggleAll(false)}
              className="rounded-xl px-3 py-2 text-sm hover:bg-gray-100"
              title="Mark all as active"
            >
              Reset all
            </button>
            <button
              onClick={clearCompleted}
              className="rounded-xl px-3 py-2 text-sm hover:bg-gray-100"
              title="Remove all completed tasks"
            >
              Clear completed
            </button>
          </div>
        </div>

        {/* List */}
        <ul className="space-y-2">
          {filtered.length === 0 && (
            <li className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
              No tasks yet. Add one above!
            </li>
          )}

          {filtered.map((todo) => (
            <li
              key={todo.id}
              className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow"
            >
              <input
                type="checkbox"
                checked={!!todo.done}
                onChange={() => toggle(todo.id)}
                className="h-5 w-5 rounded border-gray-300"
                aria-label={todo.done ? "Mark as active" : "Mark as completed"}
              />

              {editingId === todo.id ? (
                <input
                  autoFocus
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="flex-1 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
                />
              ) : (
                <button
                  onClick={() => startEdit(todo)}
                  className={`flex-1 text-left ${todo.done ? "text-gray-400 line-through" : ""}`}
                  title="Click to edit"
                >
                  {todo.text}
                </button>
              )}

              {editingId === todo.id ? (
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => remove(todo.id)}
                  className="invisible rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 group-hover:visible"
                  title="Delete"
                  aria-label="Delete todo"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>

        <footer className="mt-6 text-center text-xs text-gray-500">
          <p>
            Data is stored in your browser (localStorage). Clearing site data will remove your tasks.
          </p>
        </footer>
      </div>
    </div>
  );
}
