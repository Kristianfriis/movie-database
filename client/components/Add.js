import { MovieService } from '../services/movie-service.js'

export default {
  template: /*html*/`
     <ion-page>
      <ion-list>
        <ion-item>
          <ion-input v-model="title" placeholder="Title"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input v-model="year" type="number" placeholder="Year"></ion-input>
        </ion-item>
        <ion-item>
          <ion-select v-model="format" placeholder="Format">
            <ion-select-option value="DVD">DVD</ion-select-option>
            <ion-select-option value="Blu-ray">Blu-ray</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>
      <ion-button expand="block" @click="addMovie">Add Movie</ion-button>
    </ion-page>
  `,
  data() {
    return { title: '', year: '', format: 'DVD' }
  },
  methods: {
    addMovie() {
      MovieService.add({
        title: this.title,
        year: parseInt(this.year),
        format: this.format
      }).then(() => location.hash = '#/')
    }
  }
}
