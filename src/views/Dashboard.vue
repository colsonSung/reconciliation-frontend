<template>
  <div class="dashboard">
    <!-- 统计卡片区域 - 金融风格 -->
    <el-row :gutter="24">
      <el-col :span="6" v-for="(stat, index) in statsData" :key="index">
        <div class="stat-card" :class="stat.class">
          <div class="stat-header">
            <div class="stat-icon-wrapper">
              <el-icon size="22"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
              <el-icon><component :is="stat.trend > 0 ? 'Top' : 'Bottom'" /></el-icon>
              {{ Math.abs(stat.trend) }}%
            </div>
          </div>
          <div class="stat-value numeric">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-footer">
            <span class="stat-period">较上周同期</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="24" style="margin-top: 24px">
      <!-- 趋势图 -->
      <el-col :span="16">
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title-section">
              <h3 class="chart-title">通道交易趋势</h3>
              <p class="chart-subtitle">各支付通道近期的交易量变化</p>
            </div>
            <el-radio-group v-model="trendPeriod" size="small" @change="updateTrendChart" class="period-selector">
              <el-radio-button value="week">近7天</el-radio-button>
              <el-radio-button value="month">近30天</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="trendChartRef" class="chart-container"></div>
        </div>
      </el-col>
      
      <!-- 饼图 -->
      <el-col :span="8">
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title-section">
              <h3 class="chart-title">差异分布</h3>
              <p class="chart-subtitle">对账差异类型占比</p>
            </div>
          </div>
          <div ref="pieChartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 第二行：结算统计 + 最近记录 -->
    <el-row :gutter="24" style="margin-top: 24px">
      <el-col :span="8">
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title-section">
              <h3 class="chart-title">结算统计</h3>
              <p class="chart-subtitle">各通道结算金额</p>
            </div>
          </div>
          <div ref="settleChartRef" class="chart-container-small"></div>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="table-card">
          <div class="table-header">
            <div class="table-title-section">
              <h3 class="table-title">最近对账记录</h3>
              <p class="table-subtitle">实时对账处理状态</p>
            </div>
            <el-button type="primary" link class="view-all-btn">
              查看全部
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <el-table :data="recentRecords" height="300" class="finance-table">
            <el-table-column prop="date" label="对账日期" width="140">
              <template #default="{ row }">
                <div class="date-cell">
                  <span class="date-main">{{ row.date }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="channel" label="通道" width="120">
              <template #default="{ row }">
                <div class="channel-cell">
                  <span class="channel-icon" :class="getChannelClass(row.channel)">
                    {{ row.channel.charAt(0) }}
                  </span>
                  {{ row.channel }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="totalCount" label="总笔数" width="100" align="right">
              <template #default="{ row }">
                <span class="numeric">{{ formatNumber(row.totalCount) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="matchCount" label="匹配" width="90" align="right">
              <template #default="{ row }">
                <span class="match-count">{{ formatNumber(row.matchCount) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="mismatchCount" label="差异" width="90" align="right">
              <template #default="{ row }">
                <span class="mismatch-count" :class="{ 'has-issue': row.mismatchCount > 0 }">
                  {{ formatNumber(row.mismatchCount) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="110">
              <template #default="{ row }">
                <div class="status-cell" :class="row.status === '完成' ? 'success' : 'pending'">
                  <span class="status-dot"></span>
                  {{ row.status }}
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { Money, SuccessFilled, WarningFilled, Clock, Top, Bottom, ArrowRight } from '@element-plus/icons-vue'

// 统计卡片数据 - 金融风格
const statsData = ref([
  { 
    icon: 'Money', 
    value: '¥12,580,000', 
    label: '总交易金额', 
    class: 'purple',
    trend: 12.5
  },
  { 
    icon: 'SuccessFilled', 
    value: '15,680', 
    label: '成功笔数', 
    class: 'green',
    trend: 8.2
  },
  { 
    icon: 'WarningFilled', 
    value: '23', 
    label: '差异笔数', 
    class: 'orange',
    trend: -15.3
  },
  { 
    icon: 'Clock', 
    value: '5', 
    label: '待处理', 
    class: 'red',
    trend: -32.1
  }
])

// 趋势图配置
const trendPeriod = ref('week')
const trendChartRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null

// 饼图配置
const pieChartRef = ref<HTMLElement>()
let pieChart: echarts.ECharts | null = null

// 结算统计图
const settleChartRef = ref<HTMLElement>()
let settleChart: echarts.ECharts | null = null

// 最近记录
const recentRecords = ref([
  { date: '2026-03-03', channel: '支付宝', totalCount: 5200, matchCount: 5195, mismatchCount: 5, status: '完成' },
  { date: '2026-03-03', channel: '微信支付', totalCount: 4800, matchCount: 4798, mismatchCount: 2, status: '完成' },
  { date: '2026-03-02', channel: '银联', totalCount: 3200, matchCount: 3195, mismatchCount: 5, status: '完成' },
  { date: '2026-03-02', channel: '支付宝', totalCount: 5100, matchCount: 5100, mismatchCount: 0, status: '完成' },
  { date: '2026-03-01', channel: '微信支付', totalCount: 4600, matchCount: 4595, mismatchCount: 5, status: '完成' }
])

const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN')
}

const getChannelClass = (channel: string) => {
  const map: Record<string, string> = {
    '支付宝': 'alipay',
    '微信支付': 'wechat',
    '银联': 'unionpay'
  }
  return map[channel] || ''
}

// 更新趋势图
const updateTrendChart = () => {
  if (!trendChart) return
  
  const days = trendPeriod.value === 'week' ? 7 : 30
  const dates = []
  const alipayData = []
  const wechatData = []
  const bankData = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }))
    alipayData.push(Math.floor(Math.random() * 5000) + 3000)
    wechatData.push(Math.floor(Math.random() * 4000) + 2000)
    bankData.push(Math.floor(Math.random() * 3000) + 1500)
  }
  
  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1A1F36',
      borderColor: '#232D3F',
      textStyle: { color: '#FFFFFF' },
      axisPointer: { 
        type: 'cross',
        lineStyle: { color: '#635BFF', type: 'dashed' },
        crossStyle: { color: '#635BFF' }
      }
    },
    legend: {
      data: ['支付宝', '微信支付', '银联'],
      bottom: 0,
      textStyle: { color: '#697386' },
      itemWidth: 12,
      itemHeight: 12
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: { lineStyle: { color: '#E4E7ED' } },
      axisLabel: { color: '#697386', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      name: '交易笔数',
      nameTextStyle: { color: '#697386', fontSize: 11 },
      axisLine: { show: false },
      axisLabel: { color: '#697386', fontSize: 11 },
      splitLine: { lineStyle: { color: '#F0F4F8' } }
    },
    series: [
      {
        name: '支付宝',
        type: 'line',
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 6,
        data: alipayData,
        itemStyle: { color: '#1677FF' },
        lineStyle: { width: 2.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(22, 119, 255, 0.2)' },
            { offset: 1, color: 'rgba(22, 119, 255, 0.02)' }
          ])
        }
      },
      {
        name: '微信支付',
        type: 'line',
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 6,
        data: wechatData,
        itemStyle: { color: '#07C160' },
        lineStyle: { width: 2.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(7, 193, 96, 0.2)' },
            { offset: 1, color: 'rgba(7, 193, 96, 0.02)' }
          ])
        }
      },
      {
        name: '银联',
        type: 'line',
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 6,
        data: bankData,
        itemStyle: { color: '#FF6B35' },
        lineStyle: { width: 2.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 107, 53, 0.2)' },
            { offset: 1, color: 'rgba(255, 107, 53, 0.02)' }
          ])
        }
      }
    ]
  })
}

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return
  pieChart = echarts.init(pieChartRef.value)
  
  pieChart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1A1F36',
      borderColor: '#232D3F',
      textStyle: { color: '#FFFFFF' },
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#697386', fontSize: 12 }
    },
    series: [
      {
        type: 'pie',
        radius: ['55%', '80%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#FFFFFF',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          scale: true,
          scaleSize: 8,
          label: {
            show: true,
            fontSize: 13,
            fontWeight: '600',
            color: '#1A1F36'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 15, name: '金额不一致', itemStyle: { color: '#F76707' } },
          { value: 8, name: '订单号不匹配', itemStyle: { color: '#FFAB00' } },
          { value: 5, name: '重复交易', itemStyle: { color: '#32D583' } },
          { value: 3, name: '通道延迟', itemStyle: { color: '#00D4FF' } },
          { value: 2, name: '其他', itemStyle: { color: '#697386' } }
        ]
      }
    ]
  })
}

