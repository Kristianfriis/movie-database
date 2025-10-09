import { createRouter, createWebHashHistory } from 'vue-router';
import { supabase } from './services/supabase.js'

import Search from './components/Search.js'
import Add from './components/Add.js'
import Details from './components/Details.js'
import Login from './components/auth/Login.js'
import Signup from './components/auth/Signup.js'
import ResetPassword from './components/auth/ResetPassword.js'
import Confirm from './components/auth/Confirm.js'
import Profile from './components/auth/Profile.js'

const routes = [
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/reset', component: ResetPassword },
  { path: '/confirm', component: Confirm },
  { path: '/profile', component: Profile },
  { path: '/profile/:email', component: Profile },
  { path: '/', component: Search },
  { path: '/add', component: Add },
  { path: '/details/:id', component: Details },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { data: { user } } = await supabase.auth.getUser()

  if (to.path !== '/login' && !user) {
    next('/login')
  } else {
    next()
  }
})

export { router }