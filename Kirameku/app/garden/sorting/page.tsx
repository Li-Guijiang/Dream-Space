"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
};

type StepKind = "compare" | "swap" | "overwrite" | "sorted" | "pivot";

interface SortStep {
  kind: StepKind;
  indices: number[];
  values?: number[];
}

type AlgoName = "快速排序" | "归并排序" | "堆排序" | "希尔排序" | "基数排序" | "冒泡排序" | "插入排序" | "选择排序";

// ── 生成排序步骤 ──

function genBubbleSteps(arr: number[]): SortStep[] {
  const a = [...arr], steps: SortStep[] = [];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      steps.push({ kind: "compare", indices: [j, j + 1] });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({ kind: "swap", indices: [j, j + 1] });
      }
    }
    steps.push({ kind: "sorted", indices: [n - 1 - i] });
  }
  steps.push({ kind: "sorted", indices: [0] });
  return steps;
}

function genInsertionSteps(arr: number[]): SortStep[] {
  const a = [...arr], steps: SortStep[] = [];
  const n = a.length;
  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    steps.push({ kind: "compare", indices: [i, j] });
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      steps.push({ kind: "overwrite", indices: [j + 1], values: [a[j]] });
      j--;
      if (j >= 0) steps.push({ kind: "compare", indices: [j, j + 1] });
    }
    a[j + 1] = key;
    steps.push({ kind: "overwrite", indices: [j + 1], values: [key] });
  }
  for (let i = 0; i < n; i++) steps.push({ kind: "sorted", indices: [i] });
  return steps;
}

function genSelectionSteps(arr: number[]): SortStep[] {
  const a = [...arr], steps: SortStep[] = [];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      steps.push({ kind: "compare", indices: [minIdx, j] });
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      steps.push({ kind: "swap", indices: [i, minIdx] });
    }
    steps.push({ kind: "sorted", indices: [i] });
  }
  steps.push({ kind: "sorted", indices: [n - 1] });
  return steps;
}

function genQuickSteps(arr: number[]): SortStep[] {
  const a = [...arr], steps: SortStep[] = [];
  function qs(lo: number, hi: number) {
    if (lo >= hi) { if (lo === hi) steps.push({ kind: "sorted", indices: [lo] }); return; }
    const pivot = a[hi];
    steps.push({ kind: "pivot", indices: [hi] });
    let i = lo;
    for (let j = lo; j < hi; j++) {
      steps.push({ kind: "compare", indices: [j, hi] });
      if (a[j] < pivot) {
        [a[i], a[j]] = [a[j], a[i]];
        if (i !== j) steps.push({ kind: "swap", indices: [i, j] });
        i++;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    if (i !== hi) steps.push({ kind: "swap", indices: [i, hi] });
    steps.push({ kind: "sorted", indices: [i] });
    qs(lo, i - 1);
    qs(i + 1, hi);
  }
  qs(0, a.length - 1);
  return steps;
}

function genMergeSteps(arr: number[]): SortStep[] {
  const a = [...arr], steps: SortStep[] = [];
  function ms(lo: number, hi: number) {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    ms(lo, mid);
    ms(mid + 1, hi);
    const tmp: number[] = [];
    let i = lo, j = mid + 1;
    while (i <= mid && j <= hi) {
      steps.push({ kind: "compare", indices: [i, j] });
      if (a[i] <= a[j]) tmp.push(a[i++]);
      else tmp.push(a[j++]);
    }
    while (i <= mid) tmp.push(a[i++]);
    while (j <= hi) tmp.push(a[j++]);
    for (let k = 0; k < tmp.length; k++) {
      a[lo + k] = tmp[k];
      steps.push({ kind: "overwrite", indices: [lo + k], values: [tmp[k]] });
    }
    if (lo === 0 && hi === a.length - 1) {
      for (let k = 0; k < a.length; k++) steps.push({ kind: "sorted", indices: [k] });
    }
  }
  ms(0, a.length - 1);
  return steps;
}

function genHeapSteps(arr: number[]): SortStep[] {
  const a = [...arr], steps: SortStep[] = [];
  const n = a.length;
  function siftDown(size: number, i: number) {
    let largest = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < size) { steps.push({ kind: "compare", indices: [largest, l] }); if (a[l] > a[largest]) largest = l; }
    if (r < size) { steps.push({ kind: "compare", indices: [largest, r] }); if (a[r] > a[largest]) largest = r; }
    if (largest !== i) {
      [a[i], a[largest]] = [a[largest], a[i]];
      steps.push({ kind: "swap", indices: [i, largest] });
      siftDown(size, largest);
    }
  }
  for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(n, i);
  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    steps.push({ kind: "swap", indices: [0, i] });
    steps.push({ kind: "sorted", indices: [i] });
    siftDown(i, 0);
  }
  steps.push({ kind: "sorted", indices: [0] });
  return steps;
}

