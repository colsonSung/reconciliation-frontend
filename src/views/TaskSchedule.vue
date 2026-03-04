<template>
  <div class="task-schedule">
    <el-card shadow="never" class="apple-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">定时任务配置</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增任务
            </el-button>
            <el-button @click="loadJobs">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table v-loading="loading" :data="taskList" stripe :header-cell-style="{ background: '#F2F2F7', fontWeight: 600 }">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="任务名称" />
        <el-table-column prop="job_type" label="任务类型" width="130">
          <template #default="{ row }">
            <el-tag size="small" round :type="getJobTypeColor(row.job_type)">
              {{ getJobTypeName(row.job_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cron_expression" label="Cron 表达式" width="160">
          <template #default="{ row }">
            <code class="cron-code">{{ row.cron_expression }}</code>
          </template>
        </el-table-column>
        <el-table-column prop="channel_id" label="通道" width="120">
          <template #default="{ row }">
            <span v-if="row.channel_id">{{ getChannelName(row.channel_id) }}</span>
            <span v-else style="color: #86868B;">全通道</span>
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="状态" width="80">
          <template #default="{ row }">
            <el-switch 
              v-model="row.is_active" 
              @change="handleToggle(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注">
          <template #default="{ row }">
            <span style="color: #86868B;">{{ row.remark || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never" class="apple-card" style="margin-top: 24px">
      <template #header>
        <span class="card-title">结算设置</span>
      </template>
      <el-descriptions :column="2" border class="apple-descriptions">
        <el-descriptions-item label="结算模式">
          <el-tag size="small" round type="success">{{ settlementConfig.mode === 'auto' ? '自动结算' : '手动结算' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="结算周期">
          <el-tag size="small" round type="primary">{{ settlementConfig.period === 'daily' ? '日结' : settlementConfig.period === 'weekly' ? '周结' : '月结' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="结算时间">{{ settlementConfig.time }}</el-descriptions-item>
        <el-descriptions-item label="最低结算金额">{{ settlementConfig.minAmount }} 元</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- Job Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" :close-on-click-modal="false">
      <el-form :model="formData" label-width="100px" class="apple-form" :rules="rules" ref="formRef">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务类型" prop="job_type">
          <el-select v-model="formData.job_type" placeholder="请选择任务类型" style="width: 100%">
            <el-option label="对账任务" value="reconciliation" />
            <el-option label="结算任务" value="settlement" />
            <el-option label="报表任务" value="report" />
          </el-select>
        </el-form-item>
        <el-form-item label="通道" prop="channel_id">
          <el-select v-model="formData.channel_id" placeholder="全通道" clearable style="width: 100%">
            <el-option v-for="ch in channels" :key="ch.id" :label="ch.name" :value="ch.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Cron" prop="cron_expression">
          <el-input v-model="formData.cron_expression" placeholder="0 1 * * *" />
          <div class="form-tip">格式: 分 时 日 月 周 (如: 0 1 * * * 表示每天1点)</div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="可选备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { schedulerApi, channelApi } from '../api'

interface Task {
  id: number
  name: string
  job_type: string
  cron_expression: string
  channel_id: number | null
  is_active: boolean
  remark: string
}

const taskList = ref<Task[]>([])
const channels = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增任务')
const editingId = ref(0)
const formRef = ref()

const formData = reactive({
  name: '',
  job_type: 'reconciliation',
  channel_id: null as number | null,
  cron_expression: '0 1 * * *',
  remark: ''
})

const rules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  job_type: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  cron_expression: [{ required: true, message: '请输入Cron表达式', trigger: 'blur' }]
}

const settlementConfig = reactive({
  mode: 'auto',
  period: 'daily',
  time: '02:00',
  minAmount: 10000
})

const getJobTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'reconciliation': 'primary',
    'settlement': 'success',
    'report': 'warning'
  }
  return colors[type] || 'info'
}

const getJobTypeName = (type: string) => {
  const names: Record<string, string> = {
    'reconciliation': '对账任务',
    'settlement': '结算任务',
    'report': '报表任务'
  }
  return names[type] || type
}

const getChannelName = (id: number) => {
  const ch = channels.value.find(c => c.id === id)
  return ch ? ch.name : `ID: ${id}`
}

const loadJobs = async () => {
  loading.value = true
  try {
    const data = await schedulerApi.listJobs()
    taskList.value = data || []
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const loadChannels = async () => {
  try {
    const data = await channelApi.list()
    channels.value = data || []
  } catch (e: any) {
    console.error('加载通道失败', e)
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增任务'
  editingId.value = 0
  formData.name = ''
  formData.job_type = 'reconciliation'
  formData.channel_id = null
  formData.cron_expression = '0 1 * * *'
  formData.remark = ''
  dialogVisible.value = true
}

const handleEdit = (row: Task) => {
  dialogTitle.value = '编辑任务'
  editingId.value = row.id
  formData.name = row.name
  formData.job_type = row.job_type
  formData.channel_id = row.channel_id
  formData.cron_expression = row.cron_expression
  formData.remark = row.remark
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitting.value = true
  try {
    const payload = {
      name: formData.name,
      job_type: formData.job_type,
      channel_id: formData.channel_id,
      cron_expression: formData.cron_expression,
      remark: formData.remark,
      is_active: true
    }
    
    if (editingId.value > 0) {
      await schedulerApi.updateJob(editingId.value, payload)
      ElMessage.success('修改成功')
    } else {
      await schedulerApi.createJob(payload)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadJobs()
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const handleToggle = async (row: Task) => {
  try {
    const result = await schedulerApi.toggleJob(row.id)
    ElMessage.success(result.message)
  } catch (e: any) {
    row.is_active = !row.is_active
    ElMessage.error(e.message || '操作失败')
  }
}

const handleDelete = async (row: Task) => {
  await ElMessageBox.confirm('确认删除该任务吗？', '提示', { type: 'warning' })
  try {
    await schedulerApi.deleteJob(row.id)
    ElMessage.success('删除成功')
    loadJobs()
  } catch (e: any) {
    ElMessage.error(e.message || '删除失败')
  }
}

onMounted(() => {
  loadJobs()
  loadChannels()
})
</script>

<style scoped>
.task-schedule {
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

.cron-code {
  background: #F2F2F7;
  padding: 4px 8px;
  border-radius: 6px;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 13px;
  color: #0071E3;
}

.form-tip {
  font-size: 12px;
  color: #86868B;
  margin-top: 4px;
}
</style>
