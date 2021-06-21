import { Component } from '@angular/core';

import { Platform, NavController, MenuController, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Storage } from '@ionic/storage';
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';

import { UtilsService } from './services/utils/utils.service';
import { AuthenticationService } from './services/authentication/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  usuario: any;
  nombre = '';

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private fcm: FCM,
    private storage: Storage,
    private menu: MenuController,
    private navCtrl: NavController,
    public alertController: AlertController,
    private utils: UtilsService,
    private authService: AuthenticationService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleBlackOpaque();
      this.splashScreen.hide();

      this.authService.authState.subscribe(async state => {
        state ? this.navCtrl.navigateRoot('home') : this.navCtrl.navigateRoot('login');
        if (state) {
          this.usuario =  await this.storage.get('user');
          this.usuario = JSON.parse(this.usuario);
          this.nombre = this.usuario.Nombre + ' ' + this.usuario.ApellidoPaterno;
          this.menu.enable(true, 'first');
          this.menu.enable(false, 'sesion');
        } else {
          await this.menu.close();
          this.menu.enable(false, 'sesion');
          this.menu.enable(false, 'first');
        }
      });

      this.requestPushPermission();
      this.fcmNotification();
    });
  }

  requestPushPermission() {
    this.fcm.requestPushPermission();
  }

  private fcmNotification() {
    this.fcm.onNotification().subscribe(data => {
      console.log(data);
      if (this.platform.is('android')) {
        this.presentAlert(data.title, data.body);
      }
      if (this.platform.is('ios')) {
        this.presentAlert(data.aps.alert.title, data.aps.alert.body);
      }
    });
  }

  navigate(page: string): void {
    this.utils.navigate(page);
  }
  logout() {
    this.authService.logout();
  }

  private async presentAlert(headerStr: string, messageStr: string) {
    const alert = await this.alertController.create({
      header: headerStr,
      message: messageStr,
      buttons: ['OK']
    });

    await alert.present();
  }
}
