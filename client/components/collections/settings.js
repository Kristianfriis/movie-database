import { MovieService } from "../../services/movie-service.js";

export default {
    template: /*html*/`
     <ion-page>
    <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
                <ion-back-button defaultHref="/" @click="goBack"></ion-back-button>
          </ion-buttons>
          <ion-title v-if="collectionInfo">Settings - {{ collectionInfo.name }}</ion-title>
          <ion-title v-else>Settings</ion-title>
            <ion-buttons slot="secondary">
            <ion-button @click="refreshCollectionInfo">
              <ion-icon slot="icon-only" name="refresh-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Users</ion-card-title>
        </ion-card-header>
        <ion-card-content v-if="collectionInfo && collectionInfo.users">
          <ion-list>
            <ion-item-sliding>
                <ion-item v-for="user in collectionInfo.users" :key="user.id">
                {{ user.name }} - {{ user.currentRole }}
                </ion-item>
                 <ion-item-options v-if="collectionInfo.isMaintainer">
                    <ion-item-option @click="OpenChangeRoleModal" color="primary">Change Role</ion-item-option>
                    <ion-item-option color="danger" v-if="!collectionInfo.isMaintainer">Remove</ion-item-option>
                </ion-item-options>
            </ion-item-sliding>
          </ion-list>
        </ion-card-content>
      </ion-card>
      </ion-page>
    `,
      data() {
        return {
          collectionId: null,
          collectionInfo: null, 
        }
      },
      async mounted() {
        const collectionId = this.$route.params.collectionId;
        this.collectionId = collectionId;

        this.collectionInfo = await MovieService.getCollectionInfo(collectionId);
      },
       methods: {
        goBack() {
          this.$router.back(); 
        },
        async refreshCollectionInfo() {
          this.collectionInfo = await MovieService.getCollectionInfo(this.collectionId, true);
        },
        async OpenChangeRoleModal() {
            console.log("OpenChangeRoleModal")
        }
      }
}