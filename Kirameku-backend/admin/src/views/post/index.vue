<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { getPosts, deletePost, getPostCount } from "@/api/post";
import type { PostItem } from "@/api/post";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import type { PaginationProps } from "@pureadmin/table";

defineOptions({ name: "PostIndex" });

const router = useRouter();
const loading = ref(false);
const dataList = ref<PostItem[]>([]);
const statusFilter = ref("");

const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 20,
  currentPage: 1,
  background: true
});

const columns: TableColumnList = [
  { label: "ID", prop: "id", width: 60 },
  { label: "标题", prop: "title", minWidth: 200 },
  { label: "分类", prop: "category", width: 100 },
  {
    label: "标签",
    prop: "tags",
    minWidth: 150,
    slot: "tags"
  },
  {
    label: "状态",
    prop: "status",
    width: 80,
    slot: "status"
  },
  { label: "浏览", prop: "views", width: 70 },
  { label: "点赞", prop: "likes", width: 70 },
  { label: "字数", prop: "word_count", width: 70 },
  { label: "时长", prop: "reading_time", width: 70 },
  {
    label: "发布时间",
    prop: "published_at",
    minWidth: 160,
    formatter: ({ published_at }) =>
      published_at ? published_at.replace("T", " ").slice(0, 19) : "-"
  },
  {
    label: "修改时间",
    prop: "updated_at",
    minWidth: 160,
    formatter: ({ updated_at }) => updated_at?.replace("T", " ").slice(0, 19) ?? ""
  },
  {
    label: "操作",
    fixed: "right",
    width: 160,
    slot: "operation"
  }
];

async function onSearch() {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.currentPage,
      size: pagination.pageSize
    };
    if (statusFilter.value) params.status = statusFilter.value;
    const [list, countRes] = await Promise.all([
      getPosts(params),
      getPostCount({ status: statusFilter.value || undefined })
    ]);
    dataList.value = list;
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

function handleEdit(row: PostItem) {
  router.push(`/post/edit/${row.id}`);
}

function handleCreate() {
  router.push("/post/edit");
}

async function handleDelete(row: PostItem) {
  try {
    await deletePost(row.id);
    message("删除成功", { type: "success" });
    onSearch();
  } catch (e: any) {
    message(e?.message ?? "删除失败", { type: "error" });
  }
}

onMounted(() => onSearch());
</script>

<template>
  <div class="p-4">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <span class="font-medium">文章管理</span>
            <el-select
              v-model="statusFilter"
              placeholder="全部状态"
              clearable
              class="w-28"
              @change="
                pagination.currentPage = 1;
                onSearch();
              "
            >
              <el-option label="已发布" value="published" />
              <el-option label="草稿" value="draft" />
              <el-option label="已归档" value="archived" />
            </el-select>
          </div>
          <el-button
            type="primary"
            :icon="useRenderIcon('ri:add-circle-line')"
            @click="handleCreate"
          >
            写文章
          </el-button>
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
        <template #tags="{ row }">
          <el-tag
            v-for="tag in row.tags"
            :key="tag"
            size="small"
            class="mr-1"
          >
            {{ tag }}
          </el-tag>
        </template>

        <template #status="{ row }">
          <el-tag
            :type="
              row.status === 'published'
                ? 'success'
                : row.status === 'draft'
                  ? 'info'
                  : 'warning'
            "
            size="small"
          >
            {{
              row.status === "published"
                ? "已发布"
                : row.status === "draft"
                  ? "草稿"
                  : "已归档"
            }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button
            link
            type="primary"
            :icon="useRenderIcon('ri:edit-line')"
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-popconfirm
            :title="`确认删除「${row.title}」？`"
            @confirm="handleDelete(row)"
          >
            <template #reference>
              <el-button link type="danger" :icon="useRenderIcon('ri:delete-bin-line')">
                删除
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </pure-table>
    </el-card>
  </div>
</template>
