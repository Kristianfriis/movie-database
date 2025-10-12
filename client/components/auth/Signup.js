import { supabase } from '../../services/supabase.js'

export default {
  name: 'Signup',
  data() {
    return {
      email: '',
      password: '',
      error: null,
      success: null
    }
  },
  methods: {
    async signup() {
      const { error } = await supabase.auth.signUp({
        email: this.email,
        password: this.password
      })
      if (error) {
        this.error = error.message
        this.success = null
      } else {
        this.success = 'Check your email to confirm your account.'
        this.error = null
      }
    },
    goBack() {
      window.history.back();
    }
  },
  template: /*html*/`
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-back-button defaultHref="/" @click="goBack"></ion-back-button>
          </ion-buttons>
          <ion-title>Sign up</ion-title>
        </ion-toolbar>
      </ion-header>
        <ion-card>
          <ion-card-content>
            <ion-input label="Email" v-model="email" type="email" />
            <ion-input label="Password" v-model="password" type="password" />
            <ion-button expand="block" @click="signup">Create Account</ion-button>
            <ion-text color="success" v-if="success">{{ success }}</ion-text>
            <ion-text color="danger" v-if="error">{{ error }}</ion-text>
          </ion-card-content>
        </ion-card>
    </ion-page>
  `
}
