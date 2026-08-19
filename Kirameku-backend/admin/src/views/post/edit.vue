<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { message } from "@/utils/message";
import {
  getPostById,
  createPost,
  updatePost
} from "@/api/post";
import { uploadImage } from "@/api/album";
import { getCategories } from "@/api/category";
import { getTags } from "@/api/tag";
import type { CategoryItem } from "@/api/category";
import type { TagItem } from "@/api/tag";
import Vditor from "@/views/markdown/components/Vditor.vue";

defineOptions({ name: "PostEdit" });

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const saving = ref(false);

const postId = computed(() => {
  const id = route.params.id;
  return id ? Number(id) : 0;
});

const form = ref({
  title: "",
  slug: "",
  description: "",
  content: "",
  cover: "",
  category_id: null as number | null,
  tags: [] as string[],
  status: "draft",
  is_pinned: false,
  reading_time: 0,
  word_count: 0
});

const categoryList = ref<CategoryItem[]>([]);
const tagList = ref<TagItem[]>([]);
const tagInputVisible = ref(false);
const tagInputValue = ref("");
const coverUploading = ref(false);
const coverInputRef = ref<HTMLInputElement>();

const rules = {
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  slug: [{ required: true, message: "请输入 URL 别名", trigger: "blur" }]
};

function autoSlug() {
  if (!form.value.slug && form.value.title) {
    form.value.slug = form.value.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]/g, "");
  }
}

function handleTagClose(tag: string) {
  form.value.tags = form.value.tags.filter(t => t !== tag);
}

function handleTagConfirm() {
  if (tagInputValue.value && !form.value.tags.includes(tagInputValue.value)) {
    form.value.tags.push(tagInputValue.value);
  }
  tagInputVisible.value = false;
  tagInputValue.value = "";
}

function addExistingTag(name: string) {
  if (!form.value.tags.includes(name)) {
    form.value.tags.push(name);
  }
}

async function handleCoverUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  coverUploading.value = true;
  try {
    const res = await uploadImage(file);
    form.value.cover = res.url;
    message("封面上传成功", { type: "success" });
  } catch (e: any) {
    message(e?.message ?? "上传失败", { type: "error" });
  } finally {
    coverUploading.value = false;
    input.value = "";
  }
}

async function handleSave() {
  if (!form.value.title || !form.value.slug) {
    message("标题和 URL 别名必填", { type: "warning" });
    return;
  }
  saving.value = true;
  try {
    if (postId.value) {
      await updatePost(postId.value, form.value);
      message("更新成功", { type: "success" });
    } else {
      await createPost(form.value);
      message("创建成功", { type: "success" });
    }
    router.push("/post/index");
  } catch (e: any) {
    message(e?.message ?? "保存失败", { type: "error" });
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  const [cats, tags] = await Promise.all([
    getCategories().catch(() => []),
    getTags().catch(() => [])
  ]);
  categoryList.value = cats;
  tagList.value = tags;

  if (postId.value) {
    loading.value = true;
    try {
      const detail = await getPostById(postId.value);
      form.value = {
        title: detail.title,
        slug: detail.slug,
        description: detail.description,
        content: detail.content,
        cover: detail.cover,
        category_id: null,
        tags: detail.tags || [],
        status: detail.status,
        is_pinned: detail.is_pinned,
        reading_time: detail.reading_time ?? 0,
        word_count: detail.word_count ?? 0
      };
      const cat = categoryList.value.find(c => c.name === detail.category);
      if (cat) form.value.category_id = cat.id;
    } finally {
      loading.value = false;
    }
  }
});
</script>

<template>
  <div v-loading="loading" class="p-4">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-medium">
            {{ postId ? "编辑文章" : "写文章" }}
          </span>
          <div class="flex gap-2">
            <el-button @click="router.push('/post/index')">返回</el-button>
            <el-button type="primary" :loading="saving" @click="handleSave">
              保存
            </el-button>
          </div>
        </div>
      </template>

      <el-form
        :model="form"
        :rules="rules"
        label-width="100px"
        class="max-w-5xl"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="文章标题"
            @blur="autoSlug"
          />
        </el-form-item>

        <el-form-item label="URL 别名" prop="slug">
          <el-input v-model="form.slug" placeholder="url-slug" />
        </el-form-item>

        <el-form-item label="摘要">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            placeholder="文章摘要（可选）"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="分类">
              <el-select
                v-model="form.category_id"
                placeholder="选择分类"
                clearable
                class="w-full"
              >
                <el-option
                  v-for="cat in categoryList"
                  :key="cat.id"
                  :label="cat.name"
                  :value="cat.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态">
              <el-select v-model="form.status" class="w-full">
                <el-option label="草稿" value="draft" />
                <el-option label="已发布" value="published" />
                <el-option label="已归档" value="archived" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="置顶">
              <el-switch v-model="form.is_pinned" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="阅读时长(分钟)">
              <el-input-number v-model="form.reading_time" :min="0" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="字数">
              <el-input-number v-model="form.word_count" :min="0" class="w-full" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="封面图">
          <div class="flex gap-2 w-full">
            <el-input v-model="form.cover" placeholder="封面图 URL" />
            <input
              ref="coverInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleCoverUpload"
            />
            <el-button
              :loading="coverUploading"
              @click="coverInputRef?.click()"
            >
              上传图片
            </el-button>
          </div>
          <el-image
            v-if="form.cover"
            :src="form.cover"
            class="mt-2 rounded"
            fit="cover"
            style="max-width: 200px; max-height: 120px"
          />
        </el-form-item>

        <el-form-item label="标签">
          <div class="flex flex-wrap gap-2 items-center">
            <el-tag
              v-for="tag in form.tags"
              :key="tag"
              closable
              @close="handleTagClose(tag)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="tagInputVisible"
              v-model="tagInputValue"
              size="small"
              class="w-24"
              @keyup.enter="handleTagConfirm"
              @blur="handleTagConfirm"
            />
            <el-button
              v-else
              size="small"
              @click="tagInputVisible = true"
            >
              + 添加
            </el-button>
          </div>
          <div
            v-if="tagList.length > 0"
            class="mt-2 text-sm text-gray-400"
          >
            快速添加：
            <el-button
              v-for="t in tagList.filter(t => !form.tags.includes(t.name))"
              :key="t.id"
              link
              type="primary"
              size="small"
              @click="addExistingTag(t.name)"
            >
              {{ t.name }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="正文">
          <div class="w-full">
            <Vditor
              v-model="form.content"
              :options="{ height: 500 }"
            />
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
