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

      const loading = await loadingController.create({
        message: `Adding movie...`,
      });

      loading.present();

      var movie = this.store.movieSelectList.find(m => m.id === this.selectedMovieId);
      movie.format = this.store.movieSelectFormat;

      if (!movie) {
        return;
      }

      var response = await MovieService.saveFullMovieAsync(movie, this.collectionId);

      loading.dismiss();

      if (response === null) {
        const toast = await toastController.create({
          message: 'Error adding movie.',
          duration: 1500,
          swipeGesture: "vertical",
          color: "danger"
        });

        await toast.present();
        return;
      }

      this.store.addCollectionMovie(this.collectionId, response)

      const toast = await toastController.create({
        message: 'Movie added successfully',
        duration: 1500,
        swipeGesture: "vertical",
        color: "success"
      });

      await toast.present();

      this.$router.back();
    }
  }
}