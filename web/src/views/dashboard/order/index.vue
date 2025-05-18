<template>
  <div class="container">
    <Breadcrumb :items="['menu.dashboard', isView ? '订单查看' : '订单修改']" />
    <Order ref="formRef" :order-data="orderData" :is-view="isView"></Order>
    <div class="actions">
        <a-space>
          <a-button type="primary" @click="onEditClick" v-if="isView && hasAuth">
            修改
          </a-button>
          <a-button v-else-if="hasAuth" type="primary" :loading="loading" @click="onSubmitClick">
            提交
          </a-button>
        </a-space>
      </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { FormInstance } from '@arco-design/web-vue/es/form'
import useLoading from '@/hooks/loading'
import { useUserStore } from '@/store'
import { updateOrder, getOrder} from '@/api/dashboard'
import type { RouteMeta } from 'vue-router'
import { RouteRecordRaw, useRoute, useRouter } from 'vue-router'
import Order from './components/order.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore();
const orderData = ref({
  creator: userStore.username,
  orderCode: '',
});


const hasAuth = computed(() => {
  return orderData.value.creator === userStore.username;
})

const getOrderData = async () => {
  const { id } = route.query;
  if(id){
    getOrder(id).then(({data}) => {
      orderData.value = data;
    })
  }
}
getOrderData();

const isView = computed(() => {
  return route.query.isView === 'true';
});

const formRef = ref<FormInstance>()
const { loading, setLoading } = useLoading()
const onSubmitClick = async () => {
  const res = await formRef.value?.validate()
  if (!res) {
    setLoading(true)
  }
  try {
    const { id } = route.query;
    const params = formRef.value.getFormData();
    await updateOrder(id, params);
    router.replace({
      query: {
        ...route.query,
        isView: 'true'
      }
    })

  } finally {
    setLoading(false)
  } 
}
const onEditClick = () => {
  router.replace({
    query: {
      ...route.query,
        isView: 'false'
    }
  })
}
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