// 初始化结算统计图
const initSettleChart = () => {
  if (!settleChartRef.value) return
  settleChart = echarts.init(settleChartRef.value)
  
  settleChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1A1F36',
      borderColor: '#232D3F',
      textStyle: { color: '#FFFFFF' },
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['支付宝', '微信支付', '银联'],
      axisLabel: { color: '#697386', fontSize: 12 },
      axisLine: { lineStyle: { color: '#E4E7ED' } }
    },
    yAxis: {
      type: 'value',
      name: '金额(万元)',
      nameTextStyle: { color: '#697386', fontSize: 11 },
      axisLabel: { color: '#697386', fontSize: 11 },
      splitLine: { lineStyle: { color: '#F0F4F8' } }
    },
    series: [
      {
        type: 'bar',
        data: [
          { value: 158, itemStyle: { color: '#1677FF', borderRadius: [4, 4, 0, 0] } },
          { value: 85.6, itemStyle: { color: '#07C160', borderRadius: [4, 4, 0, 0] } },
          { value: 235, itemStyle: { color: '#FF6B35', borderRadius: [4, 4, 0, 0] } }
        ],
        barWidth: '45%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  })
}

onMounted(() => {
  // 初始化趋势图
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    updateTrendChart()
  }
  
  // 初始化饼图
  initPieChart()
  
  // 初始化结算统计图
  initSettleChart()
  
  // 响应式调整
  window.addEventListener('resize', () => {
    trendChart?.resize()
    pieChart?.resize()
    settleChart?.resize()
  })
})

