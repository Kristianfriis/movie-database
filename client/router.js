import { createRouter, createWebHashHistory } from 'vue-router';
import { supabase } from './services/supabase.js'

import Search from './components/Search.js'
import Details from './components/Details.js'
import Login from './components/auth/Login.js'
import Signup from './components/auth/Signup.js'
import ResetPassword from './components/auth/ResetPassword.js'
import Confirm from './components/auth/Confirm.js'
import Profile from './components/auth/Profile.js'
import AllCollectionsPage from './components/collections/AllCollectionsPage.js';
import AddUserToCollection from './components/collections/AddUserToCollection.js';
import Settings from './components/collections/settings.js';
import moviesSelector from './components/collections/moviesSelector.js';

const authRoutes = [
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/reset', component: ResetPassword },
  { path: '/confirm', component: Confirm },
]

const profileRoutes = [
  { path: '/profile', component: Profile },
  { path: '/profile/:email', component: Profile },
]

const collectionRoutes = [
  { path: '/search/:collectionId', component: Search },
  { path: '/search/:collectionId/:fromDetailsRoute', component: Search },
  { path: '/details/:id/:collectionId', component: Details },
  // { path: '/details/:id/', component: Details },
  { path: '/', component: AllCollectionsPage },
  { path: '/add-user-to-collection/:collectionId', component: AddUserToCollection },
  { path: '/settings/:collectionId', component: Settings },
  { path: '/movies-selector/:collectionId', component: moviesSelector },
]

const utilityRoutes = [
]

const routes = [
  ...authRoutes,
  ...profileRoutes,
  ...collectionRoutes,
  ...utilityRoutes,
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { data: { user } } = await supabase.auth.getUser()

  // All auth routes are public
  const publicPaths = authRoutes.map(r => r.path)

  const alwaysPublic = []
  const allowedPaths = [...publicPaths, ...alwaysPublic]

  const isPublic = allowedPaths.some(path => to.path.startsWith(path))

  if (!user && !isPublic) {
    next('/login')
  } else {
    next()
  }
})

export { router }