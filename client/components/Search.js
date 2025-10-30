import { MovieService } from '../services/movie-service.js'
import { store } from '../services/state.js'
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
          <ion-title>Movies for {{ collectionInfo.name }}</ion-title>
             <ion-buttons slot="end">
            <ion-button @click="refreshMovies">
              <ion-icon slot="icon-only" name="refresh-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

    <ion-fab slot="fixed" vertical="bottom" horizontal="end" v-if="store.getIsMaintainer(collectionId)">
   <ion-fab-button>
      <ion-icon name="chevron-up-circle"></ion-icon>
    </ion-fab-button>
    <ion-fab-list side="top">
      <ion-fab-button color="primary" @click="openModal">
        <ion-icon name="add-outline" ></ion-icon>
      </ion-fab-button>
      <ion-fab-button color="primary" @click="navigateToAddUser">
        <ion-icon name="person-add"></ion-icon>
      </ion-fab-button>
      <ion-fab-button color="primary">
        <ion-icon name="settings" @click="navigateToSettings"></ion-icon>
      </ion-fab-button>
    </ion-fab-list>
    </ion-fab>
 <ion-content>
      <ion-list ref="options">
        <ion-item>
          <ion-input v-model="query" @input="search" placeholder="Search..."></ion-input>
        </ion-item>
        <ion-item v-for="movie in results" :key="movie.id" button detail="true" @click="openActionSheet(movie)">
            <ion-label>
              <h2>{{ movie.title }}</h2>
              <p>{{ movie.format }}</p>
            </ion-label>
          
         <ion-item-options side="end">
            <ion-item-option>
              <ion-icon slot="icon-only" name="information-circle" @click="navigateDetails(movie.id)"></ion-icon>
            </ion-item-option>
            <ion-item-option color="danger">
              <ion-icon slot="icon-only" name="trash" @click="presentRemoveMovie(movie.id)"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item>
      </ion-list>
 </ion-content>
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
              <ion-select v-model="movie.format" placeholder="Select Format" ref="formatSelect">  
                <ion-select-option 
                v-for="formatName in store.formats" 
                :key="formatName" 
                :value="formatName"
                >
                {{formatName}}</ion-select-option>
              </ion-select>
            </ion-item>
      </ion-list>

            <ion-button expand="block" @click="addMovie">
              Create
            </ion-button>
      </ion-modal>
      <ion-alert header="Are you sure?" ref="alert"></ion-alert>
      <ion-action-sheet trigger="open-action-sheet" header="Actions" ref="actionSheet"></ion-action-sheet>
