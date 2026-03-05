<template>
  <div class="dashboard">
    <!-- 统计卡片区域 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="(stat, index) in statsData" :key="index">
        <el-card shadow="never" class="stat-card apple-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon size="24"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 24px">
      <!-- 趋势图 -->
      <el-col :span="16">
        <el-card shadow="never" class="apple-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">通道交易趋势</span>
              <el-radio-group v-model="trendPeriod" size="small" @change="updateTrendChart">
                <el-radio-button value="week">近7天</el-radio-button>
                <el-radio-button value="month">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <!-- 饼图 -->
      <el-col :span="8">
        <el-card shadow="never" class="apple-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">差异分布</span>
            </div>
          </template>
          <div ref="pieChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行：结算统计 + 最近记录 -->
    <el-row :gutter="20" style="margin-top: 24px">
      <el-col :span="8">
        <el-card shadow="never" class="apple-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">结算统计</span>
            </div>
          </template>
          <div ref="settleChartRef" class="chart-container-small"></div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card shadow="never" class="apple-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近对账记录</span>
              <el-button type="primary" link>查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentRecords" height="280" :row-style="{ transition: 'all 0.2s' }">
            <el-table-column prop="date" label="对账日期" width="130" />
            <el-table-column prop="channel" label="通道" />
            <el-table-column prop="totalCount" label="总笔数" width="100" />
            <el-table-column prop="matchCount" label="匹配" width="80" />
            <el-table-column prop="mismatchCount" label="差异" width="80">
              <template #default="{ row }">
                <span :style="{ color: row.mismatchCount > 0 ? '#FF3B30' : '#34C759' }">
                  {{ row.mismatchCount }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '完成' ? 'success' : 'warning'" size="small" round>
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'


// 统计卡片数据
const statsData = ref([
  { icon: 'Money', value: '¥12,580,000', label: '总交易金额', color: 'linear-gradient(135deg, #0071E3 0%, #00A0E3 100%)' },
  { icon: 'SuccessFilled', value: '15,680', label: '成功笔数', color: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)' },
  { icon: 'WarningFilled', value: '23', label: '差异笔数', color: 'linear-gradient(135deg, #FF9500 0%, #FF9F0A 100%)' },
  { icon: 'Clock', value: '5', label: '待处理', color: 'linear-gradient(135deg, #FF3B30 0%, #FF453A 100%)' }
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
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['支付宝', '微信支付', '银联'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value',
      name: '交易笔数'
    },
    series: [
      {
        name: '支付宝',
        type: 'line',
        smooth: true,
        data: alipayData,
        itemStyle: { color: '#0071E3' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 113, 227, 0.3)' },
            { offset: 1, color: 'rgba(0, 113, 227, 0.05)' }
          ])
        }
      },
      {
        name: '微信支付',
        type: 'line',
        smooth: true,
        data: wechatData,
        itemStyle: { color: '#07C160' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(7, 193, 96, 0.3)' },
            { offset: 1, color: 'rgba(7, 193, 96, 0.05)' }
          ])
        }
      },
      {
        name: '银联',
        type: 'line',
        smooth: true,
        data: bankData,
        itemStyle: { color: '#FF9500' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 149, 0, 0.3)' },
            { offset: 1, color: 'rgba(255, 149, 0, 0.05)' }
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
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { fontSize: 12 }
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 15, name: '金额不一致', itemStyle: { color: '#FF3B30' } },
          { value: 8, name: '订单号不匹配', itemStyle: { color: '#FF9500' } },
          { value: 5, name: '重复交易', itemStyle: { color: '#FFCC00' } },
          { value: 3, name: '通道延迟', itemStyle: { color: '#34C759' } },
          { value: 2, name: '其他', itemStyle: { color: '#8E8E93' } }
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
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['支付宝', '微信支付', '银联'],
      axisLabel: { fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      name: '金额(万元)',
      axisLabel: { fontSize: 10 }
    },
    series: [
      {
        type: 'bar',
        data: [
          { value: 158, itemStyle: { color: '#0071E3' } },
          { value: 85.6, itemStyle: { color: '#07C160' } },
          { value: 235, itemStyle: { color: '#FF9500' } }
        ],
        barWidth: '50%',
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
  max-width: 1400px;
  margin: 0 auto;
}

.stat-card {
  border: none;
  border-radius: 18px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #1D1D1F;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #86868B;
  margin-top: 4px;
  font-weight: 500;
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

.chart-container {
  height: 360px;
  width: 100%;
}

.chart-container-small {
  height: 280px;
  width: 100%;
}
</style>
