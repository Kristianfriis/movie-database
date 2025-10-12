import { MovieService } from '../services/movie-service.js'
import { store } from '../services/state.js'

export default {
  template: /*html*/`
  <ion-page v-if="movie">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-back-button defaultHref="/" @click="goBack"></ion-back-button>
          </ion-buttons>
          <ion-title>Details</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-card>
        <ion-card-header>
          <ion-card-title>{{ movie.title }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>Format: {{ movie.format }}</p>
          <p>Year: {{ movie.year }}</p>
        </ion-card-content>
      </ion-card>
    </ion-page>
  `,
  data() {
    return {
      movie: null,
      store: store
    }
  },
  created() {
    const id = this.$route.params.id;

    MovieService.getAll().then(movies => {
      this.movie = movies.find(m => m.id == id)
    });

    this.store.showBackButton = true
  },
  methods: {
    goBack() {
      window.history.back();
    }
  }
}
