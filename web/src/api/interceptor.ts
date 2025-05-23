import { useUserStore } from '@/store'
import { getToken } from '@/utils/auth'
import { Message, Modal } from '@arco-design/web-vue'
import axios from 'axios'

export interface HttpResponse<T = unknown> {
  status: number
  msg: string
  code: number
  data: T
}

if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL
}

axios.interceptors.request.use(
  (config: any) => {
    // let each request carry token
    // this example using the JWT token
    // Authorization is a custom headers key
    // please modify it according to the actual situation
    const token = getToken()
    if (token) {
      if (!config.headers) {
        config.headers = {}
      }
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    // do something
    return Promise.reject(error)
  }
)
// add response interceptors
axios.interceptors.response.use(
  (response: any) => {
    const res = response.data
    // if the custom code is not 20000, it is judged as an error.
    console.log(response.status)
    if (res.code !== 0) {
      Message.error({
        content: res.msg || 'Error',
        duration: 5 * 1000,
      })
      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if ([401].includes(response.status) && response.config.url !== '/api/user/current') {
        Modal.error({
          title: '登录失效',
          content: '登陆信息已经过期失效、请重新登录',
          okText: '重新登录',
          async onOk() {
            const userStore = useUserStore()

            await userStore.logout()
            window.location.reload()
          },
        })
      }
      return Promise.reject(new Error(res.msg || 'Error'))
    }
    return res
  },
  (error) => {
    Message.error({
      content: error.msg || 'Request Error',
      duration: 5 * 1000,
    })
    return Promise.reject(error)
  }
)
