<template>
  <div class="channels">
    <el-card shadow="never" class="apple-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">通道管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增通道
          </el-button>
        </div>
      </template>
      <el-table v-loading="loading" :data="tableData" stripe :header-cell-style="{ background: '#F2F2F7' }">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="通道名称" />
        <el-table-column prop="code" label="通道编码" width="120" />
        <el-table-column prop="channel_type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag size="small" round :type="getTypeColor(row.channel_type)">
              {{ getTypeName(row.channel_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="settlement_rule" label="结算方式" width="120">
          <template #default="{ row }">
            <el-tag size="small" round :type="row.settlement_rule === 'auto' ? 'success' : 'warning'">
              {{ row.settlement_rule === 'auto' ? '自动' : '手动' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="min_settle_amount" label="最低结算" width="120">
          <template #default="{ row }">
            ¥{{ row.min_settle_amount }}
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="状态" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.is_active" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleCostConfig(row)">成本</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="550px" :close-on-click-modal="false">
      <el-form :model="formData" label-width="100px" class="apple-form" :rules="rules" ref="formRef">
        <el-form-item label="通道名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入通道名称" />
        </el-form-item>
        <el-form-item label="通道编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入通道编码" />
        </el-form-item>
        <el-form-item label="类型" prop="channel_type">
          <el-select v-model="formData.channel_type" placeholder="请选择类型" style="width: 100%">
            <el-option label="支付宝" value="alipay" />
            <el-option label="微信支付" value="wechat" />
            <el-option label="银联" value="bank" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="结算方式">
          <el-radio-group v-model="formData.settlement_rule">
            <el-radio value="auto">自动结算</el-radio>
            <el-radio value="manual">手动结算</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="最低结算金额">
          <el-input-number v-model="formData.min_settle_amount" :min="0" :step="100" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="costDialogVisible" title="成本配置" width="550px" :close-on-click-modal="false">
      <el-form :model="costForm" label-width="120px" class="apple-form">
        <el-form-item label="通道">
          <el-input v-model="costForm.channelName" disabled />
        </el-form-item>
        <el-divider content-position="left">交易费率配置</el-divider>
        <el-form-item label="交易费率(%)">
          <el-input-number v-model="costForm.rate" :min="0" :max="100" :precision="4" :step="0.0001" style="width: 100%" />
          <div class="form-tip">例如: 0.6 表示千分之六</div>
        </el-form-item>
        <el-form-item label="单笔手续费(元)">
          <el-input-number v-model="costForm.fixedFee" :min="0" :step="0.01" style="width: 100%" />
        </el-form-item>
        <el-divider content-position="left">结算费率配置</el-divider>
        <el-form-item label="结算费率(%)">
          <el-input-number v-model="costForm.settleRate" :min="0" :max="100" :precision="4" :step="0.0001" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结算手续费(元)">
          <el-input-number v-model="costForm.settleFixedFee" :min="0" :step="0.01" style="width: 100%" />
        </el-form-item>
        <el-divider content-position="left">其他费用</el-divider>
        <el-form-item label="通道服务费(元)">
          <el-input-number v-model="costForm.serviceFee" :min="0" :step="1" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="costDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCostConfig" :loading="submitting">保存配置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { channelApi } from '../api'

interface Channel {
  id: number
  name: string
  code: string
  channel_type: string
  settlement_rule: string
  min_settle_amount: number
  is_active: number
  cost_config: any
  created_at: string
}

const tableData = ref<Channel[]>([])
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const costDialogVisible = ref(false)
const dialogTitle = ref('新增通道')
const editingId = ref(0)
const formRef = ref()

const formData = reactive({
  name: '',
  code: '',
  channel_type: 'alipay',
  settlement_rule: 'manual',
  min_settle_amount: 100
})

const costForm = reactive({
  channelId: 0,
  channelName: '',
  rate: 0,
  fixedFee: 0,
  settleRate: 0,
  settleFixedFee: 0,
  serviceFee: 0
})

const rules = {
  name: [{ required: true, message: '请输入通道名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入通道编码', trigger: 'blur' }],
  channel_type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'alipay': 'primary',
    'wechat': 'success',
    'bank': 'warning',
    'other': 'info'
  }
  return colors[type] || 'info'
}

const getTypeName = (type: string) => {
  const names: Record<string, string> = {
    'alipay': '支付宝',
    'wechat': '微信支付',
    'bank': '银联',
    'other': '其他'
  }
  return names[type] || type
}

const formatTime = (time: string) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const loadChannels = async () => {
  loading.value = true
  try {
    const data = await channelApi.list()
    tableData.value = data || []
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增通道'
  editingId.value = 0
  formData.name = ''
  formData.code = ''
  formData.channel_type = 'alipay'
  formData.settlement_rule = 'manual'
  formData.min_settle_amount = 100
  dialogVisible.value = true
}

const handleEdit = (row: Channel) => {
  dialogTitle.value = '编辑通道'
  editingId.value = row.id
  formData.name = row.name
  formData.code = row.code
  formData.channel_type = row.channel_type
  formData.settlement_rule = row.settlement_rule
  formData.min_settle_amount = row.min_settle_amount
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (editingId.value > 0) {
      await channelApi.update(editingId.value, formData)
      ElMessage.success('修改成功')
    } else {
      await channelApi.create(formData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadChannels()
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const handleCostConfig = (row: Channel) => {
  costForm.channelId = row.id
  costForm.channelName = row.name
  
  const config = row.cost_config || {}
  costForm.rate = config.fee_rate || 0.6
  costForm.fixedFee = config.fixed_fee || 0
  costForm.settleRate = config.settle_rate || 0
  costForm.settleFixedFee = config.settle_fixed_fee || 0
  costForm.serviceFee = config.service_fee || 0
  costDialogVisible.value = true
}

const saveCostConfig = async () => {
  submitting.value = true
  try {
    const costConfig = {
      fee_rate: costForm.rate,
      fixed_fee: costForm.fixedFee,
      settle_rate: costForm.settleRate,
      settle_fixed_fee: costForm.settleFixedFee,
      service_fee: costForm.serviceFee
    }
    await channelApi.update(costForm.channelId, { cost_config: costConfig })
    ElMessage.success('成本配置保存成功')
    costDialogVisible.value = false
    loadChannels()
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

const handleStatusChange = async (row: Channel) => {
  try {
    await channelApi.update(row.id, { is_active: row.is_active })
    ElMessage.success(row.is_active ? '已启用' : '已停用')
  } catch (e: any) {
    row.is_active = row.is_active === 1 ? 0 : 1
    ElMessage.error(e.message || '操作失败')
  }
}

const handleDelete = async (row: Channel) => {
  await ElMessageBox.confirm('确认删除该通道吗？', '提示', { type: 'warning' })
  try {
    await channelApi.delete(row.id)
    ElMessage.success('删除成功')
    loadChannels()
  } catch (e: any) {
    ElMessage.error(e.message || '删除失败')
  }
}

onMounted(() => {
  loadChannels()
})
</script>

<style scoped>
.channels {
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #1D1D1F;
}

.apple-form :deep(.el-input-number) {
  width: 100%;
}

.form-tip {
  font-size: 12px;
  color: #86868B;
  margin-top: 4px;
}
</style>
