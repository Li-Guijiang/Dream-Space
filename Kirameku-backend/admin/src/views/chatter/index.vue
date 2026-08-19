<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { message } from "@/utils/message";
import {
  getAdminChatters,
  getChatterCount,
  createChatter,
  updateChatter,
  deleteChatter,
  uploadImage,
  getAdminChatterComments,
  updateChatterCommentStatus,
  deleteChatterComment
} from "@/api/chatter";
import type { ChatterItem, ChatterCommentItem } from "@/api/chatter";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import type { PaginationProps } from "@pureadmin/table";

defineOptions({ name: "ChatterIndex" });

const activeTab = ref("chatter");

// ========== 说说列表 ==========
const loading = ref(false);
const dataList = ref<ChatterItem[]>([]);
const statusFilter = ref("");

const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 20,
  currentPage: 1,
  background: true
});

const columns: TableColumnList = [
  { label: "ID", prop: "id", width: 70 },
  {
    label: "内容",
    prop: "content",
    minWidth: 200,
    showOverflowTooltip: true,
    formatter: ({ content }) =>
      content.length > 30 ? content.slice(0, 30) + "..." : content
  },
  {
    label: "心情",
    prop: "mood",
    width: 80,
    formatter: ({ mood }) => mood || "-"
  },
  {
    label: "图片",
    prop: "images",
    width: 80,
    slot: "images"
  },
  { label: "点赞", prop: "likes", width: 70 },
  { label: "评论", prop: "comments_count", width: 70 },
  {
    label: "状态",
    prop: "status",
    width: 90,
    slot: "status"
  },
  {
    label: "创建时间",
    prop: "created_at",
    minWidth: 170,
    formatter: ({ created_at }) =>
      created_at?.replace("T", " ").slice(0, 19) ?? ""
  },
  {
    label: "修改时间",
    prop: "updated_at",
    minWidth: 170,
    formatter: ({ updated_at }) =>
      updated_at?.replace("T", " ").slice(0, 19) ?? ""
  },
  { label: "操作", fixed: "right", width: 200, slot: "operation" }
];

