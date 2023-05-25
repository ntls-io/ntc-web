// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  nautilusVaultServer: 'https://nautilus-trust-staging-api.ntls.io/',
  algorand: {
    server: 'https://testnet-algorand.api.purestake.io/ps2',
    port: '',
    token: { 'X-API-Key': 'J7eo2jPb5m4OiBneIV6r0ajgRLeSaHqk3QplGETk' }
  },
  transak: {
    apiKey: 'c7ac9c9d-3062-4e79-8ada-fcbf0af91cc5',
    cryptoCurrencyCode: 'ALGO',
    environment: 'STAGING',
    widgetHeight: '570px',
    disableWalletAddressForm: true
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
