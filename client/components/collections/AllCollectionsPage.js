import { MovieService } from "../../services/movie-service.js";
import { loadingController } from '@ionic/core';
import { store } from "../../services/state.js";

export default {
  template: /*html*/`
     <ion-page>
       <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
          <ion-title>Collections</ion-title>
           <ion-buttons slot="end">
            <ion-button @click="refreshCollections">
              <ion-icon slot="icon-only" name="refresh-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content> 
      <ion-button expand="block" @click="openModal" v-if="store.collections.length === 0 && !loading">
        Add New Collection
      </ion-button>

      <ion-list v-else>
          <ion-item v-for="collection in store.collections" :key="collection.indexId" button @click="openCollection(collection.id)" detail="true">
          <ion-label>
            <h2>{{ collection.name }}</h2>
            <p>Role: {{ collection.role }}</p>
            <p>Members: {{ collection.members.length }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
      </ion-content> 

      <ion-fab slot="fixed" vertical="bottom" horizontal="end" v-if="store.collections.length !== 0">
      <ion-fab-button>
          <ion-icon name="chevron-up-circle"></ion-icon>
        </ion-fab-button>
        <ion-fab-list side="top">
          <ion-fab-button color="primary" @click="openModal">
            <ion-icon name="add-outline" ></ion-icon>
          </ion-fab-button>
        </ion-fab-list>
      </ion-fab>

      <ion-modal :is-open="showModal" @didDismiss="closeModal">
          <ion-header>
            <ion-toolbar>
              <ion-title>New movie</ion-title>
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
    return {
      showModal: false,
      newCollectionName: '',
      loading: false,
      store: store
    }
  },
  async mounted() {
    this.loading = true;
    if (store.collections === null || store.collections === undefined || store.collections.length === 0) {
      const loading = await loadingController.create({
        message: 'Loading collections...',
      });

      loading.present();

      this.collections = await MovieService.getAllCollections();
      store.collections = this.collections;
      
      loading.dismiss();
    }

    this.collections = store.collections;

    this.loading = false;
  },
  methods: {
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    openCollection(collectionId) {
      // navigate to /search/{collectionId}
      this.$router.push(`/search/${collectionId}`);
    },
    async refreshCollections() {
      const loading = await loadingController.create({
        message: 'Refreshing collections...',
      });

      loading.present();

      this.store.collections = await MovieService.getAllCollections(true);

      this.loading = false;

      loading.dismiss();
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

      var id = await MovieService.createCollection(this.newCollectionName);
      var collectionToPush = {
        indexId: this.store.collections.length,
        id: id,
        name: this.newCollectionName,
        ownerId: user.id,
        role: 'maintainer',
        members: [{ userId: user.id, name: user.name, role: 'maintainer' }]
      }
      this.store.collections.push(collectionToPush);

      this.newCollectionName = '';
      this.showModal = false;

      loading.dismiss();
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.showModal) {
      this.closeModal();
      // Prevent navigation
      next(false);
    } else {
      next();
    }
  }
}