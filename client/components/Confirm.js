export default {
  name: 'Confirm',
  template: `
    <ion-page>
      <ion-content class="ion-padding">
        <ion-card>
          <ion-card-header>
            <ion-card-title>✅ Account Confirmed</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>Your email has been successfully verified. You can now log in and start using the app.</p>
            <ion-button expand="block" router-link="/login">Go to Login</ion-button>
          </ion-card-content>
        </ion-card>
      </ion-content>
    </ion-page>
  `
}
