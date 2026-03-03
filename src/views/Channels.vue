<template>
  <LayoutWrapper>
    <div class="channels">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>通道管理</span>
            <el-button type="primary" @click="handleAdd">新增通道</el-button>
          </div>
        </template>
        <el-table :data="tableData" stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="通道名称" />
          <el-table-column prop="code" label="通道编码" width="120" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag>{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-switch v-model="row.status" :active-value="1" :inactive-value="0" />
            </template>
          </el-table-column>
          <el-table-column prop="dailyLimit" label="日限额" width="120" />
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
        <el-form :model="formData" label-width="100px">
          <el-form-item label="通道名称">
            <el-input v-model="formData.name" placeholder="请输入通道名称" />
          </el-form-item>
          <el-form-item label="通道编码">
            <el-input v-model="formData.code" placeholder="请输入通道编码" />
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="formData.type" placeholder="请选择类型">
              <el-option label="支付宝" value="支付宝" />
              <el-option label="微信支付" value="微信支付" />
              <el-option label="银联" value="银联" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
          <el-form-item label="日限额">
            <el-input-number v-model="formData.dailyLimit" :min="0" :step="10000" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </LayoutWrapper>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import LayoutWrapper from '../components/LayoutWrapper.vue'

interface Channel {
  id: number
  name: string
  code: string
  type: string
  status: number
  dailyLimit: number
  createTime: string
}

const tableData = ref<Channel[]>([
  { id: 1, name: '支付宝官方', code: 'ALIPAY', type: '支付宝', status: 1, dailyLimit: 1000000, createTime: '2026-01-01 10:00:00' },
  { id: 2, name: '微信支付', code: 'WECHAT', type: '微信支付', status: 1, dailyLimit: 800000, createTime: '2026-01-05 10:00:00' },
  { id: 3, name: '银联在线', code: 'UNIONPAY', type: '银联', status: 1, dailyLimit: 500000, createTime: '2026-01-10 10:00:00' },
  { id: 4, name: '京东支付', code: 'JDPAY', type: '其他', status: 0, dailyLimit: 300000, createTime: '2026-02-01 10:00:00' }
])

const dialogVisible = ref(false)
const dialogTitle = ref('新增通道')
const editingId = ref(0)

const formData = reactive({
  name: '',
  code: '',
  type: '',
  dailyLimit: 0
})

const handleAdd = () => {
  dialogTitle.value = '新增通道'
  editingId.value = 0
  formData.name = ''
  formData.code = ''
  formData.type = ''
  formData.dailyLimit = 0
  dialogVisible.value = true
}

const handleEdit = (row: Channel) => {
  dialogTitle.value = '编辑通道'
  editingId.value = row.id
  formData.name = row.name
  formData.code = row.code
  formData.type = row.type
  formData.dailyLimit = row.dailyLimit
  dialogVisible.value = true
}

const handleDelete = async (row: Channel) => {
  await ElMessageBox.confirm('确认删除该通道吗？', '提示', { type: 'warning' })
  tableData.value = tableData.value.filter(item => item.id !== row.id)
  ElMessage.success('删除成功')
}

const handleSubmit = () => {
  if (editingId.value > 0) {
    const target = tableData.value.find(item => item.id === editingId.value)
    if (target) {
      target.name = formData.name
      target.code = formData.code
      target.type = formData.type
      target.dailyLimit = formData.dailyLimit
    }
    ElMessage.success('修改成功')
  } else {
    const newChannel: Channel = {
      id: Date.now(),
      name: formData.name,
      code: formData.code,
      type: formData.type,
      status: 1,
      dailyLimit: formData.dailyLimit,
      createTime: new Date().toLocaleString()
    }
    tableData.value.push(newChannel)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
