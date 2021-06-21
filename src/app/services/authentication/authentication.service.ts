import { Injectable } from '@angular/core';
import { Platform, NavController, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http/ngx';

import jsSHA from 'jssha';
import { BehaviorSubject } from 'rxjs';
import { UtilsService } from '../utils/utils.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  public user: any;
  authState = new BehaviorSubject(false);
  use: any;
  FCMToken: string;

  constructor(
    private http: HTTP,
    private platform: Platform,
    private utils: UtilsService,
    public navCtrl: NavController,
    public storage: Storage,
    public alertController: AlertController
  ) {
    this.platform.ready().then(() => {
      this.ifLoggedIn();
    });
  }

  login(user): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
        const newUser = this.generateSHAFromLogin(user);
        // tslint:disable-next-line: max-line-length
        this.http.post(environment.api + 'Usuarios/api/Login?usuario=' + newUser.usuario + '&pass=' + newUser.pass, {}, {}).then(async data => {
          let response = JSON.parse(data.data);
          if (data.status === 200) {
            this.http.setHeader('*', 'Authorization', response.Token);
            this.http.get(environment.api + 'Usuarios/api/usuarios?usuario=' + newUser.usuario , {}, {}).then(async data2 => {
              const response2 = JSON.parse(data2.data);
              response2.Token = response.Token;
              console.log(response2);
              // tslint:disable-next-line: max-line-length
              this.http.get(environment.api + 'Roles/api/Roles?_id=' + response2.Rol + '&IdCompania=' + response2.IdCompania , {}, {}).then(async data3 => {
                const responseroles = JSON.parse(data3.data);
                response2.Rolarray = responseroles;
              });

              const roles = ['administrador', 'supervisor', 'operador'];
              if (data2.status === 200) {
                 if (response2.Estatus === 'Habilitado') {
                   if (roles.includes(response2.Rol.toLocaleLowerCase())) {
                    await this.storage.set('user', JSON.stringify(response2));
                    this.authState.next(true);
                    resolve(true);
                   } else {
                    this.utils.toastPresent('Perfil de usuario incorrecto, favor de verificar con el administrador');
                    reject(false);
                   }
                 } else {
                   this.utils.toastPresent('Usuario deshabilitado, favor de verificar con el administrador');
                   reject(false);
                 }
              } else {
                reject(false);
              }
            }).catch(error => {
              console.log(JSON.stringify(error));
              if (error.status === 400) {
                response = JSON.parse(error.error);
                this.utils.toastPresent(response.Mensaje);
              } else if (error.status === 400) {
                this.utils.toastPresent('Sin autorización');
              } else if (error.status === 500) {
                this.utils.toastPresent('Error interno del servidor. Intente más tarde.');
              }
              reject(false);
            });
          } else {
            this.utils.toastPresent(response.Mensaje, 'Error');
            reject(false);
          }
        }).catch(error => {
          console.log(JSON.stringify(error));
          if (error.status === 400) {
            const response = JSON.parse(error.error);
            this.utils.toastPresent(response.Mensaje);
          } else if (error.status === 401) {
            this.utils.toastPresent('El usuario no existe. Verifica con el administrador.');
          } else if (error.status === 500) {
            this.utils.toastPresent('Error interno del servidor. Intente más tarde.');
          }
          reject(false);
        });
    });
  }

  logout() {
      this.storage.clear().then(() => {
        this.http.setHeader('*', 'Authorization', '');
        this.navCtrl.navigateRoot('login');
        this.authState.next(false);
      }).catch(() => {
        this.utils.toastPresent('Ocurrió un error al cerrar sesión. Intenta más tarde');
      });
  }

  async updateFCMToken(token) {
    // this.http.put(environment.api + 'actualizar/tokenfb', token, {});
  }
  async alertcerrar() {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Confirmar',
          handler: () => {
            this.logout();
          }
        }
      ]
    });
    await alert.present();
  }

  private ifLoggedIn() {
    this.storage.get('user').then((response) => {
      if (response) {
        this.user = JSON.parse(response);
        this.authState.next(true);
        if (this.platform.is('cordova')) {
          this.http.setHeader('*', 'Authorization', this.user.Token);
        }
      }
    });
  }

  private generateSHAFromLogin(user) {
    const shaObj = new jsSHA('SHA-256', 'TEXT');
    shaObj.update(user.Password);
    const newUser = {
      usuario: user.Usuario,
      pass: shaObj.getHash('HEX').toUpperCase(),
    };
    return newUser;
  }

  async getmaq(datascan: string, IdCompania: any) {
    await this.utils.presentLoader();
    // tslint:disable-next-line: max-line-length
    return await this.http.get(environment.api + 'DatosEntidad/api/DatosEntidad?CodigoIdentificacion=' + datascan  + '&IdCompania=' + IdCompania, {}, {}).then(async data2 => {
      await this.utils.dismissLoader();
      const response = JSON.parse(data2.data);
      return response;
    }).catch(async error => {
      await this.utils.dismissLoader();
      console.log(error);
      if (error.status === 400) {
        this.utils.toastPresent(error.error);
      } else if (error.status === 401) {
        this.utils.toastPresent('Sin autorización');
        this.logout();
      } else if (error.status === 500) {
        this.utils.toastPresent('Error interno del servidor. Intente más tarde.');
      }
      return null;
    });
  }
}
