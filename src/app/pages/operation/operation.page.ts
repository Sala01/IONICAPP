import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http/ngx';
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';

import { environment } from '../../../environments/environment';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';

@Component({
  selector: 'app-operation',
  templateUrl: './operation.page.html',
  styleUrls: ['./operation.page.scss'],
})
export class OperationPage implements OnInit {

  token = '';
  menuobj = [];
  nmicon = 'arrow-forward';
  showForce = false;
  idequipo: any;
  codigoequipo = '';
  usuario: any;
  nombreobra = '';
  paso = true;
  paso2 = false;
  paso3 = false;
  paso4 = false;
  mainobj = {
    NombreEntidad: 'Registro de Operación',
    Campos: [],
    IdCompania: ''
  };
  clabe: string;
  nombreequippo = '';
  fecha: any;
  hora: any;
  fechaf: any;
  horaf: any;
  horometro: any;
  horometroInicial: any;
  litros: any;
  obras = {
    'cla be': {nombre: 'Obra tal'}
  };
  numimg = 0;
  imagena = ['assets/img/1.png', 'assets/img/2.png', 'assets/img/3.png', 'assets/img/4.png', 'assets/img/5.png', 'assets/img/6.png', 'assets/img/7.png', 'assets/img/8.png', 'assets/img/9.png'];
  imagen = this.imagena[0];
  medicion: any;

  constructor(
    private fcm: FCM,
    private http: HTTP,
    private platform: Platform,
    private storage: Storage,
    private utils: UtilsService,
    private auth: AuthenticationService,
  ) { }

