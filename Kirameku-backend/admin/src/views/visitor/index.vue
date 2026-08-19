<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { message } from "@/utils/message";
import { getVisitors, getVisitorCount, deleteVisitor, clearVisitors } from "@/api/visitor";
import type { VisitorItem } from "@/api/visitor";
import type { PaginationProps } from "@pureadmin/table";

defineOptions({ name: "VisitorIndex" });

const loading = ref(false);
const dataList = ref<VisitorItem[]>([]);

const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 20,
  currentPage: 1,
  background: true
});

const columns: TableColumnList = [
  { label: "ID", prop: "id", width: 60 },
  { label: "IP", prop: "ip", width: 80, slot: "ip" },
  { label: "位置", prop: "location", width: 180, slot: "location" },
  { label: "运营商", prop: "org", minWidth: 120, slot: "org" },
  { label: "ASN", prop: "asn", width: 120, slot: "asn" },
  { label: "网络", prop: "network", width: 80, slot: "network" },
  { label: "浏览器", prop: "browser", width: 90 },
  { label: "系统", prop: "os", width: 90 },
  { label: "设备", prop: "device_type", width: 70 },
  { label: "访问页面", prop: "path", minWidth: 160 },
  {
    label: "访问时间",
    prop: "created_at",
    minWidth: 160,
    formatter: ({ created_at }) =>
      created_at ? created_at.replace("T", " ").slice(0, 19) : ""
  },
  {
    label: "操作",
    fixed: "right",
    width: 120,
    slot: "operation"
  }
];

async function onSearch() {
  loading.value = true;
  try {
    const [res, countRes] = await Promise.all([
      getVisitors({
        page: pagination.currentPage,
        size: pagination.pageSize
      }),
      getVisitorCount()
    ]);
    dataList.value = res.data ?? [];
    pagination.total = countRes.count;
  } finally {
    loading.value = false;
  }
}

function handleSizeChange(val: number) {
  pagination.pageSize = val;
  pagination.currentPage = 1;
  onSearch();
}

function handleCurrentChange(val: number) {
  pagination.currentPage = val;
  onSearch();
}

async function handleDelete(row: VisitorItem) {
  try {
    await deleteVisitor(row.id);
    message("删除成功", { type: "success" });
    onSearch();
  } catch (e: any) {
    message(e?.message ?? "删除失败", { type: "error" });
  }
}

async function handleClear() {
  try {
    await clearVisitors();
    message("已清空", { type: "success" });
    onSearch();
  } catch (e: any) {
    message(e?.message ?? "清空失败", { type: "error" });
  }
}

onMounted(() => onSearch());
</script>

<template>
  <div class="p-4">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-medium">访客记录</span>
          <el-popconfirm title="确认清空所有访客记录？" @confirm="handleClear">
            <template #reference>
              <el-button type="danger" size="small">清空</el-button>
            </template>
          </el-popconfirm>
        </div>
      </template>

      <pure-table
        :data="dataList"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        align-whole="center"
        row-key="id"
        table-layout="auto"
        @page-size-change="handleSizeChange"
        @page-current-change="handleCurrentChange"
      >
        <template #ip="{ row }">
          <span :title="row.ip" class="ip-cell">{{ row.ip }}</span>
        </template>

        <template #location="{ row }">
          <span class="text-sm">
            {{
              [row.country, row.region, row.city, row.district].filter(Boolean).join(" · ") ||
              "未知"
            }}
          </span>
        </template>

        <template #asn="{ row }">
          <el-tooltip placement="top">
            <template #content>
              <div class="text-xs">{{ row.asn }}</div>
              <div v-if="row.org_cn" class="text-xs mt-1">{{ row.org_cn }}</div>
            </template>
            <span class="asn-cell">{{ row.asn }}</span>
          </el-tooltip>
        </template>

        <template #org="{ row }">
          <el-tooltip placement="top">
            <template #content>
              <div class="text-xs">{{ row.org }}</div>
              <div v-if="row.org_cn" class="text-xs mt-1">{{ row.org_cn }}</div>
            </template>
            <span>{{ row.org }}</span>
          </el-tooltip>
        </template>

        <template #network="{ row }">
          <div class="flex gap-1 justify-center">
            <el-tag v-if="row.is_hosting" size="small" type="warning">机房</el-tag>
            <el-tag v-else-if="row.is_mobile" size="small" type="success">移动</el-tag>
            <el-tag v-else size="small">宽带</el-tag>
            <el-tag v-if="row.is_proxy" size="small" type="danger">代理</el-tag>
          </div>
        </template>

        <template #operation="{ row }">
          <el-popconfirm
            title="确认删除这条记录？"
            @confirm="handleDelete(row)"
          >
            <template #reference>
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </pure-table>
    </el-card>
  </div>
</template>

<style scoped>
.ip-cell {
  display: inline-block;
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.asn-cell {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
</style>
