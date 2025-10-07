import { MovieService } from '../services/movie-service.js'
import { store } from '../services/state.js'

export default {
    template: /*html*/`
  <ion-page v-if="movie">
      <ion-card>
        <ion-card-header>
          <ion-card-title>{{ movie.title }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>Format: {{ movie.format }}</p>
          <p>Year: {{ movie.year }}</p>
          <ion-button @click="$router.push('/')">Back</ion-button>
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
        const id = location.hash.split('/')[2]
        MovieService.getAll().then(movies => {
            this.movie = movies.find(m => m.id == id)
        });

        this.store.showBackButton = true
    },
    methods: {
        goBack() {
            location.hash = '#/'
        }
    }
}
