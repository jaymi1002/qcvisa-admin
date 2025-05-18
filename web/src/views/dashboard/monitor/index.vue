<template>
  <div class="container">
    <Breadcrumb :items="['menu.dashboard', 'menu.dashboard.monitor']" />
    <a-card style="margin-bottom: 16px;">
      <a-month-picker :defaultValue="defaultValue" value-format="timestamp" style="width: 200px;" @change="valueChange"/>
    </a-card>
    <a-row class="grid-demo" :gutter="24">
      <a-col :span="12">
          <a-card>
            <a-table stripe :data="moneyRankList" :pagination="true" :bordered="false"  size="small">
              <template #columns>
                <a-table-column ellipsis tooltip title="姓名" data-index="_id">
                  <template #cell="scopeData">
                    {{ scopeData.rowIndex + 1 }}
                  </template>
                </a-table-column>
                <a-table-column ellipsis tooltip title="姓名" data-index="_id"></a-table-column>
                <a-table-column ellipsis tooltip title="签单金额" data-index="orderMoney"></a-table-column>
                <a-table-column ellipsis tooltip title="到账金额" data-index="receivedMoney"></a-table-column>
              </template>
            </a-table>
          </a-card>
      </a-col>
      <a-col :span="12">
          <a-card>
            <a-table stripe :data="countRankList" :pagination="true" :bordered="false"  size="small">
              <template #columns>
                <a-table-column ellipsis tooltip title="姓名" data-index="_id">
                  <template #cell="scopeData">
                    {{ scopeData.rowIndex + 1 }}
                  </template>
                </a-table-column>
                <a-table-column ellipsis tooltip title="姓名" data-index="_id"></a-table-column>
                <a-table-column ellipsis tooltip title="认领单数" data-index="recipientCount"></a-table-column>
                <a-table-column ellipsis tooltip title="完成单数" data-index="completedCount"></a-table-column>
              </template>
            </a-table>
          </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
// import ChatPanel from './components/chat-panel.vue'
// import Studio from './components/studio.vue'
// import DataStatistic from './components/data-statistic.vue'
// import StudioStatus from './components/studio-status.vue'
// import QuickOperation from './components/quick-operation.vue'
// import StudioInformation from './components/studio-information.vue'
import { getRankMoney,getRankCount } from '@/api/dashboard'
import moment from 'moment';

const currentDate = moment(); // 获取当前日期
const defaultValue = currentDate.startOf('month').format('YYYY-MM');;
const moneyRankList = ref([]);
const countRankList = ref([]);

const valueChange = (date) => {
  getRankMoney({
    date
  }).then(({data}) => {
    moneyRankList.value = data;
  });
  getRankCount({
    date
  }).then(({data}) => {
    countRankList.value = data;
  })
}
valueChange(moment(defaultValue).valueOf());
</script>

<script lang="ts">
export default {
  name: 'Monitor',
}
</script>

<style scoped lang="less">
.container {
  padding: 0 20px 20px 20px;
}

.layout {
  display: flex;

  &-left-side {
    flex-basis: 300px;
  }

  &-content {
    flex: 1;
    padding: 0 16px;
  }

  &-right-side {
    flex-basis: 280px;
  }
}
</style>

<style lang="less" scoped>
// responsive
@media (max-width: @screen-lg) {
  .layout {
    flex-wrap: wrap;
    &-left-side {
      flex: 1;
      flex-basis: 100%;
      margin-bottom: 16px;
    }

    &-content {
      flex: none;
      flex-basis: 100%;
      padding: 0;
      order: -1;
      margin-bottom: 16px;
    }

    &-right-side {
      flex-basis: 100%;
    }
  }
}
</style>
