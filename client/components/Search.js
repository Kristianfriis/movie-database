import { MovieService } from '../services/movie-service.js'
import { loadingController } from '@ionic/core';

export default {
  template: /*html*/`
  <ion-page>
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
      <ion-fab-button @click="openModal">
        <ion-icon icon="add-outline"></ion-icon>
      </ion-fab-button>
    </ion-fab>

      <ion-list>
        <ion-item>
          <ion-input v-model="query" @input="search" placeholder="Search..."></ion-input>
        </ion-item>
        <ion-item v-for="movie in results" :key="movie.id" button>
          <router-link :to="'/details/' + movie.id">
            {{ movie.title }} - {{ movie.format }}
          </router-link>
        </ion-item>
      </ion-list>

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
                <ion-list>
            <ion-item>
              <ion-input v-model="movie.title" placeholder="Title"></ion-input>
            </ion-item>
            <ion-item>
              <ion-select v-model="movie.format" placeholder="Format">
                <ion-select-option value="DVD">DVD</ion-select-option>
                <ion-select-option value="Blu-ray">Blu-ray</ion-select-option>
              </ion-select>
            </ion-item>
      </ion-list>

            <ion-button expand="block" @click="addMovie">
              Create
            </ion-button>
      </ion-modal>
</ion-page>
  `,
  data() {
    return { query: '', results: [], movie: { title: '', year: '', format: 'DVD' }, collectionId: null, showModal: false, }
  },
  async created() {
    const loading = await loadingController.create({
      message: 'Getting movies...',
    });

    loading.present();

    const collectionId = this.$route.params.collectionId;
    if (collectionId) {
      this.collectionId = collectionId;
    }

    this.results = await MovieService.getAllMovies(collectionId);

    loading.dismiss();
  },
  methods: {
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    search() {
      MovieService.search(this.query).then(m => this.results = m)
    },
    async addMovie() {
      const loading = await loadingController.create({
        message: `Adding movie...`,
      });

      loading.present();

      if (!this.movie.title || !this.movie.format) {
        loading.dismiss();
        return;
      }

      var newMovie = await MovieService.add(this.movie, this.collectionId);

      loading.dismiss();
      this.movie = { title: '', format: 'DVD' };
      this.query = '';

      this.results.add(newMovie);

      this.showModal = false;
    }
  }
}