async function onSearch() {
  loading.value = true;
  try {
    const [list, countRes] = await Promise.all([
      getAdminChatters({
        status: statusFilter.value || undefined,
        page: pagination.currentPage,
        size: pagination.pageSize
      }),
      getChatterCount(statusFilter.value || undefined)
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

// ========== 说说新增/编辑 ==========
const dialogVisible = ref(false);
const dialogTitle = ref("新增说说");
const formRef = ref();
const form = ref({
  id: 0,
  content: "",
  images: [] as string[],
  mood: "",
  status: "draft"
});

const rules = {
  content: [{ required: true, message: "请输入说说内容", trigger: "blur" }]
};

function openDialog(title: string, row?: ChatterItem) {
  dialogTitle.value = title;
  if (row) {
    form.value = {
      id: row.id,
      content: row.content,
      images: [...row.images],
      mood: row.mood || "",
      status: row.status
    };
  } else {
    form.value = { id: 0, content: "", images: [], mood: "", status: "draft" };
  }
  dialogVisible.value = true;
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  try {
    const payload = {
      content: form.value.content,
      images: form.value.images,
      mood: form.value.mood,
      status: form.value.status
    };
    if (form.value.id) {
      await updateChatter(form.value.id, payload);
      message("说说更新成功", { type: "success" });
    } else {
      await createChatter(payload);
      message("说说创建成功", { type: "success" });
    }
    dialogVisible.value = false;
    onSearch();
  } catch (e: any) {
    message(e?.message ?? "操作失败", { type: "error" });
  }
}

async function handleDelete(row: ChatterItem) {
  try {
    await deleteChatter(row.id);
    message("删除成功", { type: "success" });
    onSearch();
  } catch (e: any) {
    message(e?.message ?? "删除失败", { type: "error" });
  }
}

// ========== 图片上传 ==========
const uploading = ref(false);

function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 2000;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          const ratio = Math.min(MAX / width, MAX / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          blob => {
            if (!blob) return resolve(file);
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.8
        );
      };
      img.onerror = () => resolve(file);
      img.src = reader.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

async function handleUpload(uploadFile: any) {
  const file = uploadFile.raw || uploadFile.file || uploadFile;
  if (!file) return;
  uploading.value = true;
  try {
    const compressed = await compressImage(file);
    const res = await uploadImage(compressed);
    form.value.images.push(res.url);
    message("上传成功", { type: "success" });
  } catch (e: any) {
    message(e?.message ?? "上传失败", { type: "error" });
  } finally {
    uploading.value = false;
  }
}

function removeImage(index: number) {
  form.value.images.splice(index, 1);
}

function dummyRequest() {
  return undefined as any;
}

// ========== 评论管理 ==========
const commentLoading = ref(false);
const commentList = ref<ChatterCommentItem[]>([]);
const commentStatusFilter = ref("");
const expandedRows = ref<number[]>([]);

const commentColumns: TableColumnList = [
  { label: "ID", prop: "id", width: 60 },
  { label: "用户", prop: "github_user", width: 140, slot: "user" },
  { label: "内容", prop: "content", minWidth: 250 },
  { label: "说说ID", prop: "chatter_id", width: 80 },
  { label: "IP", prop: "ip", width: 130 },
  { label: "回复", prop: "replies", width: 70, slot: "replies" },
  { label: "状态", prop: "status", width: 90, slot: "status" },
  {
    label: "时间",
    prop: "created_at",
    minWidth: 160,
    formatter: ({ created_at }) =>
      created_at ? created_at.replace("T", " ").slice(0, 19) : ""
  },
  { label: "操作", fixed: "right", width: 200, slot: "operation" }
];

function flattenReplies(replies: ChatterCommentItem[], depth = 0): (ChatterCommentItem & { _depth: number })[] {
  const result: (ChatterCommentItem & { _depth: number })[] = [];
  for (const r of replies) {
    result.push({ ...r, _depth: depth });
    if (r.replies?.length) {
      result.push(...flattenReplies(r.replies, depth + 1));
    }
  }
  return result;
}

async function loadComments() {
  commentLoading.value = true;
  try {
    const params: any = { size: 100 };
    if (commentStatusFilter.value) params.status = commentStatusFilter.value;
    commentList.value = await getAdminChatterComments(params);
  } finally {
    commentLoading.value = false;
  }
}

function toggleExpand(row: ChatterCommentItem) {
  const idx = expandedRows.value.indexOf(row.id);
  if (idx >= 0) {
    expandedRows.value.splice(idx, 1);
  } else {
    expandedRows.value.push(row.id);
  }
}

function countAllReplies(c: ChatterCommentItem): number {
  if (!c.replies || c.replies.length === 0) return 0;
  return c.replies.reduce((sum, r) => sum + 1 + countAllReplies(r), 0);
}

async function handleApproveComment(row: ChatterCommentItem) {
  try {
    await updateChatterCommentStatus(row.id, "approved");
    message("审核通过", { type: "success" });
    loadComments();
  } catch (e: any) {
    message(e?.message ?? "操作失败", { type: "error" });
  }
}

async function handleRejectComment(row: ChatterCommentItem) {
  try {
    await updateChatterCommentStatus(row.id, "rejected");
    message("已驳回", { type: "success" });
    loadComments();
  } catch (e: any) {
    message(e?.message ?? "操作失败", { type: "error" });
  }
}

async function handleDeleteComment(row: ChatterCommentItem) {
  try {
    await deleteChatterComment(row.id);
    message("删除成功", { type: "success" });
    loadComments();
  } catch (e: any) {
    message(e?.message ?? "删除失败", { type: "error" });
  }
}

// 切换 Tab 时加载数据
watch(activeTab, (tab) => {
  if (tab === "comment") loadComments();
});

onMounted(() => onSearch());
</script>

<template>
  <div class="p-4">
    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="说说管理" name="chatter">
          <template #label>
            <div class="flex items-center gap-1">
              <span>说说管理</span>
            </div>
          </template>

          <div class="flex justify-between items-center mb-4">
            <el-select
              v-model="statusFilter"
              placeholder="全部状态"
              clearable
              style="width: 120px"
              @change="
                pagination.currentPage = 1;
                onSearch();
              "
            >
              <el-option label="已发布" value="published" />
              <el-option label="草稿" value="draft" />
            </el-select>
            <el-button
              type="primary"
              :icon="useRenderIcon('ri:add-circle-line')"
              @click="openDialog('新增说说')"
            >
              新增说说
            </el-button>
          </div>

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
            <template #images="{ row }">
              <span v-if="!row.images?.length" class="text-gray-400 text-xs"
                >无</span
              >
              <el-image
                v-else
                :src="row.images[0]"
                :preview-src-list="row.images"
                preview-teleported
                fit="cover"
                class="w-10 h-10 rounded"
              />
            </template>

            <template #status="{ row }">
              <el-tag
                :type="row.status === 'published' ? 'success' : 'info'"
                size="small"
              >
                {{ row.status === "published" ? "已发布" : "草稿" }}
              </el-tag>
            </template>

            <template #operation="{ row }">
              <el-button
                link
                type="primary"
                :icon="useRenderIcon('ri:edit-line')"
                @click="openDialog('修改说说', row)"
              >
                修改
              </el-button>
              <el-popconfirm
                :title="`确认删除此说说？`"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button
                    link
                    type="danger"
                    :icon="useRenderIcon('ri:delete-bin-line')"
                  >
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </pure-table>
        </el-tab-pane>

        <el-tab-pane label="评论管理" name="comment">
          <template #label>
            <div class="flex items-center gap-1">
              <span>评论管理</span>
            </div>
          </template>

          <div class="mb-4">
            <el-select
              v-model="commentStatusFilter"
              placeholder="全部状态"
              clearable
              style="width: 120px"
              @change="
                expandedRows = [];
                loadComments();
              "
            >
              <el-option label="已通过" value="approved" />
              <el-option label="待审核" value="pending" />
              <el-option label="已驳回" value="rejected" />
            </el-select>
          </div>

          <pure-table
            :data="commentList"
            :columns="commentColumns"
            :loading="commentLoading"
            align-whole="center"
            row-key="id"
            table-layout="auto"
          >
            <template #user="{ row }">
              <div class="flex items-center gap-2">
                <el-avatar
                  v-if="row.github_user"
                  :src="row.github_user.avatar"
                  :size="24"
                />
                <el-avatar v-else :size="24" class="bg-slate-300">?</el-avatar>
                <span>{{ row.github_user?.login ?? "匿名" }}</span>
              </div>
            </template>

            <template #replies="{ row }">
              <el-button
                v-if="row.replies?.length"
                link
                type="primary"
                size="small"
                @click="toggleExpand(row)"
              >
                {{
                  expandedRows.includes(row.id)
                    ? "收起"
                    : countAllReplies(row) + "条"
                }}
              </el-button>
              <span v-else class="text-gray-400">-</span>
            </template>

            <template #status="{ row }">
              <el-tag
                :type="
                  row.status === 'approved'
                    ? 'success'
                    : row.status === 'rejected'
                      ? 'danger'
                      : 'warning'
                "
                size="small"
              >
                {{
                  row.status === "approved"
                    ? "已通过"
                    : row.status === "rejected"
                      ? "已驳回"
                      : "待审核"
                }}
              </el-tag>
            </template>

            <template #operation="{ row }">
              <el-button
                v-if="row.status !== 'approved'"
                link
                type="success"
                size="small"
                @click="handleApproveComment(row)"
              >
                通过
              </el-button>
              <el-button
                v-if="row.status !== 'rejected'"
                link
                type="warning"
                size="small"
                @click="handleRejectComment(row)"
              >
                驳回
              </el-button>
              <el-popconfirm
                title="确认删除此评论？"
                @confirm="handleDeleteComment(row)"
              >
                <template #reference>
                  <el-button link type="danger" size="small">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </pure-table>

          <!-- 展开的回复列表 -->
          <template v-for="row in commentList" :key="'expand-' + row.id">
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
                <el-avatar v-else :size="24" class="bg-slate-300">?</el-avatar>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-medium">
                      {{ reply.github_user?.login ?? "匿名" }}
                    </span>
                    <el-tag
                      :type="
                        reply.status === 'approved'
                          ? 'success'
                          : reply.status === 'rejected'
                            ? 'danger'
                            : 'warning'
                      "
                      size="small"
                    >
                      {{
                        reply.status === "approved"
                          ? "已通过"
                          : reply.status === "rejected"
                            ? "已驳回"
                            : "待审核"
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
                    @click="handleApproveComment(reply)"
                  >
                    通过
                  </el-button>
                  <el-button
                    v-if="reply.status !== 'rejected'"
                    link
                    type="warning"
                    size="small"
                    @click="handleRejectComment(reply)"
                  >
                    驳回
                  </el-button>
                  <el-popconfirm
                    title="确认删除此回复？"
                    @confirm="handleDeleteComment(reply)"
                  >
                    <template #reference>
                      <el-button link type="danger" size="small">
                        删除
                      </el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </div>
            </div>
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="5"
            placeholder="说点什么..."
          />
        </el-form-item>
        <el-form-item label="心情">
          <el-input
            v-model="form.mood"
            placeholder="如：开心、难过、无聊..."
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="图片">
          <div class="flex flex-wrap gap-2">
            <div
              v-for="(img, index) in form.images"
              :key="index"
              class="relative w-20 h-20 rounded overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <el-image :src="img" fit="cover" class="w-full h-full" />
              <el-icon
                class="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full cursor-pointer text-xs p-0.5"
                @click="removeImage(index)"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                  />
                </svg>
              </el-icon>
            </div>
            <el-upload
              :show-file-list="false"
              :http-request="dummyRequest"
              :before-upload="() => false"
              :on-change="handleUpload"
              accept="image/*"
            >
              <div
                class="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                <el-icon v-if="!uploading" class="text-xl text-gray-400">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </el-icon>
                <el-icon v-else class="text-xl text-blue-500 is-loading">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z" />
                  </svg>
                </el-icon>
              </div>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="published">发布</el-radio>
            <el-radio value="draft">草稿</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