</ion-page>
  `,
  components: { IonSelect, IonSelectOption },
  data() {
    return {
      store: store,
      query: '',
      results: [],
      movie: { title: '', year: '', format: 'DVD' },
      collectionId: null,
      showModal: false,
      collectionInfo: { name: '', roleForCurrentUser: '', isMaintainer: false },
      alert: null,
    }
  },
  async created() {
    const collectionId = this.$route.params.collectionId;
    if (collectionId) {
      this.collectionId = collectionId;
    }

    var loading = await loadingController.create({
      message: 'Getting movies...',
    });

    if (store.collections === null || store.collections === undefined || store.collections.length === 0) {
      loading.present();

      store.collections = await MovieService.getAllCollections();

      this.collectionInfo = store.getCollectionInfo(collectionId);

      var cachedCollection = store.getCollectionMovies(collectionId);
      if (!cachedCollection) {
        var moviesFromAPi = await MovieService.getAllMovies(collectionId);
        store.setCollectionMovies(collectionId, moviesFromAPi);

        store.setCurrentCollectionMovies(moviesFromAPi);
      }

      this.results = store.currentCollectionMovies;

      loading.dismiss();
      return;
    }

    var cachedCollection = store.getCollectionMovies(collectionId);
    if (!cachedCollection) {
      loading.present();
      var moviesFromAPi = await MovieService.getAllMovies(collectionId);
      store.setCollectionMovies(collectionId, moviesFromAPi);

      store.setCurrentCollectionMovies(moviesFromAPi);

      this.results = store.currentCollectionMovies;
      loading.dismiss();
    }

    var storeMovies = store.getCollectionMovies(collectionId);
    store.setCurrentCollectionMovies(storeMovies);

    this.results = store.currentCollectionMovies;
  },
  mounted() {
    this.$refs.formatSelect.addEventListener('ionChange', (e) => {
      this.movie.format = e.detail.value;
    });
    this.alert = this.$refs.alert;
  },
  methods: {
    navigateDetails(id) {
      this.$router.push(`/details/${id}/${this.collectionId}`);
    },
    async refreshMovies() {
      const loading = await loadingController.create({
        message: 'Refreshing movies...',
      });

      loading.present();

      var moviesFromAPi = await MovieService.getAllMovies(collectionId);
      store.setCollectionMovies(collectionId, moviesFromAPi);

      store.setCurrentCollectionMovies(moviesFromAPi);

      this.results = store.currentCollectionMovies;

      loading.dismiss()
    },
    navigateToSettings() {
      this.$router.push(`/settings/${this.collectionId}`);
    },
    goBack() {
      this.$router.back();
    },
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    async search() {
      this.results = store.searchCollectionMovies(this.collectionId, this.query);
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

      var newMovieResponse = await MovieService.add(this.movie, this.collectionId);
      if (newMovieResponse === null) {
        loading.dismiss();
        const toast = await toastController.create({
          message: 'Error adding movie.',
          duration: 1500,
          swipeGesture: "vertical",
          color: "danger"
        });

        await toast.present();
        return;
      }
      if (newMovieResponse.redirectToMovieSelector) {
        this.$router.push(`/movies-selector/${this.collectionId}`);
        return;
      }

      loading.dismiss();

      this.movie = { title: '', format: 'DVD' };
      this.query = '';

      this.results.push(newMovieResponse.movie);

      var toastMessage = `${this.movie.title} added.`;

      if (newMovieResponse.showAddDetailsMessage) {
        toastMessage = `${this.movie.title} added. But need more details`;
      }

      const toast = await toastController.create({
        message: toastMessage,
        duration: 1500,
        swipeGesture: "vertical",
        color: "success"
      });

      await toast.present();

      this.showModal = false;
    },
    async openActionSheet(movie) {
      var actionSheet = this.$refs.actionSheet;

      actionSheet.buttons = [
         {
          text: 'Info',
          data: {
            action: 'info',
          },
          handler: async () => {
            await this.navigateDetails(movie.id);
          }
        }
      ]

      if(store.getIsMaintainer(this.collectionId)) {
        actionSheet.buttons.push( {
          text: 'Delete',
          role: 'destructive',
          data: {
            action: 'delete',
          },
          handler: async () => {
            await this.presentRemoveMovie(movie.id);
          }
        })
      }

      actionSheet.buttons.push(  {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          }
        })

      actionSheet.present();
    },
    async removeFilmFromCollection(movieId) {
      this.$refs.options.closeSlidingItems();
      var success = await MovieService.removeMovieFromCollection(this.collectionId, movieId);

      if (success) {
        store.removeCollectionMovie(this.collectionId, movieId);
        var cachedCollection = store.getCollectionMovies(this.collectionId);
        store.setCurrentCollectionMovies(cachedCollection);
        this.results = store.currentCollectionMovies;

        const toast = await toastController.create({
          message: 'Movie removed from collection.',
          duration: 1500,
          swipeGesture: "vertical",
          color: "success"
        });

        await toast.present();
        return;
      }

      const toast = await toastController.create({
        message: 'Could not remove movie from collection.',
        duration: 1500,
        swipeGesture: "vertical",
        color: "danger"
      });

      await toast.present();
      return;
    },
    async presentRemoveMovie(movieId) {
      this.alert.present();

      this.alert.buttons = [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: async () => {
            await this.removeFilmFromCollection(movieId)
          },
        },
      ];
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