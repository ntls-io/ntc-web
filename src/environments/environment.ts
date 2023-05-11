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
  transakApiKey: 'd6c4c5f4-0b4a-4b1a-8b0a-4b0b4b0b4b0b'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
