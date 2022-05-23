import { firstValueFrom, Subject } from 'rxjs';
import { BaseLoginProvider } from '../entities/base-login-provider';
import { SocialUser } from '../entities/social-user';

export class GoogleLoginProvider extends BaseLoginProvider {
  public static readonly PROVIDER_ID: string = 'GOOGLE';

  // protected auth2: gapi.auth2.GoogleAuth;

  private _client: google.accounts.oauth2.TokenClient | undefined;
  private _accessToken: string | undefined;
  private readonly _tokenResponseSignal = new Subject<google.accounts.oauth2.TokenResponse>();

  constructor(
    private clientId: string,
    private initOptions = { scope: 'email' }
  ) {
    super();
  }

  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.loadScript(
          GoogleLoginProvider.PROVIDER_ID,
          'https://accounts.google.com/gsi/client',
          () => {
            this._client = google.accounts.oauth2.initTokenClient({
              client_id: this.clientId,
              scope: this.initOptions.scope,
              callback: tokenResponse => {
                debugger;
                this._accessToken = tokenResponse.access_token;
                this._tokenResponseSignal.next(tokenResponse);
              }
            });

            resolve();
          }
        );
        
        // this.loadScript(
        //   GoogleLoginProvider.PROVIDER_ID,
        //   'https://apis.google.com/js/api.js',
        //   () => {
        //     gapi.load('client:auth2', () => {
        //       gapi.client.init({
        //         ...this.initOptions,
        //         client_id: this.clientId,
        //       })
        //         .then(() => {
        //           this.auth2 = gapi.auth2.getAuthInstance();
        //           resolve();
        //         })
        //         .catch((err: any) => {
        //           if ((err.details as string).includes('deprecated')) {
        //             // we can still use the instance as it's ready.
        //             this.auth2 = gapi.auth2.getAuthInstance();
        //             console.error(err)
        //             resolve();
        //           } else {
        //             reject(err);
        //           }
        //         });
        //     });
        //   }
        // );
      } catch (err) {
        reject(err);
      }
    });
  }

  getLoginStatus(loginStatusOptions?: any): Promise<SocialUser> {
    const options = {...this.initOptions, ...loginStatusOptions};

    return new Promise((resolve, reject) => {
      resolve(null);
      // if (this.auth2.isSignedIn.get()) {
      //   const user: SocialUser = new SocialUser();

      //   const profile = this.auth2.currentUser.get().getBasicProfile();
      //   const authResponse = this.auth2.currentUser.get().getAuthResponse(true);  // get complete authResponse object
      //   this.setUserProfile(user, profile);
      //   user.response = authResponse;

      //   const resolveUser = authenticationResponse => {
      //     user.authToken = authenticationResponse.access_token;
      //     user.idToken = authenticationResponse.id_token;

      //     resolve(user);
      //   };

      //   if (options.refreshToken) {
      //     this.auth2.currentUser.get().reloadAuthResponse().then(resolveUser);
      //   } else {
      //     resolveUser(authResponse);
      //   }
      // } else {
      //   reject(
      //     `No user is currently logged in with ${GoogleLoginProvider.PROVIDER_ID}`
      //   );
      // }
    });
  }

  signIn(signInOptions?: any): Promise<SocialUser> {
    debugger;

    const promise = firstValueFrom(this._tokenResponseSignal);
    this._client.requestAccessToken();
    return promise.then(
      response => {
        const user = new SocialUser();
        
        debugger;

        return user;
      }
    );
    
    // const options = { ...this.initOptions, ...signInOptions };

    // return new Promise((resolve, reject) => {
    //   const offlineAccess: boolean = options && options.offline_access;
    //   const promise = !offlineAccess
    //     ? this.auth2.signIn(signInOptions)
    //     : this.auth2.grantOfflineAccess(signInOptions);

    //   promise
    //     .then(
    //       (response: any) => {
    //         const user: SocialUser = new SocialUser();

    //         if (response && response.code) {
    //           user.authorizationCode = response.code;
    //         } else {
    //           const profile = this.auth2.currentUser.get().getBasicProfile();
    //           const authResponse = this.auth2.currentUser.get().getAuthResponse(true);

    //           const token = authResponse.access_token;
    //           const backendToken = authResponse.id_token;

    //           this.setUserProfile(user, profile);
    //           user.authToken = token;
    //           user.idToken = backendToken;

    //           user.response = authResponse;
    //         }

    //         resolve(user);
    //       },
    //       (closed: any) => {
    //         reject(closed);
    //       }
    //     )
    //     .catch((err: any) => {
    //       reject(err);
    //     });
    // });
  }

  signOut(revoke?: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      google.accounts.oauth2.revoke(this._accessToken, () => resolve());
      // let signOutPromise: Promise<any>;

      // if (revoke) {
      //   signOutPromise = this.auth2.disconnect();
      // } else {
      //   signOutPromise = this.auth2.signOut();
      // }

      // signOutPromise
      //   .then((err: any) => {
      //     if (err) {
      //       reject(err);
      //     } else {
      //       resolve();
      //     }
      //   })
      //   .catch((err: any) => {
      //     reject(err);
      //   });
    });
  }

  private setUserProfile(user: SocialUser, profile: any): void {
    user.id = profile.getId();
    user.name = profile.getName();
    user.email = profile.getEmail();
    user.photoUrl = profile.getImageUrl();
    user.firstName = profile.getGivenName();
    user.lastName = profile.getFamilyName();
  }
}
