<template>
  <a-spin :loading="loading" style="width: 100%">
    <a-card class="general-card" :header-style="{ paddingBottom: '0px' }" :body-style="{ padding: '17px 20px 21px 20px' }">
      <template #title>
        订单创建
      </template>
      <template #extra>
        <!-- <a-link>{{ $t('workplace.viewMore') }}</a-link> -->
      </template>
      <a-space direction="vertical" :size="10" fill>
        <a-row  justify="space-between">
          <a-radio-group v-model:model-value="type" type="button" @change="typeChange">
            <a-radio value="ALL">
                全部
            </a-radio>
            <a-radio value="MY">
                我创建的
            </a-radio>
          </a-radio-group>
          <a-button type="primary" @click="create">创建</a-button>
        </a-row>
        
        <a-table :data="renderList" :pagination="true" :bordered="false"  size="small" :scroll="{ x: '140%' }">
          <template #columns>
            <a-table-column ellipsis tooltip fixed="left" title="订单编号" data-index="orderCode">
            </a-table-column>
            <a-table-column ellipsis tooltip title="标题" data-index="title"></a-table-column>
            <a-table-column ellipsis tooltip title="登记日期" data-index="registrationDate">
              <template #cell="{ record }">
                {{ moment(record.registrationDate).format('YYYY-MM-DD') }}
              </template>
            </a-table-column>
            <a-table-column ellipsis tooltip title="客户名称" data-index="customer"></a-table-column>
            <a-table-column ellipsis tooltip title="办理国家" data-index="country"></a-table-column>
            <a-table-column ellipsis tooltip title="办理类型" data-index="type"></a-table-column>
            <a-table-column ellipsis tooltip title="签单金额" data-index="orderMoney"></a-table-column>
            <a-table-column ellipsis tooltip title="到账金额" data-index="receivedMoney"></a-table-column>
            <a-table-column ellipsis tooltip title="咨询老师" data-index="creator"></a-table-column>
            <a-table-column ellipsis tooltip title="办理状态" data-index="status">
              <template #cell="{ record }">
                {{ getStatusText(record.status) }}
              </template>
            </a-table-column>
            <a-table-column ellipsis tooltip title="操作费" data-index="operateMoney"></a-table-column>
            <a-table-column ellipsis tooltip title="登记月份" data-index="registrationDate">
              <template #cell="{ record }">
                {{ moment(record.registrationDate).format('YYYY-MM') }}
              </template>
            </a-table-column>
            <a-table-column ellipsis tooltip title="备注" data-index="comment"></a-table-column>
            <a-table-column title="操作" width="220" fixed="right" data-index="operator">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="text" @click="review(record)">查看</a-button>
                  <a-button :disabled="username !== record.creator" type="text" @click="edit(record)">编辑</a-button>
                  <a-button :disabled="username !== record.creator" type="text" status="danger" @click="remove(record)" >删除</a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-space>
    </a-card>
  </a-spin>
  <a-modal v-model:visible="visible" @ok="handleOk" @cancel="handleCancel" :on-before-ok="handleOnBeforeOk" width="1000px">
    <template #title>
      创建订单
    </template>
    <Order v-if="visible" ref="orderRef" :isView="false" scene="create"></Order>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref,computed } from 'vue'
import moment from 'moment';
import useLoading from '@/hooks/loading'
import { getOrderList, createOrder, updateOrder, deleteOrder } from '@/api/dashboard'
import type { TableData } from '@arco-design/web-vue/es/table/interface'
import { Message } from '@arco-design/web-vue';
import { getStatusText } from '@/utils/const'
import type { RouteMeta } from 'vue-router'
import { RouteRecordRaw, useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store'
import Order from '../../order/components/order.vue';
import DataPanel from './data-panel.vue'

window.moment = moment;
const userStore = useUserStore()
const userInfo = computed(() => {
  return {
    username: userStore.username,
  }
});
const username = computed(() => {
  return userStore.username;
})


const router = useRouter()
const route = useRoute()
const type = ref('MY')
const { loading, setLoading } = useLoading()
const renderList = ref<TableData[]>()
const currentOrderData = ref();
const visible = ref(false);
const orderView = ref(true);
const orderRef = ref();

const fetchData = async (contentType: string) => {
  try {
    setLoading(true)
    if(contentType === 'ALL') {
      const { data } = await getOrderList();
      renderList.value = data
      console.log(renderList.value)
    }
    if(contentType === 'MY') {
      const { data } = await getOrderList({
        creator: userInfo.value.username
      });
      renderList.value = data
    }
    
  } catch (err) {
    // you can report use errorHandler or other
  } finally {
    setLoading(false)
  }
}
const typeChange = (contentType: string) => {
  fetchData(contentType)
}
fetchData(type.value);

const review = (data) => {
  router.push( {
    path: '/dashboard/order',
    query: {
      id: data.id,
      isView: 'true'
    },

  });
}
const edit = (data) => {
  router.push( {
    path: '/dashboard/order',
    query: {
      id: data.id
    }
  });
}

const remove = (data) => {
  deleteOrder(data.id).then(() => {
    fetchData(type.value);
  });
}

const create = () => {
  currentOrderData.value = {};
  visible.value = true;
  orderView.value = false;
}

const handleOk = () => {
  const formData = orderRef.value.getFormData();
  createOrder(formData).then(()=> {
    Message.success('创建成功');
    fetchData(type.value);
  });
}
const handleOnBeforeOk = async () => {
  const res = await orderRef.value?.validate();
  return !res;
}
</script>

<style scoped lang="less">
.general-card {
  min-height: 395px;
}
:deep(.arco-table-tr) {
  height: 44px;
  .arco-typography {
    margin-bottom: 0;
  }
}
.increases-cell {
  display: flex;
  align-items: center;
  span {
    margin-right: 4px;
  }
}
</style>
