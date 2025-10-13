import { loadingController, toastController } from '@ionic/core';
import { UserService } from "../../services/user-service.js";
import { MovieService } from '../../services/movie-service.js';

export default {
    template: /*html*/`
    <ion-page>
    <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
                  <ion-back-button defaultHref="/" @click="goBack"></ion-back-button>
          </ion-buttons>
          <ion-title>Add User</ion-title>
        </ion-toolbar>
      </ion-header>

    <ion-list>
        <ion-item>
          <ion-input v-model="searchQuery" @input="search" placeholder="Search email or name..."></ion-input>
        </ion-item>
        <ion-item v-for="user in searched" :key="user.id" button detail="true" @click="addUser(user.id)">
            {{ user.name }}
        </ion-item>
      </ion-list>
    </ion-page>

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
              <ion-select v-model="chosenUser.role" placeholder="User Role" ref="select">
                <ion-select-option value="maintainer">Maintainer</ion-select-option>
                <ion-select-option value="reader">Reader</ion-select-option>
              </ion-select>
            </ion-item>
      </ion-list>

            <ion-button expand="block" @click="addUserToCollection">
              Add
            </ion-button>
      </ion-modal>
    `,
    data() {
        return {
            collectionId: null,
            users: [],
            searched: [],
            searchQuery: '',
            chosenUser: {
                id: '',
                name: '',
                email: '',
                role: ''
            },
            showModal: false
        }
    },
    async mounted() {
        this.$refs.select.addEventListener('ionChange', (e) => {
            this.chosenUser.role = e.detail.value;
        });
        const loading = await loadingController.create({
            message: 'Loading users...',
        });

        loading.present();

        const collectionId = this.$route.params.collectionId;
        this.collectionId = collectionId;

        var users = await UserService.getAllUsers();
        this.users = users;
        this.searched = users;

        loading.dismiss();
    },
    methods: {
        openModal() {
            this.showModal = true;
        },
        closeModal() {
            this.chosenUser = {
                id: '',
                name: '',
                email: '',
                role: ''
            };

            this.showModal = false;
        },
        goBack() {
            this.$router.back(); 
        },
        search() {
            const q = (this.searchQuery || '').toLowerCase();
            this.searched = this.users.filter(m =>
                (m.email || '').toLowerCase().includes(q) ||
                (m.name || '').toLowerCase().includes(q)
            );
        },
        addUser(userId) {
            const user = this.users.find(u => u.id === userId);
            if (!user) {
                return;
            }
            this.chosenUser = user;
            this.openModal();
        },
        async addUserToCollection() {
            if (!this.collectionId) {
                return;
            }

            if (!this.chosenUser.id) {
                return;
            }

            if (!this.chosenUser.role || this.chosenUser.role === '') {
                const toast = await toastController.create({
                    message: 'Please select a role.',
                    duration: 1500,
                    swipeGesture: "vertical",
                    color: "danger"
                });

                await toast.present();
                return;
            }

            const loading = await loadingController.create({
                message: `Adding user ${this.chosenUser.name}...`,
            });

            loading.present();

            var response = await MovieService.addUserToCollection(this.collectionId, this.chosenUser.id, this.chosenUser.role);

            if (response.error) {
                const toast = await toastController.create({
                    message: 'Something went wrong.',
                    duration: 1500,
                    swipeGesture: "vertical",
                    color: "danger"
                });

                await toast.present();
                return;
            }

            loading.dismiss();

            const toast = await toastController.create({
                message: `User ${this.chosenUser.name} added to collection.`,
                duration: 1500,
                swipeGesture: "vertical",
                color: "success"
            });

            await toast.present();

            this.closeModal();
        }
    }
}