import { MovieService } from "../../services/movie-service.js";

export default {
    template: /*html*/`
    <ion-page>
        <ion-card v-if="inviteUrl">
        <ion-card-header>
            <ion-card-title v-if="!qrCodeGenerated">Generate QR Code</ion-card-title>
            <ion-card-title v-else>Scan to Join</ion-card-title>
        </ion-card-header>
        <ion-card-content>
            <ion-button expand="block" @click="generateQrCode" v-if="!qrCodeGenerated">Generate Code</ion-button>
            <div id="qrcode" ref="qrContainer"></div>
        </ion-card-content>
        </ion-card>
    </ion-page>
    `,
    data() {
        return {
            inviteUrl: null,
            qrCodeGenerated: false
        }
    },
    async mounted() {
        const collectionId = this.$route.params.collectionId;

        var inviteToken = await MovieService.generateInviteLink(collectionId);

        this.inviteUrl = inviteToken;
    },
    methods: {
        generateQrCode() {
            this.qrCodeGenerated = true;

            var qrcode = new QRCode(this.$refs.qrContainer, {
                text: "https://example.com",
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    }
}