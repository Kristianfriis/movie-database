import { supabase } from '../services/supabase.js'

export default {
  name: 'ResetPassword',
  data() {
    return {
      email: '',
      error: null,
      success: null
    }
  },
  methods: {
    async reset() {
      const { error } = await supabase.auth.resetPasswordForEmail(this.email)
      if (error) {
        this.error = error.message
        this.success = null
      } else {
        this.success = 'Password reset link sent. Check your inbox.'
        this.error = null
      }
    }
  },
  template: `
    <ion-page>
      <ion-content class="ion-padding">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Reset Password</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-input label="Email" v-model="email" type="email" />
            <ion-button expand="block" @click="reset">Send Reset Link</ion-button>
            <ion-text color="success" v-if="success">{{ success }}</ion-text>
            <ion-text color="danger" v-if="error">{{ error }}</ion-text>
          </ion-card-content>
        </ion-card>
      </ion-content>
    </ion-page>
  `
}
