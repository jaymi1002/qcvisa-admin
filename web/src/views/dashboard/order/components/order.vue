<template>
    <a-form ref="formRef" layout="vertical" :model="formData">
      <a-space direction="vertical" :size="16">
        <a-card class="general-card">
          <template #title>
            {{ isView ? '订单查看' : '订单修改'}}
          </template>
          <a-row :gutter="80">
            <a-col :span="8">
              <a-form-item label="订单编码" field="orderCode" required>
                <a-input readonly v-model="formData.orderCode"></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="订单标题" field="title" required>
                <a-input :readonly="isView" v-model="formData.title"></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="登记日期" field="registrationDate" required>
                <a-date-picker :readonly="isView" value-format="timestamp" style="width: 100%;" v-model="formData.registrationDate"/>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="客户名称" field="customer" required>
                <a-input :readonly="isView" v-model="formData.customer"></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="办理国家" field="country" required>
                <a-input :readonly="isView" v-model="formData.country"></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="办理类型" field="type" required>
                <a-input :readonly="isView" v-model="formData.type"></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="签单金额" field="orderMoney" required>
                <a-input-number :readonly="isView" v-model="formData.orderMoney" :precision="0"></a-input-number>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="到账金额" field="receivedMoney" required>
                <a-input :readonly="isView" v-model="formData.receivedMoney" :precision="0"></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="咨询老师" field="creator">
                {{formData.creator}}
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="办理状态" field="creator">
                 未办理
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="操作费" field="operateMoney" required>
                <a-input :readonly="isView" v-model="formData.operateMoney" :precision="0"></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="登记月份">
                <a-month-picker :readonly="isView" value-format="timestamp" disabled v-model="formData.registrationDate" style="width: 100%;"/>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="备注">
                <a-textarea :readonly="isView" v-model="formData.comment" :precision="0"></a-textarea>
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>
      </a-space>
      <!-- <div class="actions">
        <a-space>
          <a-button  type="primary" @click="onEditClick" v-if="isView">
            修改
          </a-button>
          <a-button v-else type="primary" :loading="loading" @click="onSubmitClick">
            提交
          </a-button>
        </a-space>
      </div> -->
    </a-form>
</template>

<script lang="ts" setup>
import { ref, watch} from 'vue'
import { FormInstance } from '@arco-design/web-vue/es/form'
import useLoading from '@/hooks/loading'
import { useUserStore } from '@/store'
import { getNewOrderCode, createOrder } from '@/api/dashboard'
import type { RouteMeta } from 'vue-router'
import { RouteRecordRaw, useRoute, useRouter } from 'vue-router'

const props = defineProps({
  orderData: {
    type: Object,
    default() {
      return {}
    },
  },
  isView:{
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: ''
  },
  scene:{
    type: String,
    default: 'edit', // create , edit, preview
  }
});

const router = useRouter()
const route = useRoute()
const userStore = useUserStore();
const formData = ref<any>({
  creator: userStore.username,
  orderCode: '',
});

if(props.scene === 'create'){
    getNewOrderCode().then(({data}) => {
      formData.value.orderCode = data;
  })
}


watch(() => props.orderData, () => {
  formData.value = {
    ...formData.value,
    ...props.orderData
  }
}, { immediate: true, deep: true})



const formRef = ref<FormInstance>()

defineExpose({
  validate: () => {
    return formRef.value?.validate();
  },
  getFormData: () => {
    return formData.value;
  }
})
</script>

<script lang="ts">
export default {
  name: 'Order',
}
</script>

<style scoped lang="less">
.container {
  padding: 0 20px 40px 20px;
  overflow: hidden;
}

.actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 60px;
  padding: 14px 20px 14px 0;
  background: var(--color-bg-2);
  text-align: right;
}
</style>
