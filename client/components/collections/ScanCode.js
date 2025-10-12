import { loadingController, toastController } from '@ionic/core';
import { MovieService } from '../../services/movie-service.js';

export default {
    template: /*html*/`
    <ion-page>
        <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
          <ion-title>Join</ion-title>
        </ion-toolbar>
      </ion-header>
        <h1>Scan QR Code to Join Collection</h1>
        <div id="qr-reader"></div>
        <ion-text v-if="status">{{ status }}</ion-text>
    </ion-page>
    `,
    data() {
        return {
            status: '',
            html5QrcodeScanner: null
        }
    },
    methods: {
    },
    async mounted() {
        this.html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader", // ID of the container element
            {
                fps: 10,  // Frames per second for scanning
                // Define the size of the box where QR codes will be searched
                qrbox: { width: 250, height: 250 },
                // Prefer the rear camera if available (useful for mobile)
                disableFlip: false
            },
            /* verbose= */ false
        );

        async function onScanSuccess(decodedText, decodedResult) {
            const loading = await loadingController.create({
                message: 'Trying to add the collection...',
            });

            loading.present();

            await MovieService.acceptInvite(decodedText);

            // Optionally, stop scanning after the first success
            if (this.html5QrcodeScanner) {
                this.html5QrcodeScanner.clear();
            }

            loading.dismiss();
        }

        this.html5QrcodeScanner.render(onScanSuccess);
    },
    unmounted() {
        // Clean up the scanner when the component is unmounted
        if (this.html5QrcodeScanner) {
            this.html5QrcodeScanner.clear();
        }
    }
}