function genShellSteps(arr: number[]): SortStep[] {
  const a = [...arr], steps: SortStep[] = [];
  const n = a.length;
  let gap = n >> 1;
  while (gap > 0) {
    for (let i = gap; i < n; i++) {
      const temp = a[i];
      let j = i;
      while (j >= gap) {
        steps.push({ kind: "compare", indices: [j - gap, j] });
        if (a[j - gap] > temp) {
          a[j] = a[j - gap];
          steps.push({ kind: "overwrite", indices: [j], values: [a[j - gap]] });
          j -= gap;
        } else break;
      }
      a[j] = temp;
      if (j !== i) steps.push({ kind: "overwrite", indices: [j], values: [temp] });
    }
    gap >>= 1;
  }
  for (let i = 0; i < n; i++) steps.push({ kind: "sorted", indices: [i] });
  return steps;
}

function genRadixSteps(arr: number[]): SortStep[] {
  const a = [...arr], steps: SortStep[] = [];
  const max = Math.max(...a);
  let exp = 1;
  while (max / exp >= 1) {
    const count = Array(10).fill(0);
    const output = new Array(a.length);
    for (const v of a) count[Math.floor(v / exp) % 10]++;
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];
    for (let i = a.length - 1; i >= 0; i--) {
      const digit = Math.floor(a[i] / exp) % 10;
      output[count[digit] - 1] = a[i];
      count[digit]--;
    }
    for (let i = 0; i < a.length; i++) {
      a[i] = output[i];
      steps.push({ kind: "overwrite", indices: [i], values: [output[i]] });
    }
    exp *= 10;
  }
  for (let i = 0; i < a.length; i++) steps.push({ kind: "sorted", indices: [i] });
  return steps;
}

const ALGORITHMS: Record<AlgoName, (arr: number[]) => SortStep[]> = {
  "快速排序": genQuickSteps,
  "归并排序": genMergeSteps,
  "堆排序": genHeapSteps,
  "希尔排序": genShellSteps,
  "基数排序": genRadixSteps,
  "冒泡排序": genBubbleSteps,
  "插入排序": genInsertionSteps,
  "选择排序": genSelectionSteps,
};

const COLORS = {
  default: "#38bdf8",
  compare: "#fbbf24",
  swap: "#f472b6",
  overwrite: "#a78bfa",
  sorted: "#34d399",
  pivot: "#fb923c",
};

