import { store } from '../../services/state.js'
import { MovieService } from '../../services/movie-service.js'
import { loadingController, toastController } from '@ionic/core';

export default {
  name: 'movies-selector',
  template: /*html*/`
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
          <ion-title>Choose correct movie</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
              <ion-list>
          <ion-list-header>
            <ion-label>Available Movies</ion-label>
          </ion-list-header>
        <ion-radio-group v-model="selectedMovieId" ref="movieRadioGroup" value="truncated">
          <ion-item v-for="movie in store.movieSelectList" :key="movie.id">
            <ion-radio :value="movie.id" alignment="start">
              <div >
                <ion-text class="ion-text-wrap"> {{ movie.title }} <br> Genre(s): {{ movie.genre.join(', ') }}</ion-text>
              </div>
            </ion-radio>
          </ion-item>
          </ion-radio-group>
        </ion-list>
      <ion-button :disabled="!selectedMovieId" expand="block" @click="confirmSelection">
        <ion-icon slot="start" name="checkmark-outline"></ion-icon>
        Choose
       </ion-button>

       
      </ion-content>
    </ion-page>
    `,
  setup() {
  },
  data() {
    return {
      store: store,
      selectedMovieId: null,
    }
  },
  mounted() {
    const collectionId = this.$route.params.collectionId;
    if (collectionId) {
      this.collectionId = collectionId;
    }

    this.$refs.movieRadioGroup.addEventListener('ionChange', (e) => {
      console.log(e.detail.value);
      this.selectedMovieId = e.detail.value;
    });
  },
  methods: {
    async confirmSelection() {
      if (!this.selectedMovieId) {
        return;
      }

      var movie = this.store.movieSelectList.find(m => m.id === this.selectedMovieId);

      if (!movie) {
        return;
      }

      await MovieService.saveFullMovieAsync(movie, this.collectionId);
    }
  }
}