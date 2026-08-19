<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from "vue";
import { useDark, useECharts } from "@pureadmin/utils";
import { getDashboardStats } from "@/api/dashboard";
import type { DashboardStats } from "@/api/dashboard";
import Document from "~icons/ep/document";
import EditPen from "~icons/ep/edit-pen";
import Files from "~icons/ep/files";
import Discount from "~icons/ep/discount";
import Comment from "~icons/ep/comment";
import User from "~icons/ep/user";

defineOptions({ name: "Dashboard" });

const { isDark } = useDark();
const theme = computed(() => (isDark.value ? "dark" : "light"));
const loading = ref(true);
const stats = ref<DashboardStats | null>(null);

// ── 统计卡片配置 ──
const statCards = computed(() => {
  if (!stats.value) return [];
  const c = stats.value.counts;
  return [
    { title: "已发布文章", value: c.posts, icon: Document, color: "#409eff" },
    { title: "草稿", value: c.drafts, icon: EditPen, color: "#409eff" },
    { title: "分类", value: c.categories, icon: Files, color: "#409eff" },
    { title: "标签", value: c.tags, icon: Discount, color: "#409eff" },
    { title: "评论", value: c.comments, icon: Comment, color: "#409eff" },
    { title: "访客", value: c.visitors, icon: User, color: "#409eff" }
  ];
});

// ── 文章趋势图 ──
const postTrendRef = ref();
const { setOptions: setPostTrend } = useECharts(postTrendRef, { theme });

function updatePostTrend() {
  if (!stats.value) return;
  const data = stats.value.post_trend;
  setPostTrend({
    tooltip: { trigger: "axis" },
    grid: {
      top: "10%",
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: data.map(d => d.date.slice(5)),
      axisLabel: { fontSize: 11 }
    },
    yAxis: { type: "value", minInterval: 1 },
    series: [
      {
        name: "发布数",
        type: "line",
        smooth: true,
        symbol: "none",
        areaStyle: { opacity: 0.15 },
        color: "#818cf8",
        data: data.map(d => d.count)
      }
    ]
  });
}

// ── 访客趋势图 ──
const visitorTrendRef = ref();
const { setOptions: setVisitorTrend } = useECharts(visitorTrendRef, { theme });

function updateVisitorTrend() {
  if (!stats.value) return;
  const data = stats.value.visitor_trend;
  setVisitorTrend({
    tooltip: { trigger: "axis" },
    grid: {
      top: "10%",
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: data.map(d => d.date.slice(5)),
      axisLabel: { fontSize: 11 }
    },
    yAxis: { type: "value", minInterval: 1 },
    series: [
      {
        name: "访客数",
        type: "line",
        smooth: true,
        symbol: "none",
        areaStyle: { opacity: 0.15 },
        color: "#22d3ee",
        data: data.map(d => d.count)
      }
    ]
  });
}

// ── 分类分布饼图 ──
const categoryRef = ref();
const { setOptions: setCategory } = useECharts(categoryRef, { theme });

function updateCategory() {
  if (!stats.value) return;
  const data = stats.value.category_distribution;
  setCategory({
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [
      {
        type: "pie",
        radius: ["40%", "65%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: "transparent",
          borderWidth: 2
        },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: "bold" } },
        data: data.length ? data : [{ name: "暂无数据", value: 0 }]
      }
    ]
  });
}

// ── 浏览器分布饼图 ──
const browserRef = ref();
const { setOptions: setBrowser } = useECharts(browserRef, { theme });

function updateBrowser() {
  if (!stats.value) return;
  const data = stats.value.browser_distribution;
  setBrowser({
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [
      {
        type: "pie",
        radius: ["40%", "65%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: "transparent",
          borderWidth: 2
        },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: "bold" } },
        data: data.length ? data : [{ name: "暂无数据", value: 0 }]
      }
    ]
  });
}

// ── 数据加载 ──
onMounted(async () => {
  try {
    stats.value = await getDashboardStats();
    await nextTick();
    updatePostTrend();
    updateVisitorTrend();
    updateCategory();
    updateBrowser();
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-loading="loading" class="p-4">
    <!-- 统计卡片 -->
    <el-row :gutter="16">
      <el-col
        v-for="(item, index) in statCards"
        :key="index"
        :xs="12"
        :sm="8"
        :md="4"
        class="mb-4"
      >
        <el-card shadow="never" class="stat-card">
          <div class="flex items-center gap-3">
            <div class="size-11 rounded-lg flex-c shrink-0">
              <el-icon :size="22" :color="item.color">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="overflow-hidden">
              <p class="text-xs text-gray-500 truncate">{{ item.title }}</p>
              <p class="text-xl font-bold mt-0.5">{{ item.value }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势图行 -->
    <el-row :gutter="16" class="mt-2">
      <el-col :xs="24" :md="12" class="mb-4">
        <el-card shadow="never">
          <template #header>
            <span class="font-medium">文章发布趋势（近30天）</span>
          </template>
          <div ref="postTrendRef" style="width: 100%; height: 280px" />
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12" class="mb-4">
        <el-card shadow="never">
          <template #header>
            <span class="font-medium">访客趋势（近30天）</span>
          </template>
          <div ref="visitorTrendRef" style="width: 100%; height: 280px" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 分布图行 -->
    <el-row :gutter="16">
      <el-col :xs="24" :md="12" class="mb-4">
        <el-card shadow="never">
          <template #header>
            <span class="font-medium">分类分布</span>
          </template>
          <div ref="categoryRef" style="width: 100%; height: 280px" />
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12" class="mb-4">
        <el-card shadow="never">
          <template #header>
            <span class="font-medium">浏览器分布</span>
          </template>
          <div ref="browserRef" style="width: 100%; height: 280px" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.stat-card {
  :deep(.el-card__body) {
    padding: 16px;
  }
}
</style>
