import { store } from '../services/state.js'

export default {
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
      <ion-content>
        
      </ion-content>
    </ion-page>
    `,
    setup() { },
    data() {
      return {
        store: store
      }
    },
}