import { supabase } from '../../services/supabase.js'
import { UserService } from '../../services/user-service.js'
import { loadingController } from '@ionic/core';

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      error: null
    }
  },
  methods: {
    navigate(path) {
     this.$router.push(path)
    },
    async login() {
      const loading = await loadingController.create({
        message: 'Logging in...',
      });

      loading.present();

      const { error } = await supabase.auth.signInWithPassword({
        email: this.email,
        password: this.password
      })
      if (error) {
        this.error = error.message
      } else {
        const user = await UserService.getUser();
        if (user === null) {
          this.$router.push('/profile' + (this.email ? '/' + this.email : ''));
        } else {
          this.$router.push('/')
        }
      }

      loading.dismiss();
    }
  },
  template: /*html*/`
  <ion-page>
  <ion-content class="ion-padding">
    <ion-card>
      <ion-card-header>
        <ion-card-title>Login</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-input label="Email" v-model="email" type="email" />
        <ion-input label="Password" v-model="password" type="password" />
        <ion-button expand="block" @click="login">Login</ion-button>

        <ion-text color="danger" v-if="error">{{ error }}</ion-text>

        <div class="ion-margin-top">
          <ion-text>
            Don't have an account?
            <a @click="navigate('/signup')">Sign up</a>
          </ion-text>
          <br />
          <ion-text>
            Forgot your password?
            <a @click="navigate('/reset')">Reset it</a>
          </ion-text>
        </div>
      </ion-card-content>
    </ion-card>
  </ion-content>
</ion-page>

  `
}
