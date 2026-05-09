"use client";

import {
  CSSProperties,
  FormEvent,
  PointerEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Task = {
  id: string;
  title: string;
  zone: ZoneId;
  completed: boolean;
};

type ZoneId = "inbox" | "do" | "schedule" | "delegate" | "delete";

const initialTasks: Task[] = [];

const matrixZones: { id: Exclude<ZoneId, "inbox">; title: string; tone: string }[] = [
  {
    id: "do",
    title: "Acil ve Onemli",
    tone: "border-rose-200/80 bg-rose-100/90",
  },
  {
    id: "schedule",
    title: "Onemli, Acil Degil",
    tone: "border-sky-200/80 bg-sky-100/90",
  },
  {
    id: "delegate",
    title: "Acil, Onemli Degil",
    tone: "border-violet-200/80 bg-violet-100/90",
  },
  {
    id: "delete",
    title: "Acil Degil, Onemli Degil",
    tone: "border-lime-200/80 bg-lime-100/90",
  },
];

type CloudShape = {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  width: number;
  height: number;
  radius: string;
  color: string;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [taskTitle, setTaskTitle] = useState("");
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [showListMatrix, setShowListMatrix] = useState(false);
  const matrixTasks = tasks.filter((task) => task.zone !== "inbox");
  const showMatrix = draggingTaskId !== null || showListMatrix;

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = taskTitle.trim();
    if (!cleanTitle) {
      return;
    }

    setTasks((currentTasks) => [
      {
        id: crypto.randomUUID(),
        title: cleanTitle,
        zone: "inbox",
        completed: false,
      },
      ...currentTasks,
    ]);
    setTaskTitle("");
  }

  function moveTaskToZone(taskId: string, zone: ZoneId) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, zone } : task,
      ),
    );
  }

  function dropCloudInZone(taskId: string, zone: ZoneId) {
    moveTaskToZone(taskId, zone);
    setShowListMatrix(false);
  }

  function deleteTask(taskId: string) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    );
  }

  function renameTask(taskId: string, title: string) {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, title: cleanTitle } : task,
      ),
    );
  }

  function toggleTaskCompleted(taskId: string) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#eef3f8] px-3 py-4 text-slate-950 sm:px-6 sm:py-6 lg:px-10">
      {showMatrix ? (
        <MatrixTargets
          tasks={matrixTasks}
          showCloseButton={showListMatrix}
          onClose={() => setShowListMatrix(false)}
          onDeleteTask={deleteTask}
          onRenameTask={renameTask}
          onMoveTask={moveTaskToZone}
          onToggleCompleted={toggleTaskCompleted}
        />
      ) : null}

      {tasks.filter((task) => task.zone === "inbox").map((task, index) => (
        <Cloud
          key={task.id}
          task={task}
          index={index}
          onDragStart={setDraggingTaskId}
          onDragEnd={() => setDraggingTaskId(null)}
          onDropInZone={dropCloudInZone}
        />
      ))}

      <section className="relative z-10 w-full max-w-[min(42rem,calc(100vw-1.5rem))] sm:max-w-2xl">
        <form
          onSubmit={addTask}
          className="flex flex-col gap-2 rounded-lg border border-white/80 bg-white/90 p-2.5 shadow-xl shadow-slate-300/30 backdrop-blur-md sm:flex-row sm:gap-3 sm:p-3"
        >
          <label className="sr-only" htmlFor="task">
            Gorev
          </label>
          <input
            id="task"
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
            placeholder="Yeni gorev ekle..."
            className="min-h-11 flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 text-base outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white sm:min-h-12 sm:px-4"
          />
          <button
            type="submit"
            className="min-h-11 rounded-md bg-sky-600 px-5 text-sm font-semibold text-white transition hover:bg-sky-700 sm:min-h-12 sm:px-6"
          >
            Ekle
          </button>
          <button
            type="button"
            onClick={() => setShowListMatrix((isVisible) => !isVisible)}
            className="min-h-11 rounded-md border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-sky-200 hover:bg-sky-50 sm:min-h-12 sm:px-6"
          >
            List
          </button>
        </form>
      </section>
    </main>
  );
}

