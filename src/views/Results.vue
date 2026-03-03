<template>
  <LayoutWrapper>
    <div class="results">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>对账结果</span>
            <div class="header-actions">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
              />
              <el-select v-model="channelFilter" placeholder="选择通道" clearable style="width: 150px; margin-left: 10px">
                <el-option label="全部" value="" />
                <el-option label="支付宝" value="支付宝" />
                <el-option label="微信支付" value="微信支付" />
                <el-option label="银联" value="银联" />
              </el-select>
              <el-button type="primary" style="margin-left: 10px" @click="handleSearch">查询</el-button>
            </div>
          </div>
        </template>
        
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="全部" name="all" />
          <el-tab-pane label="已匹配" name="matched" />
          <el-tab-pane label="差异" name="mismatch" />
          <el-tab-pane label="待处理" name="pending" />
        </el-tabs>

        <el-table :data="tableData" stripe height="500">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="orderNo" label="订单号" width="180" />
          <el-table-column prop="channel" label="通道" width="100" />
          <el-table-column prop="amount" label="金额" width="120">
            <template #default="{ row }">
              ¥{{ row.amount.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="channelStatus" label="通道状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.channelStatus === '成功' ? 'success' : 'danger'">
                {{ row.channelStatus }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="systemStatus" label="系统状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.systemStatus === '成功' ? 'success' : 'danger'">
                {{ row.systemStatus }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="result" label="对账结果" width="100">
            <template #default="{ row }">
              <el-tag :type="row.result === '匹配' ? 'success' : row.result === '差异' ? 'danger' : 'warning'">
                {{ row.result }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="交易时间" width="180" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          style="margin-top: 20px; justify-content: flex-end"
        />
      </el-card>

      <el-dialog v-model="detailVisible" title="订单详情" width="600px">
        <el-descriptions :column="2" border v-if="currentDetail">
          <el-descriptions-item label="订单号">{{ currentDetail.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="通道">{{ currentDetail.channel }}</el-descriptions-item>
          <el-descriptions-item label="金额">¥{{ currentDetail.amount.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="交易时间">{{ currentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="通道状态">{{ currentDetail.channelStatus }}</el-descriptions-item>
          <el-descriptions-item label="系统状态">{{ currentDetail.systemStatus }}</el-descriptions-item>
          <el-descriptions-item label="对账结果">{{ currentDetail.result }}</el-descriptions-item>
          <el-descriptions-item label="差异原因" v-if="currentDetail.result === '差异'">{{ currentDetail.reason || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-dialog>
    </div>
  </LayoutWrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LayoutWrapper from '../components/LayoutWrapper.vue'

const dateRange = ref<string[]>([])
const channelFilter = ref('')
const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(100)
const detailVisible = ref(false)
const currentDetail = ref<any>(null)

// 模拟数据
const generateData = () => {
  const statuses = ['成功', '失败']
  const results = ['匹配', '差异', '待处理']
  const data = []
  for (let i = 0; i < 50; i++) {
    const result = results[Math.floor(Math.random() * results.length)]
    data.push({
      orderNo: `ORD${Date.now()}${i}`,
      channel: ['支付宝', '微信支付', '银联'][Math.floor(Math.random() * 3)],
      amount: Math.random() * 10000,
      channelStatus: statuses[Math.floor(Math.random() * 2)],
      systemStatus: result === '匹配' ? '成功' : statuses[Math.floor(Math.random() * 2)],
      result,
      createTime: `2026-03-${String(Math.floor(Math.random() * 3) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
      reason: result === '差异' ? '金额不一致' : ''
    })
  }
  return data
}

const tableData = ref(generateData())

const handleSearch = () => {
  console.log('查询条件:', dateRange.value, channelFilter.value)
}

const handleTabChange = (tab: string) => {
  console.log('切换tab:', tab)
}

const handleDetail = (row: any) => {
  currentDetail.value = row
  detailVisible.value = true
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-actions {
  display: flex;
  align-items: center;
}
</style>
