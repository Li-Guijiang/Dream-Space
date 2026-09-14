<script setup lang="ts">
import { ref, onMounted } from "vue";
import { message } from "@/utils/message";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "@/api/category";
import type { CategoryItem } from "@/api/category";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({ name: "CategoryIndex" });

const loading = ref(false);
const dataList = ref<CategoryItem[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref("新增分类");
const formRef = ref();
const form = ref({
  id: 0,
  name: "",
  slug: "",
  description: "",
  sort: 0
});

const rules = {
  name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
  slug: [{ required: true, message: "请输入 URL 别名", trigger: "blur" }]
};

const columns: TableColumnList = [
  { label: "ID", prop: "id", width: 70 },
  { label: "分类名称", prop: "name", minWidth: 150 },
  { label: "URL 别名", prop: "slug", minWidth: 150 },
  { label: "描述", prop: "description", minWidth: 200 },
  { label: "排序", prop: "sort", width: 80 },
  { label: "文章数", prop: "post_count", width: 80 },
  {
    label: "创建时间",
    prop: "created_at",
    minWidth: 170,
    formatter: ({ created_at }) => created_at?.replace("T", " ").slice(0, 19) ?? ""
  },
  {
    label: "修改时间",
    prop: "updated_at",
    minWidth: 170,
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
    dataList.value = await getCategories();
  } finally {
    loading.value = false;
  }
}

function openDialog(title: string, row?: CategoryItem) {
  dialogTitle.value = title;
  if (row) {
    form.value = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description || "",
      sort: row.sort ?? 0
    };
  } else {
    form.value = { id: 0, name: "", slug: "", description: "", sort: 0 };
  }
  dialogVisible.value = true;
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  try {
    if (form.value.id) {
      await updateCategory(form.value.id, {
        name: form.value.name,
        slug: form.value.slug,
        description: form.value.description,
        sort: form.value.sort
      });
      message("分类更新成功", { type: "success" });
    } else {
      await createCategory({
        name: form.value.name,
        slug: form.value.slug,
        description: form.value.description,
        sort: form.value.sort
      });
      message("分类创建成功", { type: "success" });
    }
    dialogVisible.value = false;
    onSearch();
  } catch (e: any) {
    message(e?.message ?? "操作失败", { type: "error" });
  }
}

async function handleDelete(row: CategoryItem) {
  try {
    await deleteCategory(row.id);
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
          <span class="font-medium">分类管理</span>
          <el-button
            type="primary"
            :icon="useRenderIcon('ri:add-circle-line')"
            @click="openDialog('新增分类')"
          >
            新增分类
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
            @click="openDialog('修改分类', row)"
          >
            修改
          </el-button>
          <el-popconfirm
            :title="`确认删除分类「${row.name}」？`"
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
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="90px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="URL 别名" prop="slug">
          <el-input v-model="form.slug" placeholder="如: tech, life" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="分类描述（可选）"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
