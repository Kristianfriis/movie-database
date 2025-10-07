import { MovieService } from '../services/movie-service.js'

export default {
    template: /*html*/`
  <ion-page>
      <ion-list>
        <ion-item>
          <ion-input v-model="query" @input="search" placeholder="Search..."></ion-input>
        </ion-item>
        <ion-item v-for="movie in results" :key="movie.id" button>
          <router-link :to="'/details/' + movie.id">
            {{ movie.title }} ({{ movie.year }}) - {{ movie.format }}
          </router-link>
        </ion-item>
      </ion-list>
</ion-page>
  `,
    data() {
        return { query: '', results: [] }
    },
    created() {
        MovieService.getAll().then(m => this.results = m)
    },
    methods: {
        search() {
            MovieService.search(this.query).then(m => this.results = m)
        }
    }
}