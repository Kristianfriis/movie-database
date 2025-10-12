import { MovieService } from '../services/movie-service.js'
import { loadingController, toastController } from '@ionic/core';
import { IonSelect, IonSelectOption } from '@ionic/ionicvue';

export default {
  template: /*html*/`
  <ion-page>
 <ion-header>
        <ion-toolbar>
       <ion-buttons slot="start">
            <ion-back-button defaultHref="/" @click="goBack"></ion-back-button>
          </ion-buttons>
          <ion-title>Movies</ion-title>
             <ion-buttons slot="secondary">
            <ion-button @click="refreshMovies">
              <ion-icon slot="icon-only" name="refresh-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

    <ion-fab slot="fixed" vertical="bottom" horizontal="end">
   <ion-fab-button>
      <ion-icon name="chevron-up-circle"></ion-icon>
    </ion-fab-button>
    <ion-fab-list side="top">
      <ion-fab-button color="primary" @click="openModal">
        <ion-icon name="add-outline" ></ion-icon>
        <ion-icon name="film"></ion-icon>
      </ion-fab-button>
      <ion-fab-button color="primary" @click="navigateToAddUser">
        <ion-icon name="person-add"></ion-icon>
      </ion-fab-button>
      <ion-fab-button color="primary">
        <ion-icon name="settings"></ion-icon>
      </ion-fab-button>
    </ion-fab-list>
    </ion-fab>

      <ion-list>
        <ion-item>
          <ion-input v-model="query" @input="search" placeholder="Search..."></ion-input>
        </ion-item>
        <ion-item v-for="movie in results" :key="movie.id" button detail="true" @click="navigateDetails(movie.id)">
            {{ movie.title }} - {{ movie.format }}
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
              <ion-select v-model="movie.format" placeholder="Format" ref="select">
                <ion-select-option value="DVD">DVD</ion-select-option>
                <ion-select-option value="BluRay">BluRay</ion-select-option>
                <ion-select-option value="Digital">Digital</ion-select-option>
              </ion-select>
            </ion-item>
      </ion-list>

            <ion-button expand="block" @click="addMovie">
              Create
            </ion-button>
      </ion-modal>
</ion-page>
  `,
  components: { IonSelect, IonSelectOption },
  data() {
    return { query: '', results: [], movie: { title: '', year: '', format: 'DVD' }, collectionId: null, showModal: false }
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
  mounted() {
    this.$refs.select.addEventListener('ionChange', (e) => {
      this.movie.format = e.detail.value;
    });
  },
  methods: {
    navigateDetails(id) {
      this.$router.push(`/details/${id}`);
    },
    async refreshMovies() {
      const loading = await loadingController.create({
        message: 'Refreshing movies...',
      });

      loading.present();

      this.results = await MovieService.getAllMovies(this.collectionId);

      loading.dismiss()
    },
    goBack() {
      window.history.back();
    },
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    search() {
      MovieService.search(this.query).then(m => this.results = m)
    },
    navigateToAddUser() {
      this.$router.push(`/add-user-to-collection/${this.collectionId}`);
    },
    async addMovie() {
      if (!this.movie.title || !this.movie.format) {
        const toast = await toastController.create({
          message: 'Either title or format is missing.',
          duration: 1500,
          swipeGesture: "vertical",
          color: "danger"
        });

        await toast.present();
        return;
      }

      const loading = await loadingController.create({
        message: `Adding movie ${this.movie.title}...`,
      });

      loading.present();

      var newMovie = await MovieService.add(this.movie, this.collectionId);

      loading.dismiss();
      this.movie = { title: '', format: 'DVD' };
      this.query = '';

      this.results.push(newMovie);

      const toast = await toastController.create({
        message: `${this.movie.title} added.`,
        duration: 1500,
        swipeGesture: "vertical",
        color: "success"
      });

      await toast.present();

      this.showModal = false;
    }
  }
}