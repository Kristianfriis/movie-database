import { MovieService } from "../../services/movie-service.js";
import { loadingController } from '@ionic/core';
// import { addOutline } from 'ionicons/icons'

export default {
    template: /*html*/`
     <ion-page>
      <ion-button expand="block" @click="openModal" v-if="collections.length === 0 && !loading">
        Add New Collection
      </ion-button>

      <ion-list v-else>
        <ion-item v-for="collection in collections" :key="collection.id">
          <ion-label>
            <h2>{{ collection.name }}</h2>
            <p>Role: {{ collection.role }}</p>
            <p>Members: {{ collection.members.length }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end" v-if="collections.length !== 0">
        <ion-fab-button @click="openModal">
          <ion-icon icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <ion-modal :is-open="showModal" @didDismiss="closeModal">
          <ion-header>
            <ion-toolbar>
              <ion-title>New Collection</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="closeModal">Close</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>

          <ion-content class="ion-padding">
            <ion-item>
              <ion-label position="floating">Collection Name</ion-label>
              <ion-input v-model="newCollectionName" />
            </ion-item>

            <ion-button expand="block" @click="createCollection">
              Create
            </ion-button>
      </ion-modal>
    </ion-page>
  `,
    setup() { },
    data() {
        return { collections: [], showModal: false, newCollectionName: '', loading: false }
    },
    async mounted() {
        this.loading = true;
        const loading = await loadingController.create({
            message: 'Loading collections...',
        });

        loading.present();

        this.collections = await MovieService.getAllCollections();

        this.loading = false;

        loading.dismiss();
    },
    methods: {
        openModal() {
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
        },
        async createCollection() {
            const loading = await loadingController.create({
                message: `Creating collection ${this.newCollectionName}...`,
            });

            loading.present();

            if (!this.newCollectionName) {
                alert('Please enter a collection name');
                return;
            }
            var user = localStorage.getItem('user');
            if (!user) {
                alert('Please log in to create a collection');
                return;
            }
            user = JSON.parse(user);
            if (!user || !user.id) {
                alert('Please log in to create a collection');
                return;
            }

            await MovieService.createCollection(this.newCollectionName);
            this.newCollectionName = '';
            this.showModal = false;
            this.collections = await MovieService.getAllCollections();

            loading.dismiss();
        }
    }
}