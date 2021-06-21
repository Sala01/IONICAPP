import { Injectable } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ToastController, LoadingController, NavController, MenuController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  private loading: any;


  constructor(
    private menu: MenuController,
    public navCtrl: NavController,
    private barcodeScanner: BarcodeScanner,
    private toastController: ToastController,
    private loadingController: LoadingController,
  ) { }

  scan(): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      this.barcodeScanner.scan().then(barcodeData => {
        barcodeData.cancelled ? reject('cancelado por el usuario') : resolve(barcodeData.text);
       }).catch(error => {
         console.log('Error', error);
         reject(error);
       });
    });
  }

  async toastPresent(msg: string, headerStr?: string) {
    const toast = await this.toastController.create({
      header: headerStr ? headerStr : 'Notificación',
      message: msg,
      position: 'bottom',
      duration: 4000,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });
    toast.present();
  }
  navigate(route: string, obj1?, optionalData?, obj2?) {
    this.closemenu();
    const navigationExtras: NavigationExtras = {
      queryParams: {
        body: JSON.stringify(obj1),
        optional: optionalData,
        obj: JSON.stringify(obj2),
      }
    };
    // return this.router.navigate([route], navigationExtras);
    return this.navCtrl.navigateRoot(route);
  }
  async hasPermission() {
  }
  async presentLoader() {
    this.loading = await this.loadingController.create({
      message: 'Cargando',
      mode: 'ios',
      spinner: 'dots',
    });
    await this.loading.present();
  }

  async dismissLoader() {
    await this.loading.dismiss();
  }

  async openmenu(menu) {
    this.menu.open(menu);
  }
  async closemenu() {
    this.menu.close('first');
    this.menu.close('sesion');
  }
  maskmoney(nm: string) {
    let pos = '';
    if (nm.lastIndexOf('.') >= 0) {
      pos = nm.substr((nm.lastIndexOf('.') + 1));
    } else {
      pos = '00';
    }
    let pos2 = '';
    if (nm.lastIndexOf('.') >= 0) {
      pos2 = nm.substring(0, nm.lastIndexOf('.'));
    } else {
      pos2 = nm;
      // tslint:disable-next-line: radix
      if (parseInt(pos2) <= 0) {
        pos2 = '0';
      }
    }
    let pos3 = '';
    const sob = pos2.length % 3;
    let c = 0;
    let pri = false;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < pos2.length; i++) {
      c++;
      pos3 += pos2[i];
      if (c === sob && !pri) {
        pos3 += ',';
        c = 0;
        pri = true;
      }
      if (c === 3) {
        pos3 += ',';
        c = 0;
      }
    }
    pos3 = pos3.slice(0, -1);
    pos3 += '.' + pos;
    return pos3;
  }
}
