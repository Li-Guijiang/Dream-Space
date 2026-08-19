<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { message as msg } from "@/utils/message";
import {
  getAdminMessages,
  getAdminMessageCount,
  updateMessageStatus,
  deleteMessage
} from "@/api/message";
import type { MessageItem } from "@/api/message";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import type { PaginationProps } from "@pureadmin/table";

defineOptions({ name: "MessageIndex" });

const loading = ref(false);
const dataList = ref<MessageItem[]>([]);
const statusFilter = ref("");
const expandedRows = ref<number[]>([]);

const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 20,
  currentPage: 1,
  background: true
});

const columns: TableColumnList = [
  { label: "ID", prop: "id", width: 60 },
  {
    label: "用户",
    prop: "github_user",
    width: 160,
    slot: "user"
  },
  { label: "内容", prop: "content", minWidth: 300 },
  { label: "IP", prop: "ip", width: 130 },
  { label: "点赞", prop: "likes", width: 60 },
  {
    label: "回复",
    prop: "replies",
    width: 70,
    slot: "replies"
  },
  {
    label: "状态",
    prop: "status",
    width: 90,
    slot: "status"
  },
  {
    label: "时间",
    prop: "created_at",
    minWidth: 160,
    formatter: ({ created_at }) =>
      created_at ? created_at.replace("T", " ").slice(0, 19) : ""
  },
  {
    label: "操作",
    fixed: "right",
    width: 200,
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
      getAdminMessages(params),
      getAdminMessageCount({ status: statusFilter.value || undefined })
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

async function handleStatus(row: MessageItem, status: string) {
  try {
    await updateMessageStatus(row.id, status);
    msg("操作成功", { type: "success" });
    onSearch();
  } catch (e: any) {
    msg(e?.message ?? "操作失败", { type: "error" });
  }
}

async function handleDelete(row: MessageItem) {
  try {
    await deleteMessage(row.id);
    msg("删除成功", { type: "success" });
    onSearch();
  } catch (e: any) {
    msg(e?.message ?? "删除失败", { type: "error" });
  }
}

function toggleExpand(row: MessageItem) {
  const idx = expandedRows.value.indexOf(row.id);
  if (idx >= 0) {
    expandedRows.value.splice(idx, 1);
  } else {
    expandedRows.value.push(row.id);
  }
}

/** 递归统计所有嵌套回复数 */
function countAllReplies(msg: MessageItem): number {
  if (!msg.replies || msg.replies.length === 0) return 0;
  return msg.replies.reduce((sum, r) => sum + 1 + countAllReplies(r), 0);
}

/** 递归展开所有嵌套回复为扁平列表 */
function flattenReplies(replies: MessageItem[], depth = 0): Array<MessageItem & { _depth: number }> {
  const result: Array<MessageItem & { _depth: number }> = [];
  for (const r of replies) {
    result.push({ ...r, _depth: depth });
    if (r.replies && r.replies.length > 0) {
      result.push(...flattenReplies(r.replies, depth + 1));
    }
  }
  return result;
}

onMounted(() => onSearch());
</script>

<template>
  <div class="p-4">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <span class="font-medium">留言管理</span>
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
              <el-option label="待审核" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
          </div>
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
        <template #user="{ row }">
          <div class="flex items-center gap-2">
            <el-avatar
              v-if="row.github_user"
              :src="row.github_user.avatar"
              :size="28"
            />
            <span v-if="row.github_user" class="text-sm">{{
              row.github_user.login
            }}</span>
            <span v-else class="text-gray-400 text-sm">已注销</span>
          </div>
        </template>

        <template #replies="{ row }">
          <el-button
            v-if="row.replies && row.replies.length > 0"
            link
            type="primary"
            size="small"
            @click="toggleExpand(row)"
          >
            {{ expandedRows.includes(row.id) ? "收起" : row.replies.length }}
          </el-button>
          <span v-else class="text-gray-400">-</span>
        </template>

        <template #status="{ row }">
          <el-tag
            :type="
              row.status === 'approved'
                ? 'success'
                : row.status === 'pending'
                  ? 'warning'
                  : 'danger'
            "
            size="small"
          >
            {{
              row.status === "approved"
                ? "已通过"
                : row.status === "pending"
                  ? "待审核"
                  : "已拒绝"
            }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button
            v-if="row.status !== 'approved'"
            link
            type="success"
            size="small"
            @click="handleStatus(row, 'approved')"
          >
            通过
          </el-button>
          <el-button
            v-if="row.status !== 'rejected'"
            link
            type="warning"
            size="small"
            @click="handleStatus(row, 'rejected')"
          >
            拒绝
          </el-button>
          <el-popconfirm
            title="确认删除这条留言？子回复将一并删除。"
            @confirm="handleDelete(row)"
          >
            <template #reference>
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </pure-table>

      <!-- 展开的回复列表（递归显示嵌套回复） -->
      <template v-for="row in dataList" :key="'expand-' + row.id">
        <div
          v-if="
            expandedRows.includes(row.id) &&
            row.replies &&
            row.replies.length > 0
          "
          class="mt-2 mb-4 ml-10 border-l-2 border-gray-200 dark:border-gray-700 pl-4"
        >
          <div class="text-sm text-gray-500 mb-2">
            回复（{{ countAllReplies(row) }}）
          </div>
          <div
            v-for="reply in flattenReplies(row.replies)"
            :key="reply.id"
            class="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
            :style="{ marginLeft: reply._depth * 32 + 'px' }"
          >
            <el-avatar
              v-if="reply.github_user"
              :src="reply.github_user.avatar"
              :size="24"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-medium">
                  {{ reply.github_user?.login ?? "已注销" }}
                </span>
                <el-tag
                  :type="
                    reply.status === 'approved'
                      ? 'success'
                      : reply.status === 'pending'
                        ? 'warning'
                        : 'danger'
                  "
                  size="small"
                >
                  {{
                    reply.status === "approved"
                      ? "已通过"
                      : reply.status === "pending"
                        ? "待审核"
                        : "已拒绝"
                  }}
                </el-tag>
                <span class="text-xs text-gray-400">
                  {{
                    reply.created_at
                      ? reply.created_at.replace("T", " ").slice(0, 19)
                      : ""
                  }}
                </span>
              </div>
              <div class="text-sm">{{ reply.content }}</div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <el-button
                v-if="reply.status !== 'approved'"
                link
                type="success"
                size="small"
                @click="handleStatus(reply, 'approved')"
              >
                通过
              </el-button>
              <el-button
                v-if="reply.status !== 'rejected'"
                link
                type="warning"
                size="small"
                @click="handleStatus(reply, 'rejected')"
              >
                拒绝
              </el-button>
              <el-popconfirm
                title="确认删除这条回复？"
                @confirm="handleDelete(reply)"
              >
                <template #reference>
                  <el-button link type="danger" size="small">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </div>
      </template>
    </el-card>
  </div>
</template>