  ngOnInit() {
    this.mainobj = {
      NombreEntidad: 'Registro de Operación',
      Campos: [],
      IdCompania: ''
    };
    this.http.setHeader('*', 'Access-Control-Allow-Origin' , '*');
    this.http.setHeader('*', 'Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
    this.http.setHeader('*', 'Accept', 'application/json');
    this.http.setHeader('*', 'Content-type', 'application/json');
    this.http.setDataSerializer('json');
    this.getToken();

    const today = new Date();
    // tslint:disable-next-line: max-line-length
    this.fecha = (today.getDate() < 10) ? '0' + today.getDate() : today.getDate();
    this.fecha += '/' + ((today.getMonth() + 1) < 10 ? '0' + (today.getMonth() + 1) : (today.getMonth() + 1));
    this.fecha += '/' + today.getFullYear();
    this.hora = today.getHours() < 10 ? '0' + today.getHours() : today.getHours();
    this.hora += ':' + (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes());
    // this.hora = new Date(Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, minute: 'numeric' });
  }

  private async getToken() {
    this.platform.ready().then(() => {
      setTimeout(async () => {
        await this.fcm.getToken().then(token => {
          this.token = token;
        }).catch(error => {
          console.error('Error getting token', error);
        });
      }, 1000);
    });
  }

  async presentAlert() {
    this.auth.alertcerrar();
  }
  async save() {
    const info = {
      idequipo: this.idequipo,
      fecha: this.fecha,
      hora: this.hora,
      obra: this.clabe,
      equipo: this.codigoequipo,
      nombreequipo: this.nombreequippo,
      nombreobra: this.nombreobra,
      horometroInicial: this.horometroInicial,
      medicion: this.medicion
    };
    await this.storage.set('ope' + this.codigoequipo, JSON.stringify(info));
    this.paso3 = true;
    this.paso2 = false;
    this.paso = false;
    this.paso4 = false;
  }

  cerrar() {
    this.paso = true;
    this.paso2 = false;
    this.paso3 = false;
    this.paso4 = false;
    this.utils.navigate('home');
  }

  addmain(nombre, valor) {
    let fup: any;
    fup = 0;
    for (const index in this.mainobj.Campos) {
      if (this.mainobj.Campos[index].NombreCampo === nombre) {
        fup = index;
      }
    }
    if (!fup) {
      this.mainobj.Campos.push({
        ValorCampo: valor,
        NombreCampo: nombre
      });
    } else {
      this.mainobj.Campos[fup] = {
        ValorCampo: valor,
        NombreCampo: nombre
      };
    }
  }

  initscan() {
    this.utils.scan().then(async datascan => {
      this.usuario =  await this.storage.get('user');
      this.usuario = JSON.parse(this.usuario);
      this.http.setHeader('*', 'Authorization', this.usuario.Token);
      this.codigoequipo = datascan;
      this.storage.get('ope' + this.codigoequipo).then(async (response) => {
        if (response) {
          const rep = JSON.parse(response);
          this.nombreobra = rep.nombreobra; // Solo se usan para vista
          this.nombreequippo = rep.nombreequipo; // Solo se usan para vista

          this.idequipo = rep.idequipo;
          this.codigoequipo = rep.equipo;
          this.clabe = rep.obra;
          this.fecha = rep.fecha;
          this.hora = rep.hora;
          this.horometroInicial = rep.horometroInicial;
          this.medicion = rep.medicion;
          this.addmain('ID Maquina Equipo', this.idequipo);
          this.addmain('Código de Identificacion', this.codigoequipo);
          this.addmain('Ubicación', this.clabe);
          this.addmain('Horómetro', 0);
          this.addmain('Litros', 0);
          this.addmain('Nivel Combustible', 0);
          this.addmain('Fecha Inicio', this.fecha);
          this.addmain('Hora Inicio', this.hora);

          this.paso = false;
          this.paso2 = false;
          this.paso3 = false;
          this.paso4 = true;
        } else {
          const res = await this.auth.getmaq(datascan, this.usuario.IdCompania);
          if (res && res.length > 0) {
            // tslint:disable-next-line: max-line-length
            this.nombreequippo = res[0].Campos[1].ValorCampo + ' ' + res[0].Campos[2].ValorCampo + ' ' + res[0].Campos[3].ValorCampo + ' ' + res[0].Campos[4].ValorCampo;
            this.nombreobra = res[0].Campos[10].ValorCampo;
            this.clabe = res[0].Campos[10].ValorCampo;
            this.horometroInicial = res[0].Campos[11].ValorCampo;
            this.idequipo = res[0]._id;
            this.medicion = res[0].Campos[13].ValorCampo;
            this.paso2 = true;
            this.paso = false;
            this.paso3 = false;
            this.paso4 = false;
          } else {
            this.utils.toastPresent('Maquinaria o equipo no registrado');
          }
        }
      });
    }).catch(() => {
      this.utils.toastPresent('Ocurrió un problema el leer un QR', 'Error');
      this.paso = true;
      this.paso2 = false;
      this.paso3 = false;
      this.paso4 = false;
    });
  }

  async finalizar() {
    if (this.medicion !== 'No Aplica' && (this.horometro === undefined || this.horometro < 0)) {
      this.utils.toastPresent('Captura el horometro actual de la Maquinaria / Equipo');
    } else if (this.medicion !== 'No Aplica' && (this.horometroInicial > this.horometro)) {
      this.utils.toastPresent('Captura el horometro mayor o igual a ' + this.horometroInicial);
    } else if (this.litros === undefined || this.litros < 0) {
      this.utils.toastPresent('Captura correctamente el valor de litros');
    } else {
      if (this.medicion === 'No Aplica') {
        this.horometro = 0;
      }
      const today = new Date();
      this.fechaf = (today.getDate() < 10) ? '0' + today.getDate() : today.getDate();
      this.fechaf += '/' + ((today.getMonth() + 1) < 10 ? '0' + (today.getMonth() + 1) : (today.getMonth() + 1));
      this.fechaf += '/' + today.getFullYear();
      // this.horaf = new Date(Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, minute: 'numeric' });
      this.horaf = today.getHours() < 10 ? '0' + today.getHours() : today.getHours();
      this.horaf += ':' + (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes());

      this.addmain('Horómetro', this.horometro);
      this.addmain('Litros', this.litros);
      this.addmain('Nivel Combustible', this.numimg * 0.125);

      this.addmain('Fecha Fin', this.fechaf);
      this.addmain('Hora Fin', this.horaf);
      this.addmain('Firma', this.usuario.Nombre + ' ' + this.usuario.ApellidoPaterno);
      this.addmain('TokenDispositivo', this.token);
      this.mainobj.IdCompania = this.usuario.IdCompania;
      await this.utils.presentLoader();
      await this.http.post(environment.api + 'DatosEntidad/api/datosentidad', this.mainobj, {}).then(async data => {
        await this.utils.dismissLoader();
        console.log(data.data);
        this.storage.remove('ope' + this.codigoequipo);
        this.utils.navigate('home');
      }).catch(async error => {
        await this.utils.dismissLoader();
        console.log(error);
        if (error.status === 400) {
          this.utils.toastPresent(error.error);
        } else if (error.status === 401) {
          this.utils.toastPresent('Sin autorización');
          this.auth.logout();
        } else if (error.status === 500) {
          this.utils.toastPresent('Error interno del servidor. Intente más tarde.');
        }
      });
    }
  }
  camimg(val: number) {
    this.numimg = this.numimg + val;
    if ( this.numimg < 0 ) {
      this.numimg = 0;
    } else if (this.numimg > 8) {
      this.numimg = 8;
    }
    this.imagen = this.imagena[this.numimg];
  }
  openmenu(menu: any) {
    this.utils.openmenu(menu);
  }
  menuItemForce(): void {
    this.showForce = !this.showForce;
    if (this.showForce) {
      this.nmicon = 'arrow-down';
    } else {
      this.nmicon = 'arrow-forward';
    }
  }

}
