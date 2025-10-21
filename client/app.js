import { createApp } from 'vue'
import { IonicVue } from "@ionic/ionicvue"
import { menuController } from "@ionic/core"
import { router } from './router.js'
import { supabase } from './services/supabase.js'
import { UserService } from './services/user-service.js'
import { ProfileService } from './services/profile-service.js'

import { store } from './services/state.js'

const App = {
    data() {
        return {
            store,
            version : window.appConfig.version
        }
    },
    created() {
      ProfileService.getLanguage();
    },
    methods: {
        back() {
            history.back();
            this.store.showBackButton = false;
        },
        navigate(path) {
            router.push(path);
            menuController.close();
        },
        async logout() {
            // this.store.user = null;
            // this.store.isAuthenticated = false;
            await supabase.auth.signOut()
            await UserService.clearCache();
            router.push('/login');
            menuController.close();
        }
    },
    template:/*html*/`
        <ion-app>
          <!-- Side Menu -->
          <ion-menu content-id="main-content" swipeGesture="true">
            <ion-header>
              <ion-toolbar>
                <ion-title>Menu</ion-title>
              </ion-toolbar>
            </ion-header>
            <ion-content>
              <ion-list>
                <ion-item button @click="navigate('/')" lines="full">
                    <ion-icon name="list-circle" slot="start"></ion-icon>
                    <ion-label>Collections</ion-label>
                </ion-item>
                <ion-item button @click="navigate('/profile')" lines="full">
                <ion-icon name="person-circle" slot="start"></ion-icon>
                    <ion-label>Profile</ion-label>
                    </ion-item>
                <ion-item button @click="logout" lines="full">
                    <ion-icon name="log-out" slot="start"></ion-icon>
                    <ion-label>Logout</ion-label>
                </ion-item>
              </ion-list>
            </ion-content>
            <ion-footer>
            <ion-note class="ion-padding">version {{ version }}</ion-note>
            </ion-footer>
          </ion-menu>

          <!-- Main Content -->
        <div class="ion-page" id="main-content">
          <router-view></router-view>
        </div>
        </ion-app>
      `
}

createApp(App).use(IonicVue).use(router).mount('#app')