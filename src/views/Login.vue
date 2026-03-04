<template>
  <div class="login-container">
    <div class="login-background">
      <div class="bg-shape bg-shape-1"></div>
      <div class="bg-shape bg-shape-2"></div>
      <div class="bg-shape bg-shape-3"></div>
    </div>
    <el-card shadow="never" class="login-card apple-card">
      <div class="login-header">
        <div class="login-logo">💰</div>
        <h2>财务对账系统</h2>
        <p class="login-subtitle">安全 · 高效 · 可靠</p>
      </div>
      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名" 
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码" 
            show-password 
            size="large"
            :prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            style="width: 100%; height: 48px; font-size: 16px; font-weight: 600;" 
            @click="handleLogin" 
            :loading="loading"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  loading.value = true
  setTimeout(() => {
    if (authStore.login(form.username, form.password)) {
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error('用户名或密码错误')
    }
    loading.value = false
  }, 500)
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F5F5F7 0%, #E8E8ED 100%);
  position: relative;
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.bg-shape-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #0071E3 0%, #00A0E3 100%);
  top: -200px;
  right: -100px;
  animation: float 20s ease-in-out infinite;
}

.bg-shape-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #34C759 0%, #30D158 100%);
  bottom: -150px;
  left: -100px;
  animation: float 25s ease-in-out infinite reverse;
}

.bg-shape-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #FF9500 0%, #FF9F0A 100%);
  top: 50%;
  left: 30%;
  animation: float 18s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(5deg);
  }
}

.login-card {
  width: 420px;
  padding: 40px;
  border: none;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  font-size: 56px;
  margin-bottom: 16px;
}

.login-card h2 {
  text-align: center;
  margin: 0 0 8px 0;
  font-size: 26px;
  font-weight: 700;
  color: #1D1D1F;
  letter-spacing: -0.5px;
}

.login-subtitle {
  text-align: center;
  margin: 0;
  color: #86868B;
  font-size: 14px;
}

.login-card :deep(.el-form-item__label) {
  font-weight: 500;
  color: #5E5E66;
  padding-bottom: 6px;
}

.login-card :deep(.el-input__wrapper) {
  padding: 8px 12px;
}
</style>
