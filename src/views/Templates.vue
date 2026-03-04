<template>
  <div class="templates">
    <el-card shadow="never" class="apple-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">对账结果模板</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增模板
            </el-button>
            <el-button @click="loadTemplates">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table v-loading="loading" :data="templateList" stripe :header-cell-style="{ background: '#F2F2F7', fontWeight: 600 }">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="模板名称" />
        <el-table-column prop="template_type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag size="small" round>{{ getTypeName(row.template_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_default" label="默认" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.is_default" size="small" type="success">默认</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容预览">
          <template #default="{ row }">
            <el-tooltip :content="row.content" placement="top" :show-after="500">
              <span class="content-preview">{{ row.content.substring(0, 80) }}...</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleSetDefault(row)">设为默认</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Template Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" :close-on-click-modal="false">
      <el-form :model="formData" label-width="100px" class="apple-form" :rules="rules" ref="formRef">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板类型" prop="template_type">
          <el-select v-model="formData.template_type" placeholder="请选择类型" style="width: 100%">
            <el-option label="Excel" value="excel" />
            <el-option label="CSV" value="csv" />
            <el-option label="PDF" value="pdf" />
            <el-option label="HTML" value="html" />
            <el-option label="JSON" value="json" />
          </el-select>
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="formData.is_default" />
        </el-form-item>
        <el-form-item label="模板内容" prop="content">
          <el-input 
            v-model="formData.content" 
            type="textarea" 
            :rows="12" 
            placeholder="模板内容，支持变量替换&#10;可用变量: {channel_name}, {reconcile_date}, {total_amount}, {matched_amount}, {diff_amount}, {tx_count}"
          />
          <div class="form-tip">
            可用变量: {channel_name}, {reconcile_date}, {total_amount}, {matched_amount}, {diff_amount}, {tx_count}, {fee_amount}, {net_amount}
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { templateApi } from '../api'

interface Template {
  id: number
  name: string
  template_type: string
  content: string
  is_default: boolean
  updated_at: string
}

const templateList = ref<Template[]>([])
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增模板')
const editingId = ref(0)
const formRef = ref()

const formData = reactive({
  name: '',
  template_type: 'excel',
  is_default: false,
  content: ''
})

const rules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  template_type: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入模板内容', trigger: 'blur' }]
}

const getTypeName = (type: string) => {
  const names: Record<string, string> = {
    excel: 'Excel',
    csv: 'CSV',
    pdf: 'PDF',
    html: 'HTML',
    json: 'JSON'
  }
  return names[type] || type
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const defaultContent = `通道名称: {channel_name}
对账日期: {reconcile_date}
交易笔数: {tx_count}
交易总额: {total_amount}
匹配金额: {matched_amount}
差异金额: {diff_amount}
手续费: {fee_amount}
净金额: {net_amount}`

const loadTemplates = async () => {
  loading.value = true
  try {
    const data = await templateApi.list()
    templateList.value = data || []
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增模板'
  editingId.value = 0
  formData.name = ''
  formData.template_type = 'excel'
  formData.is_default = false
  formData.content = defaultContent
  dialogVisible.value = true
}

const handleEdit = (row: Template) => {
  dialogTitle.value = '编辑模板'
  editingId.value = row.id
  formData.name = row.name
  formData.template_type = row.template_type
  formData.is_default = row.is_default
  formData.content = row.content
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitting.value = true
  try {
    const payload = {
      name: formData.name,
      template_type: formData.template_type,
      is_default: formData.is_default,
      content: formData.content
    }
    
    if (editingId.value > 0) {
      await templateApi.update(editingId.value, payload)
      ElMessage.success('修改成功')
    } else {
      await templateApi.create(payload)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadTemplates()
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const handleSetDefault = async (row: Template) => {
  try {
    await templateApi.update(row.id, { is_default: true })
    ElMessage.success('已设为默认模板')
    loadTemplates()
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  }
}

const handleDelete = async (row: Template) => {
  await ElMessageBox.confirm('确认删除该模板吗？', '提示', { type: 'warning' })
  try {
    await templateApi.delete(row.id)
    ElMessage.success('删除成功')
    loadTemplates()
  } catch (e: any) {
    ElMessage.error(e.message || '删除失败')
  }
}

onMounted(() => {
  loadTemplates()
})
</script>

<style scoped>
.templates {
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #1D1D1F;
}

.content-preview {
  font-size: 13px;
  color: #86868B;
  cursor: pointer;
}

.form-tip {
  font-size: 12px;
  color: #86868B;
  margin-top: 4px;
}
</style>
