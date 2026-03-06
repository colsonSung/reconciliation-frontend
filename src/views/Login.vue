<template>
  <div class="login-container">
    <div class="login-background">
      <div class="bg-shape bg-shape-1"></div>
      <div class="bg-shape bg-shape-2"></div>
      <div class="bg-shape bg-shape-3"></div>
    </div>
    <div class="login-content">
      <div class="login-branding">
        <div class="branding-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" stroke-width="2"/>
            <path d="M2 10H22" stroke="currentColor" stroke-width="2"/>
            <path d="M6 14H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h1 class="branding-title">财务对账</h1>
        <p class="branding-subtitle">Reconciliation Pro</p>
      </div>
      <el-card shadow="never" class="login-card">
        <div class="login-header">
          <h2>欢迎回来</h2>
          <p class="login-subtitle">登录您的账户继续</p>
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
          <div class="login-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <a href="#" class="forgot-link">忘记密码？</a>
          </div>
          <el-form-item>
            <el-button 
              type="primary" 
              class="login-btn"
              @click="handleLogin" 
              :loading="loading"
            >
              登 录
            </el-button>
          </el-form-item>
        </el-form>
        <div class="login-footer">
          <span class="footer-text">© 2026 Reconciliation Pro. All rights reserved.</span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const rememberMe = ref(false)

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
    // 模拟登录 - 接受任意用户名密码
    localStorage.setItem('username', form.username); localStorage.setItem('token', 'demo-token')
    ElMessage.success('登录成功')
    router.push('/')
    loading.value = false
  }, 800)
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0A0E14 0%, #1A2332 100%);
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
  filter: blur(100px);
  opacity: 0.4;
}

.bg-shape-1 {
  width: 600px;
  height: 600px;
  background: #635BFF;
  top: -250px;
  right: -150px;
  animation: float 20s ease-in-out infinite;
}

.bg-shape-2 {
  width: 500px;
  height: 500px;
  background: #32D583;
  bottom: -200px;
  left: -150px;
  animation: float 25s ease-in-out infinite reverse;
}

.bg-shape-3 {
  width: 400px;
  height: 400px;
  background: #00D4FF;
  top: 40%;
  left: 20%;
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

.login-content {
  display: flex;
  align-items: center;
  gap: 80px;
  z-index: 1;
}

.login-branding {
  text-align: center;
  color: #fff;
}

.branding-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #635BFF 0%, #8B83FF 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 20px 40px rgba(99, 91, 255, 0.4);
}

.branding-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -1px;
}

.branding-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.login-card {
  width: 440px;
  padding: 40px;
  border: none;
  border-radius: 20px;
  background: #FFFFFF;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1A1F36;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #697386;
  margin: 0;
}

.login-card :deep(.el-form-item__label) {
  font-weight: 600;
  color: #1A1F36;
  padding-bottom: 8px;
}

.login-card :deep(.el-input__wrapper) {
  padding: 8px 12px;
  border-radius: 10px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.forgot-link {
  font-size: 14px;
  color: #635BFF;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  background: linear-gradient(135deg, #635BFF 0%, #8B83FF 100%) !important;
  border: none !important;
  box-shadow: 0 8px 20px rgba(99, 91, 255, 0.3);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(99, 91, 255, 0.4);
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #EDF2F7;
}

.footer-text {
  font-size: 12px;
  color: #9DA3AF;
}
</style>