onUnmounted(() => {
  trendChart?.dispose()
  pieChart?.dispose()
  settleChart?.dispose()
})
</script>

<style scoped>
.dashboard {
  max-width: 1600px;
  margin: 0 auto;
}

/* 金融风格统计卡片 */
.stat-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.stat-card.purple::before {
  background: linear-gradient(90deg, #635BFF, #8B83FF);
}

.stat-card.green::before {
  background: linear-gradient(90deg, #32D583, #5DDE9E);
}

.stat-card.orange::before {
  background: linear-gradient(90deg, #FFAB00, #FFCB4D);
}

.stat-card.red::before {
  background: linear-gradient(90deg, #F76707, #FF8F47);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.purple .stat-icon-wrapper {
  background: linear-gradient(135deg, #635BFF 0%, #8B83FF 100%);
}

.green .stat-icon-wrapper {
  background: linear-gradient(135deg, #32D583 0%, #5DDE9E 100%);
}

.orange .stat-icon-wrapper {
  background: linear-gradient(135deg, #FFAB00 0%, #FFCB4D 100%);
}

.red .stat-icon-wrapper {
  background: linear-gradient(135deg, #F76707 0%, #FF8F47 100%);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.stat-trend.up {
  color: #32D583;
  background: rgba(50, 213, 131, 0.1);
}

.stat-trend.down {
  color: #F76707;
  background: rgba(246, 103, 7, 0.1);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 8px;
}

.stat-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--bg-tertiary);
}

.stat-period {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* 图表卡片 */
.chart-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 24px;
  height: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.chart-title-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chart-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.chart-subtitle {
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 0;
}

.period-selector :deep(.el-radio-button__inner) {
  font-size: 12px;
}

.chart-container {
  height: 340px;
  width: 100%;
}

.chart-container-small {
  height: 260px;
  width: 100%;
}

/* 表格卡片 */
.table-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 24px;
  height: 100%;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.table-title-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.table-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.table-subtitle {
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 0;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

/* 表格样式 */
.finance-table :deep(th.el-table__cell) {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary) !important;
}

.date-cell .date-main {
  font-weight: 600;
  color: var(--text-primary);
}

.channel-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.channel-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

.channel-icon.alipay {
  background: linear-gradient(135deg, #1677FF 0%, #4096FF 100%);
}

.channel-icon.wechat {
  background: linear-gradient(135deg, #07C160 0%, #2DDE8C 100%);
}

.channel-icon.unionpay {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F47 100%);
}

.match-count {
  color: #32D583;
  font-weight: 600;
}

.mismatch-count {
  font-weight: 600;
  color: var(--text-secondary);
}

.mismatch-count.has-issue {
  color: #F76707;
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-cell.success .status-dot {
  background: #32D583;
}

.status-cell.success {
  color: #0D9668;
}

.status-cell.pending .status-dot {
  background: #FFAB00;
}

.status-cell.pending {
  color: #CC8800;
}
</style>