function MatrixTargets({
  tasks,
  showCloseButton,
  onClose,
  onDeleteTask,
  onRenameTask,
  onMoveTask,
  onToggleCompleted,
}: {
  tasks: Task[];
  showCloseButton: boolean;
  onClose: () => void;
  onDeleteTask: (taskId: string) => void;
  onRenameTask: (taskId: string, title: string) => void;
  onMoveTask: (taskId: string, zone: ZoneId) => void;
  onToggleCompleted: (taskId: string) => void;
}) {
  return (
    <section className="pointer-events-none fixed inset-0 z-30 grid grid-cols-2 grid-rows-2 gap-2 p-2 sm:gap-4 sm:p-4 md:gap-6 md:p-6 xl:gap-8 xl:p-8">
      {showCloseButton ? (
        <button
          type="button"
          aria-label="Listeyi kapat"
          onClick={onClose}
          className="pointer-events-auto fixed right-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-950 text-xl font-semibold leading-none text-white shadow-2xl transition hover:bg-slate-800 sm:right-5 sm:top-5 sm:h-12 sm:w-12 sm:text-2xl"
        >
          x
        </button>
      ) : null}

      {matrixZones.map((zone) => {
        const zoneTasks = tasks.filter((task) => task.zone === zone.id);

        return (
          <div
            key={zone.id}
            data-matrix-zone={zone.id}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              const taskId = event.dataTransfer.getData("text/plain");
              if (taskId) {
                onMoveTask(taskId, zone.id);
              }
            }}
            className={`pointer-events-auto min-h-0 rounded-lg border p-2.5 shadow-2xl shadow-slate-500/20 backdrop-blur-md sm:p-3 md:p-4 ${zone.tone}`}
          >
            <div className="mb-2 text-xs font-bold leading-4 text-slate-800 sm:mb-3 sm:text-sm md:text-base">
              {zone.title}
            </div>
            <div className="flex max-h-[calc(50dvh-70px)] flex-col gap-1.5 overflow-y-auto pr-0.5 sm:max-h-[calc(50dvh-86px)] sm:gap-2">
              {zoneTasks.map((task) => (
                <MatrixTaskCard
                  key={task.id}
                  task={task}
                  onDelete={onDeleteTask}
                  onRename={onRenameTask}
                  onToggleCompleted={onToggleCompleted}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function MatrixTaskCard({
  task,
  onDelete,
  onRename,
  onToggleCompleted,
}: {
  task: Task;
  onDelete: (taskId: string) => void;
  onRename: (taskId: string, title: string) => void;
  onToggleCompleted: (taskId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const cardRef = useRef<HTMLDivElement>(null);

  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onRename(task.id, editTitle);
    setIsEditing(false);
  }

  function cancelEdit() {
    setEditTitle(task.title);
    setIsEditing(false);
  }

  return (
    <div
      ref={cardRef}
      className={`rounded-md border px-2 py-1.5 text-xs font-semibold leading-5 shadow-sm sm:px-3 sm:py-2 sm:text-sm ${
        isConfirmingDelete
          ? "border-red-200 bg-red-50"
          : "border-white/70 bg-white/85"
      }`}
    >
      {isEditing ? (
        <form onSubmit={saveEdit} className="flex gap-1.5 sm:gap-2">
          <label className="sr-only" htmlFor={`edit-${task.id}`}>
            Gorev duzenle
          </label>
          <input
            id={`edit-${task.id}`}
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
            className="min-h-8 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs outline-none focus:border-sky-500 sm:min-h-9 sm:text-sm"
          />
          <IconButton label="Kaydet" type="submit">
            <CheckIcon />
          </IconButton>
          <IconButton label="Iptal" onClick={cancelEdit}>
            <CloseIcon />
          </IconButton>
        </form>
      ) : (
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          {isConfirmingDelete ? (
            <div className="min-w-0 flex-1 truncate text-red-700">
              Siliyorum?
            </div>
          ) : (
            <button
              type="button"
              aria-label={
                task.completed ? "Tamamlanmadi olarak isaretle" : "Tamamlandi"
              }
              onClick={() => onToggleCompleted(task.id)}
              className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1 py-1 text-left transition hover:bg-white/70 sm:gap-2"
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full sm:h-2.5 sm:w-2.5 ${
                  task.completed ? "bg-emerald-500" : "bg-zinc-300"
                }`}
              />

              <span
                className={`min-w-0 flex-1 truncate ${
                  task.completed ? "text-zinc-400 line-through" : "text-zinc-900"
                }`}
              >
                {task.title}
              </span>
            </button>
          )}

          <div className="flex shrink-0 gap-0.5 sm:gap-1">
            {isConfirmingDelete ? (
              <>
                <IconButton label="Sil" onClick={() => onDelete(task.id)}>
                  <CheckIcon />
                </IconButton>
                <IconButton
                  label="Iptal"
                  onClick={() => setIsConfirmingDelete(false)}
                >
                  <CloseIcon />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton
                  label="Duzenle"
                  onClick={() => {
                    setEditTitle(task.title);
                    setIsEditing(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <button
                  type="button"
                  draggable
                  aria-label="Tasi"
                  title="Tasi"
                  onClick={(event) => event.stopPropagation()}
                  onDragStart={(event) => {
                    event.stopPropagation();
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", task.id);
                    if (cardRef.current) {
                      event.dataTransfer.setDragImage(cardRef.current, 24, 20);
                    }
                  }}
                  className="flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 active:cursor-grabbing sm:h-8 sm:w-8"
                >
                  <MoveIcon />
                </button>
                <IconButton
                  label="Sil"
                  onClick={() => setIsConfirmingDelete(true)}
                >
                  <TrashIcon />
                </IconButton>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function IconButton({
  label,
  children,
  type = "button",
  onClick,
}: {
  label: string;
  children: ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 sm:h-8 sm:w-8"
    >
      {children}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="m5 12 4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M3 6h18M8 6V4h8v2M7 6l1 14h8l1-14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoveIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M12 3v18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12h18M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Cloud({
  task,
  index,
  onDragStart,
  onDragEnd,
  onDropInZone,
}: {
  task: Task;
  index: number;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onDropInZone: (taskId: string, zone: ZoneId) => void;
}) {
  const shape = useMemo(() => createCloudShape(task.id, index), [task.id, index]);
  const cloudRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const positionRef = useRef(shape.position);
  const velocityRef = useRef(shape.velocity);
  const dragRef = useRef({
    active: false,
    offsetX: 0,
    offsetY: 0,
    lastX: shape.position.x,
    lastY: shape.position.y,
    lastTime: 0,
  });
  const [position, setPosition] = useState(shape.position);
  const [isDragging, setIsDragging] = useState(false);

  const cloudStyle: CSSProperties = {
    width: `min(${shape.width}px, calc(100vw - 32px))`,
    height: `clamp(78px, 22vw, ${shape.height}px)`,
    borderRadius: shape.radius,
    background: shape.color,
    zIndex: isDragging ? 50 : 20,
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
  };

  useEffect(() => {
    function animate() {
      const cloud = cloudRef.current;

      if (cloud && !dragRef.current.active) {
        const width = cloud.offsetWidth;
        const height = cloud.offsetHeight;
        const maxX = Math.max(0, window.innerWidth - width);
        const maxY = Math.max(0, window.innerHeight - height);
        const nextPosition = {
          x: positionRef.current.x + velocityRef.current.x,
          y: positionRef.current.y + velocityRef.current.y,
        };

        if (nextPosition.x <= 0 || nextPosition.x >= maxX) {
          velocityRef.current.x *= -1;
          nextPosition.x = Math.min(Math.max(nextPosition.x, 0), maxX);
        }

        if (nextPosition.y <= 0 || nextPosition.y >= maxY) {
          velocityRef.current.y *= -1;
          nextPosition.y = Math.min(Math.max(nextPosition.y, 0), maxY);
        }

        positionRef.current = nextPosition;
        setPosition(nextPosition);
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  function moveCloud(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active || !cloudRef.current) {
      return;
    }

    const width = cloudRef.current.offsetWidth;
    const height = cloudRef.current.offsetHeight;
    const maxX = Math.max(0, window.innerWidth - width);
    const maxY = Math.max(0, window.innerHeight - height);
    const nextPosition = {
      x: Math.min(Math.max(event.clientX - dragRef.current.offsetX, 0), maxX),
      y: Math.min(Math.max(event.clientY - dragRef.current.offsetY, 0), maxY),
    };
    const now = performance.now();
    const elapsed = Math.max(16, now - dragRef.current.lastTime);

    velocityRef.current = {
      x: ((nextPosition.x - dragRef.current.lastX) / elapsed) * 16,
      y: ((nextPosition.y - dragRef.current.lastY) / elapsed) * 16,
    };
    dragRef.current.lastX = nextPosition.x;
    dragRef.current.lastY = nextPosition.y;
    dragRef.current.lastTime = now;
    positionRef.current = nextPosition;
    setPosition(nextPosition);
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    const cloud = cloudRef.current;
    if (!cloud) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    onDragStart(task.id);
    setIsDragging(true);
    dragRef.current = {
      active: true,
      offsetX: event.clientX - positionRef.current.x,
      offsetY: event.clientY - positionRef.current.y,
      lastX: positionRef.current.x,
      lastY: positionRef.current.y,
      lastTime: performance.now(),
    };
  }

  function stopDrag(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current.active = false;
    setIsDragging(false);

    const droppedZone = findDropZone(event.clientX, event.clientY);
    if (droppedZone) {
      onDropInZone(task.id, droppedZone);
      onDragEnd();
      return;
    }

    if (Math.abs(velocityRef.current.x) < 0.4) {
      velocityRef.current.x = velocityRef.current.x < 0 ? -1.6 : 1.6;
    }

    if (Math.abs(velocityRef.current.y) < 0.4) {
      velocityRef.current.y = velocityRef.current.y < 0 ? -1.2 : 1.2;
    }

    onDragEnd();
  }

  return (
    <div
      ref={cloudRef}
      role="presentation"
      onPointerDown={startDrag}
      onPointerMove={moveCloud}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
      className="cloud-shape"
      style={cloudStyle}
    >
      {task.title}
    </div>
  );
}

function findDropZone(clientX: number, clientY: number): ZoneId | null {
  const zoneElement = document
    .elementsFromPoint(clientX, clientY)
    .find((element) => element instanceof HTMLElement && element.dataset.matrixZone);

  if (!(zoneElement instanceof HTMLElement)) {
    return null;
  }

  return (zoneElement.dataset.matrixZone as ZoneId | undefined) ?? null;
}

function createCloudShape(seed: string, index: number): CloudShape {
  const hash = hashString(seed);
  const cloudColors = ["#ffffff", "#f8fbff", "#fff7ed", "#f0fdfa", "#fdf2f8"];
  const width = 180 + (hash % 96);
  const height = 88 + ((hash >> 3) % 48);
  const directionX = hash % 2 === 0 ? 1 : -1;
  const directionY = hash % 3 === 0 ? 1 : -1;

  return {
    position: {
      x: 40 + ((hash + index * 83) % 520),
      y: 40 + (((hash >> 4) + index * 67) % 340),
    },
    velocity: {
      x: directionX * (1.2 + ((hash >> 6) % 16) / 10),
      y: directionY * (1 + ((hash >> 10) % 14) / 10),
    },
    width,
    height,
    radius: `${54 + (hash % 10)}% ${46 + ((hash >> 3) % 12)}% ${
      58 + ((hash >> 6) % 10)
    }% ${48 + ((hash >> 9) % 12)}% / ${62 + ((hash >> 12) % 10)}% ${
      48 + ((hash >> 15) % 12)
    }% ${64 + ((hash >> 18) % 9)}% ${46 + ((hash >> 21) % 13)}%`,
    color: cloudColors[hash % cloudColors.length],
  };
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}
