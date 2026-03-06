<template>
  <div class="channels">
    <el-card shadow="never" class="finance-card">
      <el-tabs v-model="activeTab" class="channel-tabs">
        <el-tab-pane label="通道列表" name="channels">
          <template #default>
            <div class="tab-header">
              <div class="tab-title-group">
                <h3 class="tab-title">通道管理</h3>
                <p class="tab-subtitle">管理支付通道配置和结算规则</p>
              </div>
              <el-button type="primary" @click="handleAdd">
                <el-icon><Plus /></el-icon>
                新增通道
              </el-button>
            </div>
            <el-table v-loading="loading" :data="tableData" stripe class="channel-table" :header-cell-style="headerStyle">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="通道名称" min-width="150">
                <template #default="{ row }">
                  <div class="channel-name-cell">
                    <div class="channel-avatar" :class="getChannelClass(row.channel_type)">
                      {{ row.name.charAt(0) }}
                    </div>
                    <span class="channel-name">{{ row.name }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="code" label="通道编码" width="140">
                <template #default="{ row }">
                  <code class="code-text">{{ row.code }}</code>
                </template>
              </el-table-column>
              <el-table-column prop="channel_type" label="类型" width="120">
                <template #default="{ row }">
                  <el-tag size="small" round :class="getTypeClass(row.channel_type)">
                    {{ getTypeName(row.channel_type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="settlement_rule" label="结算方式" width="120">
                <template #default="{ row }">
                  <div class="settlement-cell" :class="row.settlement_rule">
                    <el-icon v-if="row.settlement_rule === 'auto'"><CircleCheck /></el-icon>
                    <el-icon v-else><Clock /></el-icon>
                    {{ row.settlement_rule === 'auto' ? '自动' : '手动' }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="min_settle_amount" label="最低结算" width="120" align="right">
                <template #default="{ row }">
                  <span class="amount-text">¥{{ row.min_settle_amount }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="is_active" label="状态" width="100">
                <template #default="{ row }">
                  <el-switch 
                    v-model="row.is_active" 
                    :active-value="1" 
                    :inactive-value="0" 
                    @change="handleStatusChange(row)"
                    class="status-switch"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="创建时间" width="180">
                <template #default="{ row }">
                  <span class="time-text">{{ formatTime(row.created_at) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="{ row }">
                  <div class="action-group">
                    <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
                    <el-button type="success" link @click="handleCostConfig(row)">成本</el-button>
                    <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-tab-pane>
        
        <el-tab-pane label="SFTP 配置" name="sftp">
          <template #default>
            <div class="config-section">
              <div class="section-header">
                <div class="section-title-group">
                  <h3 class="section-title">SFTP 文件传输配置</h3>
                  <p class="section-subtitle">配置与各通道的 SFTP 文件同步</p>
                </div>
                <el-button type="primary" @click="saveSftpConfig" :loading="saving">保存配置</el-button>
              </div>
              <el-form :model="sftpConfig" label-width="140px" class="config-form">
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="主机地址">
                      <el-input v-model="sftpConfig.host" placeholder="例如: sftp.example.com" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="端口">
                      <el-input-number v-model="sftpConfig.port" :min="1" :max="65535" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="用户名">
                      <el-input v-model="sftpConfig.username" placeholder="请输入用户名" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="认证方式">
                      <el-select v-model="sftpConfig.authType" style="width: 100%">
                        <el-option label="密码认证" value="password" />
                        <el-option label="SSH 密钥" value="key" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="密码" v-if="sftpConfig.authType === 'password'">
                      <el-input v-model="sftpConfig.password" type="password" show-password placeholder="请输入密码" />
                    </el-form-item>
                    <el-form-item label="私钥内容" v-else>
                      <el-input v-model="sftpConfig.privateKey" type="textarea" :rows="3" placeholder="请粘贴私钥内容" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="远程目录">
                      <el-input v-model="sftpConfig.remoteDir" placeholder="例如: /reconciliation/files" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-divider />
                <el-row :gutter="24">
                  <el-col :span="8">
                    <el-form-item label="下载路径模式">
                      <el-input v-model="sftpConfig.downloadPattern" placeholder="例如: {date}/channel_{channel}.csv" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="文件编码">
                      <el-select v-model="sftpConfig.encoding" style="width: 100%">
                        <el-option label="UTF-8" value="utf-8" />
                        <el-option label="GBK" value="gbk" />
                        <el-option label="GB2312" value="gb2312" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="连接超时(秒)">
                      <el-input-number v-model="sftpConfig.timeout" :min="5" :max="300" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
              
              <el-collapse v-model="activeCollapse" class="sftp-channels">
                <el-collapse-item title="通道 SFTP 配置" name="channels">
                  <div class="channel-config-list">
                    <el-table :data="channelSftpList" stripe size="small">
                      <el-table-column prop="channelName" label="通道" />
                      <el-table-column prop="remotePath" label="远程路径" />
                      <el-table-column prop="filePattern" label="文件匹配" />
                      <el-table-column label="操作" width="120">
                        <template #default="{ row }">
                          <el-button type="primary" link size="small" @click="editChannelSftp(row)">编辑</el-button>
                          <el-button type="success" link size="small" @click="testSftpConnection(row)">测试</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                    <el-button type="primary" link class="add-channel-btn" @click="addChannelSftp">
                      <el-icon><Plus /></el-icon> 添加通道配置
                    </el-button>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </template>
        </el-tab-pane>
        
        <el-tab-pane label="网页下载配置" name="webdownload">
          <template #default>
            <div class="config-section">
              <div class="section-header">
                <div class="section-title-group">
                  <h3 class="section-title">网页下载配置</h3>
                  <p class="section-subtitle">通过 API 接口下载通道对账文件</p>
                </div>
                <el-button type="primary" @click="saveWebConfig" :loading="saving">保存配置</el-button>
              </div>
              <el-form :model="webConfig" label-width="140px" class="config-form">
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="目标 URL">
                      <el-input v-model="webConfig.targetUrl" placeholder="例如: https://channel.com/download" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="请求方法">
                      <el-radio-group v-model="webConfig.method">
                        <el-radio value="GET">GET</el-radio>
                        <el-radio value="POST">POST</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="认证类型">
                      <el-select v-model="webConfig.authType" style="width: 100%">
                        <el-option label="无认证" value="none" />
                        <el-option label="Basic Auth" value="basic" />
                        <el-option label="Bearer Token" value="bearer" />
                        <el-option label="API Key" value="apikey" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12" v-if="webConfig.authType === 'basic'">
                    <el-form-item label="用户名">
                      <el-input v-model="webConfig.username" placeholder="Basic Auth 用户名" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="24" v-if="webConfig.authType !== 'none'">
                  <el-col :span="12">
                    <el-form-item label="密码/Token" v-if="webConfig.authType === 'basic'">
                      <el-input v-model="webConfig.password" type="password" show-password />
                    </el-form-item>
                    <el-form-item label="Token" v-else-if="webConfig.authType === 'bearer'">
                      <el-input v-model="webConfig.token" type="password" show-password />
                    </el-form-item>
                    <el-form-item label="API Key" v-else>
                      <el-input v-model="webConfig.apiKey" placeholder="Header 中传递的 API Key" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-divider content-position="left">请求参数配置</el-divider>
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="日期参数名">
                      <el-input v-model="webConfig.dateParam" placeholder="例如: date, queryDate" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="日期格式">
                      <el-select v-model="webConfig.dateFormat" style="width: 100%">
                        <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
                        <el-option label="YYYYMMDD" value="YYYYMMDD" />
                        <el-option label="yyyyMMddHHmmss" value="yyyyMMddHHmmss" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="额外参数(JSON)">
                      <el-input v-model="webConfig.extraParams" type="textarea" :rows="2" placeholder='例如: {"type": "daily"}' />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="文件下载路径">
                      <el-input v-model="webConfig.downloadPath" placeholder="保存到本地的路径模板" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-divider content-position="left">通道配置</el-divider>
                <div class="channel-config-list">
                  <el-table :data="channelWebList" stripe size="small">
                    <el-table-column prop="channelName" label="通道" />
                    <el-table-column prop="apiEndpoint" label="API 端点" />
                    <el-table-column prop="schedule" label="调度时间" />
                    <el-table-column label="操作" width="120">
                      <template #default="{ row }">
                        <el-button type="primary" link size="small" @click="editChannelWeb(row)">编辑</el-button>
                        <el-button type="success" link size="small" @click="testWebDownload(row)">测试</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-button type="primary" link class="add-channel-btn" @click="addChannelWeb">
                    <el-icon><Plus /></el-icon> 添加通道配置
                  </el-button>
                </div>
              </el-form>
            </div>
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 通道编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" :close-on-click-modal="false" class="channel-dialog">
      <el-form :model="formData" label-width="100px" class="channel-form" :rules="rules" ref="formRef">
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
            <el-radio-button value="auto">自动结算</el-radio-button>
            <el-radio-button value="manual">手动结算</el-radio-button>
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

    <!-- 成本配置对话框 -->
    <el-dialog v-model="costDialogVisible" title="成本配置" width="560px" :close-on-click-modal="false" class="cost-dialog">
      <div class="cost-header" v-if="costForm.channelName">
        <span class="cost-channel">{{ costForm.channelName }}</span>
      </div>
      <el-form :model="costForm" label-width="120px" class="cost-form">
        <div class="cost-section">
          <div class="cost-section-title">交易费率配置</div>
          <el-form-item label="交易费率(%)">
            <el-input-number v-model="costForm.rate" :min="0" :max="100" :precision="4" :step="0.0001" style="width: 100%" />
            <div class="form-tip">例如: 0.6 表示千分之六</div>
          </el-form-item>
          <el-form-item label="单笔手续费(元)">
            <el-input-number v-model="costForm.fixedFee" :min="0" :step="0.01" style="width: 100%" />
          </el-form-item>
        </div>
        <div class="cost-section">
          <div class="cost-section-title">结算费率配置</div>
          <el-form-item label="结算费率(%)">
            <el-input-number v-model="costForm.settleRate" :min="0" :max="100" :precision="4" :step="0.0001" style="width: 100%" />
          </el-form-item>
          <el-form-item label="结算手续费(元)">
            <el-input-number v-model="costForm.settleFixedFee" :min="0" :step="0.01" style="width: 100%" />
          </el-form-item>
        </div>
        <div class="cost-section">
          <div class="cost-section-title">其他费用</div>
          <el-form-item label="通道服务费(元)">
            <el-input-number v-model="costForm.serviceFee" :min="0" :step="1" style="width: 100%" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="costDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCostConfig" :loading="submitting">保存配置</el-button>
      </template>
    </el-dialog>

    <!-- 通道 SFTP 配置对话框 -->
    <el-dialog v-model="channelSftpDialogVisible" :title="sftpDialogTitle" width="500px">
      <el-form :model="channelSftpForm" label-width="100px">
        <el-form-item label="通道">
          <el-select v-model="channelSftpForm.channelId" style="width: 100%">
            <el-option v-for="ch in tableData" :key="ch.id" :label="ch.name" :value="ch.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="远程路径">
          <el-input v-model="channelSftpForm.remotePath" placeholder="例如: /data/{date}/" />
        </el-form-item>
        <el-form-item label="文件匹配">
          <el-input v-model="channelSftpForm.filePattern" placeholder="例如: channel_*.csv" />
        </el-form-item>
        <el-form-item label="文件编码">
          <el-select v-model="channelSftpForm.encoding" style="width: 100%">
            <el-option label="UTF-8" value="utf-8" />
            <el-option label="GBK" value="gbk" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="channelSftpDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveChannelSftp">保存</el-button>
      </template>
    </el-dialog>

    <!-- 通道网页下载配置对话框 -->
    <el-dialog v-model="channelWebDialogVisible" :title="webDialogTitle" width="500px">
      <el-form :model="channelWebForm" label-width="100px">
        <el-form-item label="通道">
          <el-select v-model="channelWebForm.channelId" style="width: 100%">
            <el-option v-for="ch in tableData" :key="ch.id" :label="ch.name" :value="ch.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="API 端点">
          <el-input v-model="channelWebForm.apiEndpoint" placeholder="完整 URL 或相对路径" />
        </el-form-item>
        <el-form-item label="调度时间">
          <el-input v-model="channelWebForm.schedule" placeholder="例如: 02:00, 14:00" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="channelWebForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="channelWebDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveChannelWeb">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, CircleCheck, Clock } from '@element-plus/icons-vue'

const headerStyle = {
  background: '#F7F9FC',
  fontWeight: '600',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: '#697386'
}

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

// Tab state
const activeTab = ref('channels')
const activeCollapse = ref(['channels'])

// Table data
const tableData = ref<Channel[]>([
  { id: 1, name: '支付宝', code: 'alipay', channel_type: 'alipay', settlement_rule: 'auto', min_settle_amount: 100, is_active: 1, cost_config: null, created_at: '2026-01-15' },
  { id: 2, name: '微信支付', code: 'wechat', channel_type: 'wechat', settlement_rule: 'auto', min_settle_amount: 100, is_active: 1, cost_config: null, created_at: '2026-01-15' },
  { id: 3, name: '银联', code: 'unionpay', channel_type: 'bank', settlement_rule: 'manual', min_settle_amount: 500, is_active: 1, cost_config: null, created_at: '2026-01-20' },
])
const loading = ref(false)
const submitting = ref(false)
const saving = ref(false)

// Dialog states
const dialogVisible = ref(false)
const costDialogVisible = ref(false)
const channelSftpDialogVisible = ref(false)
const channelWebDialogVisible = ref(false)
const dialogTitle = ref('新增通道')
const sftpDialogTitle = ref('添加通道 SFTP 配置')
const webDialogTitle = ref('添加通道网页配置')
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

// SFTP Config
const sftpConfig = reactive({
  host: 'sftp.example.com',
  port: 22,
  username: '',
  password: '',
  authType: 'password',
  privateKey: '',
  remoteDir: '/reconciliation',
  downloadPattern: '{date}/channel_{channel}.csv',
  encoding: 'utf-8',
  timeout: 30
})

// Web Download Config
const webConfig = reactive({
  targetUrl: '',
  method: 'POST',
  authType: 'none',
  username: '',
  password: '',
  token: '',
  apiKey: '',
  dateParam: 'date',
  dateFormat: 'YYYY-MM-DD',
  extraParams: '',
  downloadPath: './downloads/{date}'
})

// Channel SFTP list
const channelSftpList = ref([
  { id: 1, channelName: '支付宝', remotePath: '/data/alipay/', filePattern: '*.csv', encoding: 'utf-8' },
  { id: 2, channelName: '微信支付', remotePath: '/data/wechat/', filePattern: '*.txt', encoding: 'utf-8' }
])

// Channel Web list
const channelWebList = ref([
  { id: 1, channelName: '银联', apiEndpoint: '/api/bank/download', schedule: '02:00', remark: '' }
])

// Channel SFTP form
const channelSftpForm = reactive({
  id: 0,
  channelId: 0,
  remotePath: '',
  filePattern: '',
  encoding: 'utf-8'
})

// Channel Web form
const channelWebForm = reactive({
  id: 0,
  channelId: 0,
  apiEndpoint: '',
  schedule: '',
  remark: ''
})

const rules = {
  name: [{ required: true, message: '请输入通道名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入通道编码', trigger: 'blur' }],
  channel_type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

const getChannelClass = (type: string) => {
  const map: Record<string, string> = {
    'alipay': 'alipay',
    'wechat': 'wechat',
    'bank': 'unionpay',
    'other': 'other'
  }
  return map[type] || 'other'
}

const getTypeClass = (type: string) => {
  const map: Record<string, string> = {
    'alipay': 'type-alipay',
    'wechat': 'type-wechat',
    'bank': 'type-unionpay',
    'other': 'type-other'
  }
  return map[type] || 'type-other'
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
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success(editingId.value > 0 ? '修改成功' : '新增成功')
    dialogVisible.value = false
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
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('成本配置保存成功')
    costDialogVisible.value = false
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

const handleStatusChange = async (row: Channel) => {
  try {
    ElMessage.success(row.is_active ? '已启用' : '已停用')
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  }
}

const handleDelete = async (row: Channel) => {
  await ElMessageBox.confirm('确认删除该通道吗？', '提示', { type: 'warning' })
  try {
    ElMessage.success('删除成功')
  } catch (e: any) {
    ElMessage.error(e.message || '删除失败')
  }
}

// SFTP methods
const saveSftpConfig = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('SFTP 配置保存成功')
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const addChannelSftp = () => {
  sftpDialogTitle.value = '添加通道 SFTP 配置'
  channelSftpForm.id = 0
  channelSftpForm.channelId = 0
  channelSftpForm.remotePath = ''
  channelSftpForm.filePattern = ''
  channelSftpForm.encoding = 'utf-8'
  channelSftpDialogVisible.value = true
}

const editChannelSftp = (row: any) => {
  sftpDialogTitle.value = '编辑通道 SFTP 配置'
  channelSftpForm.id = row.id
  channelSftpForm.channelId = row.channelId
  channelSftpForm.remotePath = row.remotePath
  channelSftpForm.filePattern = row.filePattern
  channelSftpForm.encoding = row.encoding
  channelSftpDialogVisible.value = true
}

const saveChannelSftp = () => {
  channelSftpDialogVisible.value = false
  ElMessage.success('通道 SFTP 配置保存成功')
}

const testSftpConnection = async (row: any) => {
  try {
    await ElMessageBox.confirm(`测试连接 ${row.channelName} SFTP...`, '连接测试', { type: 'info' })
    ElMessage.success('连接成功')
  } catch {
    ElMessage.info('测试取消')
  }
}

// Web download methods
const saveWebConfig = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('网页下载配置保存成功')
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const addChannelWeb = () => {
  webDialogTitle.value = '添加通道网页配置'
  channelWebForm.id = 0
  channelWebForm.channelId = 0
  channelWebForm.apiEndpoint = ''
  channelWebForm.schedule = ''
  channelWebForm.remark = ''
  channelWebDialogVisible.value = true
}

const editChannelWeb = (row: any) => {
  webDialogTitle.value = '编辑通道网页配置'
  channelWebForm.id = row.id
  channelWebForm.channelId = row.channelId
  channelWebForm.apiEndpoint = row.apiEndpoint
  channelWebForm.schedule = row.schedule
  channelWebForm.remark = row.remark
  channelWebDialogVisible.value = true
}

const saveChannelWeb = () => {
  channelWebDialogVisible.value = false
  ElMessage.success('通道网页配置保存成功')
}

const testWebDownload = async (row: any) => {
  try {
    await ElMessageBox.confirm(`测试下载 ${row.channelName} 数据...`, '下载测试', { type: 'info' })
    ElMessage.success('下载成功')
  } catch {
    ElMessage.info('测试取消')
  }
}

onMounted(() => {
  // 数据已在初始值中定义
})
</script>

<style scoped>
.channels {
  max-width: 1600px;
  margin: 0 auto;
}

.finance-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: none;
}

.channel-tabs :deep(.el-tabs__header) {
  margin-bottom: 24px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.tab-title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tab-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.tab-subtitle {
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 0;
}

.channel-table :deep(th.el-table__cell) {
  background: #F7F9FC !important;
}

.channel-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.channel-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
}

.channel-avatar.alipay {
  background: linear-gradient(135deg, #1677FF 0%, #4096FF 100%);
}

.channel-avatar.wechat {
  background: linear-gradient(135deg, #07C160 0%, #2DDE8C 100%);
}

.channel-avatar.unionpay {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F47 100%);
}

.channel-avatar.other {
  background: linear-gradient(135deg, #697386 0%, #8E99A4 100%);
}

.channel-name {
  font-weight: 600;
}

.code-text {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  padding: 4px 8px;
  background: #F7F9FC;
  border-radius: 4px;
  color: var(--text-secondary);
}

.type-alipay { background: rgba(22, 119, 255, 0.1) !important; color: #1677FF !important; }
.type-wechat { background: rgba(7, 193, 96, 0.1) !important; color: #07C160 !important; }
.type-unionpay { background: rgba(255, 107, 53, 0.1) !important; color: #FF6B35 !important; }
.type-other { background: rgba(105, 115, 134, 0.1) !important; color: #697386 !important; }

.settlement-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}

.settlement