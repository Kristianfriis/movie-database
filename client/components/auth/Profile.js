import { UserService } from '../../services/user-service.js'
import { User } from '../../services/dtos/user.js'
import { ref } from 'vue';
import { loadingController, toastController } from '@ionic/core';

export default {
  name: 'Signup',
  data() {
    return {
      email: '',
      password: '',
      error: null,
      success: null,
      form: ref({
        id: null,
        name: '',
        email: '',
        avatarUrl: '',
        createdAt: null
      }),
      createProfile: false
    }
  },
  methods: {
    async saveProfile() {
      const loading = await loadingController.create({
        message: 'Saving profile...',
      });

      loading.present();

      var user = new User();
      user.name = this.form.name;
      user.email = this.form.email;

      await UserService.createUser(this.form);

      loading.dismiss();
      this.$router.push('/');
    },
    async updateProflile() {
      const loading = await loadingController.create({
        message: 'Updating profile...',
      });

      loading.present();

      var user = new User();
      user.name = this.form.name;
      user.email = this.form.email;

      await UserService.updateUser(this.form);

      loading.dismiss();
      const toast = await toastController.create({
        message: 'User profile updated.',
        duration: 1500,
        swipeGesture: "vertical",
        color: "success"
      });

      await toast.present();
    },
  },
  async created() {
    const loading = await loadingController.create({
      message: 'Getting profile...',
    });

    loading.present();

    const email = this.$route.params.email;
    if (email) {
      this.form.email = email;
      this.createProfile = true;
    } else {
      UserService.getUser().then(user => {
        if (user) {
          this.form.name = user.name;
          this.form.email = user.email;
          this.form.avatarUrl = user.avatarUrl;
          this.form.createdAt = user.createdAt;
        }
      });
    }

    loading.dismiss();
  },
  template: /*html*/`
    <ion-page>
          <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
          <ion-title>Profile</ion-title>
        </ion-toolbar>
      </ion-header>
<ion-content> 
          <ion-card>
            <ion-card-header>
                <ion-card-title v-if="createProfile">Create Profile</ion-card-title>
                <ion-card-title v-else>Edit Profile</ion-card-title>
            </ion-card-header>
            <ion-card-content>
                <ion-item>
                  <ion-label position="stacked">Name</ion-label>
                  <ion-input v-model="form.name" />
                </ion-item>
                <ion-item>
                  <ion-label position="stacked">Email</ion-label>
                  <ion-input v-model="form.email" type="email" />
                </ion-item>
                <ion-button expand="block" @click="saveProfile" v-if="createProfile">Save</ion-button>
                <ion-button expand="block" @click="updateProflile" v-else>Update</ion-button>
            </ion-card-content>
          </ion-card>
          </ion-content> 
    </ion-page>
    `
}
// <ion-item>
//   <ion-label position="stacked">Avatar URL</ion-label>
//   <ion-input v-model="form.avatarUrl" />
// </ion-item>

// <ion-item>
//   <ion-label position="stacked">Created At</ion-label>
//   <ion-datetime v-model="form.createdAt" presentation="date" />
// </ion-item>
