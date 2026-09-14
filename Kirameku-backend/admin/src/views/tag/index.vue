<script setup lang="ts">
import { ref, onMounted } from "vue";
import { message } from "@/utils/message";
import { getTags, createTag, updateTag, deleteTag } from "@/api/tag";
import type { TagItem } from "@/api/tag";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({ name: "TagIndex" });

const loading = ref(false);
const dataList = ref<TagItem[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref("新增标签");
const formRef = ref();
const form = ref({ id: 0, name: "", slug: "" });

const rules = {
  name: [{ required: true, message: "请输入标签名称", trigger: "blur" }],
  slug: [{ required: true, message: "请输入 URL 别名", trigger: "blur" }]
};

const columns: TableColumnList = [
  { label: "ID", prop: "id", width: 70 },
  { label: "标签名称", prop: "name", minWidth: 200 },
  { label: "URL 别名", prop: "slug", minWidth: 200 },
  { label: "文章数", prop: "post_count", width: 100 },
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
    dataList.value = await getTags();
  } finally {
    loading.value = false;
  }
}

function openDialog(title: string, row?: TagItem) {
  dialogTitle.value = title;
  if (row) {
    form.value = { id: row.id, name: row.name, slug: row.slug };
  } else {
    form.value = { id: 0, name: "", slug: "" };
  }
  dialogVisible.value = true;
}

function autoSlug() {
  form.value.slug = form.value.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]/g, "");
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  try {
    if (form.value.id) {
      await updateTag(form.value.id, {
        name: form.value.name,
        slug: form.value.slug
      });
      message("标签更新成功", { type: "success" });
    } else {
      await createTag({ name: form.value.name, slug: form.value.slug });
      message("标签创建成功", { type: "success" });
    }
    dialogVisible.value = false;
    onSearch();
  } catch (e: any) {
    message(e?.message ?? "操作失败", { type: "error" });
  }
}

async function handleDelete(row: TagItem) {
  try {
    await deleteTag(row.id);
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
          <span class="font-medium">标签管理</span>
          <el-button
            type="primary"
            :icon="useRenderIcon('ri:add-circle-line')"
            @click="openDialog('新增标签')"
          >
            新增标签
          </el-button>
        </div>
      </template>

      <pure-table
        :data="dataList"
        :columns="columns"
        :loading="loading"
        align-whole="center"
        row-key="id"
        table-layout="auto"
      >
        <template #operation="{ row }">
          <el-button
            link
            type="primary"
            :icon="useRenderIcon('ri:edit-line')"
            @click="openDialog('修改标签', row)"
          >
            修改
          </el-button>
          <el-popconfirm
            :title="`确认删除标签「${row.name}」？`"
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

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="450px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="90px"
      >
        <el-form-item label="标签名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入标签名称"
            @blur="autoSlug"
          />
        </el-form-item>
        <el-form-item label="URL 别名" prop="slug">
          <el-input v-model="form.slug" placeholder="如: vue, python" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
