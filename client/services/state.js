export const StateService = {
    showBackButton: false,
    toggleBackButton() {
        this.showBackButton = !this.showBackButton;
    }
}

import { reactive } from 'vue'

export const store = reactive({
  showBackButton: false
})