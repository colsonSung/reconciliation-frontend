<template>
  <div class="report-config">
    <el-card shadow="never" class="apple-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">结算报告获取配置</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增配置
            </el-button>
            <el-button @click="loadConfigs">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table v-loading="loading" :data="configList" stripe :header-cell-style="{ background: '#F2F2F7', fontWeight: 600 }">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="配置名称" />
        <el-table-column prop="source_type" label="数据源类型" width="120">
          <template #default="{ row }">
            <el-tag size="small" round :type="row.source_type === 'sftp' ? 'success' : 'primary'">
              {{ row.source_type === 'sftp' ? 'SFTP' : 'HTTP' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="channel_id" label="关联通道" width="120">
          <template #default="{ row }">
            {{ row.channel_id ? getChannelName(row.channel_id) : '全通道' }}
          </template>
        </el-table-column>
        <el-table-column prop="config" label="配置信息">
          <template #default="{ row }">
            <span style="color: #86868B;">
              {{ getConfigSummary(row.config, row.source_type) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="状态" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.is_active" @change="handleToggle(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="last_fetch_time" label="上次获取" width="180">
          <template #default="{ row }">
            {{ row.last_fetch_time ? formatTime(row.last_fetch_time) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleFetch(row)">获取</el-button>
            <el-button type="warning" link @click="handleTest(row)">测试</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Config Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" :close-on-click-modal="false">
      <el-form :model="formData" label-width="100px" class="apple-form" :rules="rules" ref="formRef">
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入配置名称" />
        </el-form-item>
        <el-form-item label="数据源" prop="source_type">
          <el-radio-group v-model="formData.source_type" @change="handleSourceTypeChange">
            <el-radio value="sftp">SFTP</el-radio>
            <el-radio value="http">HTTP</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="关联通道">
          <el-select v-model="formData.channel_id" placeholder="全通道" clearable style="width: 100%">
            <el-option v-for="ch in channels" :key="ch.id" :label="ch.name" :value="ch.id" />
          </el-select>
        </el-form-item>
        
        <!-- SFTP Config -->
        <template v-if="formData.source_type === 'sftp'">
          <el-divider content-position="left">SFTP 配置</el-divider>
          <el-form-item label="主机">
            <el-input v-model="sftpConfig.host" placeholder="sftp.example.com" />
          </el-form-item>
          <el-form-item label="端口">
            <el-input-number v-model="sftpConfig.port" :min="1" :max="65535" style="width: 100%" />
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="sftpConfig.username" placeholder="用户名" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="sftpConfig.password" type="password" show-password placeholder="密码" />
          </el-form-item>
          <el-form-item label="远程路径">
            <el-input v-model="sftpConfig.remote_path" placeholder="/reports/" />
          </el-form-item>
          <el-form-item label="文件匹配">
            <el-input v-model="sftpConfig.file_pattern" placeholder="*.xlsx, *.csv" />
          </el-form-item>
        </template>
        
        <!-- HTTP Config -->
        <template v-else>
          <el-divider content-position="left">HTTP 配置</el-divider>
          <el-form-item label="URL">
            <el-input v-model="httpConfig.url" placeholder="https://api.example.com/reports" />
          </el-form-item>
          <el-form-item label="认证方式">
            <el-select v-model="httpConfig.auth_type" style="width: 100%">
              <el-option label="无" value="none" />
              <el-option label="Basic Auth" value="basic" />
              <el-option label="Bearer Token" value="bearer" />
              <el-option label="API Key" value="apikey" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="httpConfig.auth_type === 'basic'" label="用户名">
            <el-input v-model="httpConfig.username" />
          </el-form-item>
          <el-form-item v-if="httpConfig.auth_type === 'basic'" label="密码">
            <el-input v-model="httpConfig.password" type="password" show-password />
          </el-form-item>
          <el-form-item v-if="httpConfig.auth_type === 'bearer'" label="Token">
            <el-input v-model="httpConfig.token" type="password" show-password />
          </el-form-item>
          <el-form-item v-if="httpConfig.auth_type === 'apikey'" label="API Key">
            <el-input v-model="httpConfig.api_key" />
          </el-form-item>
          <el-form-item label="请求方法">
            <el-select v-model="httpConfig.method" style="width: 100%">
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
            </el-select>
          </el-form-item>
        </template>
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
import { reportConfigApi, channelApi } from '../api'

interface ReportConfig {
  id: number
  name: string
  source_type: string
  channel_id: number | null
  config: Record<string, any>
  is_active: boolean
  last_fetch_time: string | null
}

interface SftpConfig {
  host: string
  port: number
  username: string
  password: string
  remote_path: string
  file_pattern: string
}

interface HttpConfig {
  url: string
  auth_type: string
  method: string
  username?: string
  password?: string
  token?: string
  api_key?: string
}

const configList = ref<ReportConfig[]>([])
const channels = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增配置')
const editingId = ref(0)
const formRef = ref()

const formData = reactive({
  name: '',
  source_type: 'sftp',
  channel_id: null as number | null
})

const defaultSftpConfig: SftpConfig = {
  host: '',
  port: 22,
  username: '',
  password: '',
  remote_path: '/reports/',
  file_pattern: '*.xlsx'
}

const defaultHttpConfig: HttpConfig = {
  url: '',
  auth_type: 'none',
  method: 'GET'
}

const sftpConfig = reactive<SftpConfig>({ ...defaultSftpConfig })
const httpConfig = reactive<HttpConfig>({ ...defaultHttpConfig })

const rules = {
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  source_type: [{ required: true, message: '请选择数据源类型', trigger: 'change' }]
}

const getChannelName = (id: number) => {
  const ch = channels.value.find(c => c.id === id)
  return ch ? ch.name : `ID: ${id}`
}

const getConfigSummary = (config: any, sourceType: string) => {
  if (!config) return '-'
  if (sourceType === 'sftp') {
    return `${config.host || ''}:${config.port || 22} ${config.remote_path || ''}`
  } else {
    return config.url || '-'
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const handleSourceTypeChange = () => {
  if (formData.source_type === 'sftp') {
    Object.assign(sftpConfig, defaultSftpConfig)
  } else {
    Object.assign(httpConfig, defaultHttpConfig)
  }
}

const loadConfigs = async () => {
  loading.value = true
  try {
    const data = await reportConfigApi.list()
    configList.value = data || []
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
  dialogTitle.value = '新增配置'
  editingId.value = 0
  formData.name = ''
  formData.source_type = 'sftp'
  formData.channel_id = null
  Object.assign(sftpConfig, defaultSftpConfig)
  Object.assign(httpConfig, defaultHttpConfig)
  dialogVisible.value = true
}

const handleEdit = (row: ReportConfig) => {
  dialogTitle.value = '编辑配置'
  editingId.value = row.id
  formData.name = row.name
  formData.source_type = row.source_type
  formData.channel_id = row.channel_id
  
  if (row.source_type === 'sftp') {
    const cfg = row.config || {}
    Object.assign(sftpConfig, {
      host: cfg.host || '',
      port: cfg.port || 22,
      username: cfg.username || '',
      password: cfg.password || '',
      remote_path: cfg.remote_path || '/reports/',
      file_pattern: cfg.file_pattern || '*.xlsx'
    })
  } else {
    const cfg = row.config || {}
    Object.assign(httpConfig, {
      url: cfg.url || '',
      auth_type: cfg.auth_type || 'none',
      method: cfg.method || 'GET',
      username: cfg.username || '',
      password: cfg.password || '',
      token: cfg.token || '',
      api_key: cfg.api_key || ''
    })
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitting.value = true
  try {
    const config = formData.source_type === 'sftp' ? sftpConfig : httpConfig
    const payload = {
      name: formData.name,
      source_type: formData.source_type,
      channel_id: formData.channel_id,
      config
    }
    
    if (editingId.value > 0) {
      await reportConfigApi.update(editingId.value, payload)
      ElMessage.success('修改成功')
    } else {
      await reportConfigApi.create(payload)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadConfigs()
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const handleToggle = async (row: ReportConfig) => {
  try {
    await reportConfigApi.update(row.id, { is_active: row.is_active })
    ElMessage.success(row.is_active ? '已启用' : '已停用')
  } catch (e: any) {
    row.is_active = !row.is_active
    ElMessage.error(e.message || '操作失败')
  }
}

const handleFetch = async (row: ReportConfig) => {
  try {
    ElMessage.info('正在获取报告...')
    await reportConfigApi.fetch(row.id)
    ElMessage.success('报告获取成功')
    loadConfigs()
  } catch (e: any) {
    ElMessage.error(e.message || '获取失败')
  }
}

const handleTest = async (row: ReportConfig) => {
  try {
    ElMessage.info('正在测试连接...')
    await reportConfigApi.test(row.id)
    ElMessage.success('连接测试成功')
  } catch (e: any) {
    ElMessage.error(e.message || '连接测试失败')
  }
}

const handleDelete = async (row: ReportConfig) => {
  await ElMessageBox.confirm('确认删除该配置吗？', '提示', { type: 'warning' })
  try {
    await reportConfigApi.delete(row.id)
    ElMessage.success('删除成功')
    loadConfigs()
  } catch (e: any) {
    ElMessage.error(e.message || '删除失败')
  }
}

onMounted(() => {
  loadConfigs()
  loadChannels()
})
</script>

<style scoped>
.report-config {
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
</style>
