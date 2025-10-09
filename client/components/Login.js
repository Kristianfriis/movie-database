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
    async login() {
      const { error } = await supabase.auth.signInWithPassword({
        email: this.email,
        password: this.password
      })
      if (error) {
        this.error = error.message
      } else {
        this.$router.push('/')
      }
    }
  },
  template: `
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
          </ion-card-content>
        </ion-card>
      </ion-content>
    </ion-page>
  `
}
