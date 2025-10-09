import { createRouter, createWebHashHistory } from 'vue-router';

import Search from './components/Search.js'
import Add from './components/Add.js'
import Details from './components/Details.js'
import Login from './components/Login.js'

const routes = [
  { path: '/', component: Search },
  { path: '/add', component: Add },
  { path: '/details/:id', component: Details },
  { path: '/login', component: Login }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// router.beforeEach(async (to, from, next) => {
//   const { data: { user } } = await supabase.auth.getUser()

//   if (to.path !== '/login' && !user) {
//     next('/login')
//   } else {
//     next()
//   }
// })

export { router }