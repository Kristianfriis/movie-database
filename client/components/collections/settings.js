import { MovieService } from "../../services/movie-service.js";
import { loadingController, toastController } from '@ionic/core';

export default {
  template: /*html*/`
     <ion-page>
    <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
                <ion-back-button defaultHref="/" @click="goBack"></ion-back-button>
          </ion-buttons>
          <ion-title v-if="collectionInfo">Settings - {{ collectionInfo.name }}</ion-title>
          <ion-title v-else>Settings</ion-title>
            <ion-buttons slot="end">
            <ion-button @click="refreshCollectionInfo">
              <ion-icon slot="icon-only" name="refresh-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Users</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list v-if="collectionInfo && collectionInfo.users" ref="options">
            <ion-item-sliding v-for="user in collectionInfo.users" :key="user.id">
                <ion-item>
                  <ion-label>{{ user.name }} - {{ user.currentRole }}</ion-label>
                </ion-item>
                
                 <ion-item-options>
                    <ion-item-option @click="openChangeRoleModal(user.id)" color="primary">Role</ion-item-option>
                    <ion-item-option color="danger" @click="presentRemoveUser(user.id)">Remove</ion-item-option>
                </ion-item-options>
            </ion-item-sliding>
          </ion-list>
        </ion-card-content>
      </ion-card>
      </ion-page>
      <ion-alert header="Are you sure?" ref="alert"></ion-alert>

        <ion-modal :is-open="showModal" @didDismiss="closeModal">
          <ion-header>
            <ion-toolbar>
              <ion-title>Add {{ chosenUser.name }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="closeModal">Close</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>

          <ion-content class="ion-padding">
            <ion-list>
              <ion-item>
                <ion-select v-model="chosenUser.currentRole" placeholder="New User Role" ref="select">
                  <ion-select-option value="maintainer">Maintainer</ion-select-option>
                  <ion-select-option value="reader">Reader</ion-select-option>
                </ion-select>
              </ion-item>
          </ion-list>

            <ion-button expand="block" @click="changeRoleAsync">
              Change Role
            </ion-button>
        </ion-modal>
    `,
  data() {
    return {
      collectionId: null,
      collectionInfo: null,
      alert: null,
      chosenUser: {
        id: '',
        name: '',
        currentRole: ''
      },
      showModal: false
    }
  },
  async mounted() {
    const collectionId = this.$route.params.collectionId;
    this.collectionId = collectionId;

    this.alert = this.$refs.alert;

    this.collectionInfo = await MovieService.getCollectionInfo(collectionId);
  },
  methods: {
    closeModal() {
      this.chosenUser = {
        id: '',
        name: '',
        email: '',
        role: ''
      };

      this.showModal = false;
      this.$refs.options.closeSlidingItems();
    },
    goBack() {
      this.$router.back();
    },
    async refreshCollectionInfo() {
      const loading = await loadingController.create({
        message: 'getting users...',
      });

      loading.present();


      this.collectionInfo = await MovieService.getCollectionInfo(this.collectionId, true);

      loading.dismiss();
    },
    async openChangeRoleModal(userId) {

      var user = this.collectionInfo.users.find(u => u.id === userId);
      if (!user) {
        return;
      }
      
      this.chosenUser.id = userId;
      this.chosenUser.name = user.name;
      this.chosenUser.currentRole = user.currentRole.toLowerCase();

      this.showModal = true;
    },
    async changeRoleAsync() {
      const loading = await loadingController.create({
        message: 'changing user role...',
      });

      loading.present();

      var response = await MovieService.changeRoleForUser(this.collectionId, this.chosenUser.userId, this.chosenUser.currentRole);

      loading.dismiss();

      if (!response.success) {
        const toast = await toastController.create({
          message: response.error,
          duration: 1500,
          swipeGesture: "vertical",
          color: "danger"
        });

        await toast.present();
        return;
      }

      await this.refreshCollectionInfo();

      const toast = await toastController.create({
        message: 'User role changed.',
        duration: 1500,
        swipeGesture: "vertical",
        color: "success"
      });

      await toast.present();

      this.$refs.options.closeSlidingItems();
    },
    async presentRemoveUser(userId) {

      this.alert.present();

      this.alert.buttons = [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: async () => {
            await this.removeUser(false)
          },
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: async () => {
            await this.removeUser(true, userId)
          },
        },
      ];
    },
    async removeUser(value, userId = null) {

      if (value) {
        const loading = await loadingController.create({
          message: 'removing user from collection...',
        });

        loading.present();

        var response = await MovieService.removeUserFromCollection(this.collectionId, userId);

        loading.dismiss();

        if (!response.success) {
          const toast = await toastController.create({
            message: response.error,
            duration: 1500,
            swipeGesture: "vertical",
            color: "danger"
          });

          await toast.present();
          return;
        }

        await this.refreshCollectionInfo();

        const toast = await toastController.create({
          message: 'User removed from collection.',
          duration: 1500,
          swipeGesture: "vertical",
          color: "success"
        });

        await toast.present();
      }

      this.$refs.options.closeSlidingItems();
    }
  }
}