export default function SortingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [algo, setAlgo] = useState<AlgoName>("快速排序");
  const [size, setSize] = useState(60);
  const [speed, setSpeed] = useState(8);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const arrRef = useRef<number[]>([]);
  const stepsRef = useRef<SortStep[]>([]);
  const stepIdxRef = useRef(0);
  const highlightsRef = useRef<Map<number, string>>(new Map());
  const runningRef = useRef(false);
  const speedRef = useRef(8);

  runningRef.current = running;
  speedRef.current = speed;

  const genArray = useCallback((n: number) => {
    return Array.from({ length: n }, () => Math.floor(Math.random() * 95) + 5);
  }, []);

  const initArray = useCallback(() => {
    arrRef.current = genArray(size);
    stepsRef.current = [];
    stepIdxRef.current = 0;
    highlightsRef.current = new Map();
    setRunning(false);
    setDone(false);
    setComparisons(0);
    setSwaps(0);
  }, [size, genArray]);

  useEffect(() => { initArray(); }, [initArray]);

  // draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    function resize() {
      const rect = canvas!.parentElement!.getBoundingClientRect();
      canvas!.width = rect.width * devicePixelRatio;
      canvas!.height = rect.height * devicePixelRatio;
      canvas!.style.width = rect.width + "px";
      canvas!.style.height = rect.height + "px";
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      const w = canvas!.clientWidth, h = canvas!.clientHeight;
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);

      const arr = arrRef.current;
      const n = arr.length;
      if (!n) { raf = requestAnimationFrame(draw); return; }
      const barW = Math.max(1, (w - 20) / n - 1);
      const gap = (w - 20) / n;
      const maxVal = Math.max(...arr);
      const highlights = highlightsRef.current;

      for (let i = 0; i < n; i++) {
        const barH = (arr[i] / maxVal) * (h - 40);
        const x = 10 + i * gap;
        const y = h - 20 - barH;
        ctx.fillStyle = highlights.get(i) ?? COLORS.default;
        ctx.fillRect(x, y, barW, barH);
      }

      // legend
      ctx.font = "11px sans-serif";
      const legend = [
        { color: COLORS.compare, label: "比较" },
        { color: COLORS.swap, label: "交换" },
        { color: COLORS.sorted, label: "已排序" },
        { color: COLORS.pivot, label: "基准" },
      ];
      let lx = 12;
      for (const l of legend) {
        ctx.fillStyle = l.color;
        ctx.fillRect(lx, 8, 10, 10);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText(l.label, lx + 14, 17);
        lx += ctx.measureText(l.label).width + 30;
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  // playback loop
  useEffect(() => {
    if (!running) return;
    let timer = 0;
    function tick() {
      if (!runningRef.current) return;
      const steps = stepsRef.current;
      if (stepIdxRef.current >= steps.length) {
        setRunning(false);
        setDone(true);
        return;
      }
      applyStep(steps[stepIdxRef.current]);
      stepIdxRef.current++;
      timer = window.setTimeout(tick, Math.max(5, 2000 / speedRef.current));
    }
    tick();
    return () => clearTimeout(timer);
  }, [running]);

  function applyStep(step: SortStep) {
    const highlights = highlightsRef.current;
    // clear previous non-sorted highlights
    for (const [k, v] of highlights) {
      if (v !== COLORS.sorted) highlights.delete(k);
    }
    const arr = arrRef.current;
    switch (step.kind) {
      case "compare":
        setComparisons(c => c + 1);
        for (const i of step.indices) highlights.set(i, COLORS.compare);
        break;
      case "swap":
        setSwaps(s => s + 1);
        [arr[step.indices[0]], arr[step.indices[1]]] = [arr[step.indices[1]], arr[step.indices[0]]];
        for (const i of step.indices) highlights.set(i, COLORS.swap);
        break;
      case "overwrite":
        setSwaps(s => s + 1);
        if (step.values) {
          for (let i = 0; i < step.indices.length; i++) {
            arr[step.indices[i]] = step.values[i];
            highlights.set(step.indices[i], COLORS.overwrite);
          }
        }
        break;
      case "sorted":
        for (const i of step.indices) highlights.set(i, COLORS.sorted);
        break;
      case "pivot":
        for (const i of step.indices) highlights.set(i, COLORS.pivot);
        break;
    }
  }

  function startSort() {
    if (running) return;
    const steps = ALGORITHMS[algo](arrRef.current);
    stepsRef.current = steps;
    stepIdxRef.current = 0;
    highlightsRef.current = new Map();
    setDone(false);
    setComparisons(0);
    setSwaps(0);
    setRunning(true);
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="p-4 md:p-6 lg:p-8 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">排序算法可视化</h1>
          <p className="text-xs text-slate-400">8 种排序算法逐步演示</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>比较 <b className="text-amber-400">{comparisons}</b></span>
            <span>交换 <b className="text-pink-400">{swaps}</b></span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">数量</label>
            <input type="range" min="10" max="200" step="10" value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-16 accent-sky-500" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">速度</label>
            <input type="range" min="1" max="50" step="1" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-16 accent-sky-500" />
          </div>
          <select
            value={algo}
            onChange={(e) => { setAlgo(e.target.value as AlgoName); initArray(); }}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-0 outline-none cursor-pointer"
          >
            {Object.keys(ALGORITHMS).map((name) => (<option key={name} value={name}>{name}</option>))}
          </select>
          <button
            onClick={() => { if (!running) { initArray(); } }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
          >
            重置
          </button>
          <button
            onClick={startSort}
            disabled={running}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              running
                ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-sky-500 text-white hover:bg-sky-600 active:scale-95"
            }`}
          >
            {done ? "完成" : running ? "排序中..." : "开始排序"}
          </button>
        </div>
      </div>
      <div className="bg-black rounded-xl overflow-hidden border border-white/5" style={{ height: "calc(100vh - 220px)", minHeight: "400px" }}>
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>
    </motion.div>
  );
}
