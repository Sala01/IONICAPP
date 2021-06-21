import { Component, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { environment } from '../../../environments/environment';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';

@Component({
  selector: 'app-maintenance2',
  templateUrl: './maintenance2.page.html',
  styleUrls: ['./maintenance2.page.scss'],
})
export class Maintenance2Page implements OnInit {

  imagenes = [];
  urls = [];
  names = {completo: [], reducido: []};
  idmant: any;
  mainobj: any;
  consuobj: any;
  servicios: any;
  nmicon = 'arrow-forward';
  showForce = false;
  paso = true;
  paso2 = false;
  paso3 = false;
  paso4 = false;
  paso5 = false;
  fecha: any;
  codigoequipo = '';
  usuario: any;
  nombreequippo = '';
  lugar: any;
  horometro: any;
  horometroInicial: any;
  servicio: any;
  observaciones: any;
  finales = '';
  nombreMantenimiento = '';
  numimg = 0;
  imagena = ['assets/img/1.png', 'assets/img/2.png', 'assets/img/3.png', 'assets/img/4.png', 'assets/img/5.png', 'assets/img/6.png', 'assets/img/7.png', 'assets/img/8.png', 'assets/img/9.png'];
  imagen = this.imagena[0];
  consumible: any;
  cantidad: any;
  unidad: any;
  pu: any;
  consumibles = [];

  subtotal = 0;
  iva = 0;
  total = 0;
  parte = '';
  medicion: any;

  constructor(
    private http: HTTP,
    private camera: Camera,
    private storage: Storage,
    private utils: UtilsService,
    private auth: AuthenticationService,
    private actionSheetController: ActionSheetController
  ) { }

  ngOnInit() {
    this.mainobj = {
      NombreEntidad: 'Registro de Mantenimiento',
      Campos: [],
      ImagenBase64: [],
      IdCompania: ''
    };
    this.consuobj = {
      NombreEntidad: 'Consumibles',
      Campos: [],
      IdCompania: ''
    };
    this.servicios = [];
    this.http.setHeader('*', 'Access-Control-Allow-Origin' , '*');
    this.http.setHeader('*', 'Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
    this.http.setHeader('*', 'Accept', 'application/json');
    this.http.setHeader('*', 'Content-type', 'application/json');
    this.http.setDataSerializer('json');
  }

  async initscan() {
    this.utils.scan().then(async datascan => {
      this.usuario =  await this.storage.get('user');
      this.usuario = JSON.parse(this.usuario);
      this.http.setHeader('*', 'Authorization', this.usuario.Token);
      this.codigoequipo = datascan;
      const response = await this.auth.getmaq(datascan, this.usuario.IdCompania);
      this.addmain('Nombre Mantenimiento', '', this.mainobj);
      this.addmain('ID Maquina Equipo', response[0]._id, this.mainobj);
      this.addmain('Código de Identificacion', datascan, this.mainobj);
      this.addmain('Tipo de Mantenimiento', 'Correctivo', this.mainobj);
      this.addmain('Servicio', response[0].Campos[12].ValorCampo, this.mainobj);
      this.addmain('Horas de Servicio / Kilometraje', this.horometro, this.mainobj);
      this.addmain('Realizado Por', this.lugar, this.mainobj);
      this.addmain('Costo de Servicio', this.total, this.mainobj);
      this.addmain('Nivel de Combustible', 0, this.mainobj);
      this.addmain('Observaciones', this.finales, this.mainobj);
      const today = new Date();
      this.fecha = (today.getDate() < 10) ? '0' + today.getDate() : today.getDate();
      this.fecha += '/' + ((today.getMonth() + 1) < 10 ? '0' + (today.getMonth() + 1) : (today.getMonth() + 1));
      this.fecha += '/' + today.getFullYear();
      this.addmain('Fecha', this.fecha, this.mainobj);
      // tslint:disable-next-line: max-line-length
      this.nombreequippo = response[0].Campos[1].ValorCampo + ' ' + response[0].Campos[2].ValorCampo + ' ' + response[0].Campos[3].ValorCampo + ' ' + response[0].Campos[4].ValorCampo;
      this.horometroInicial = response[0].Campos[11].ValorCampo;
      this.medicion = response[0].Campos[13].ValorCampo;
      this.paso2 = true;
      this.paso = false;
      this.paso3 = false;
      this.paso4 = false;
      this.initpaso2();
    }).catch(() => {
      this.utils.toastPresent('Ocurrió un problema el leer un QR', 'Error');
      this.paso = true;
      this.paso2 = false;
      this.paso3 = false;
      this.paso4 = false;
    });
  }
  next( pas, flag?: boolean ) {
    switch ( pas ) {
      case 0:
        this.paso = false;
        this.paso2 = false;
        this.paso3 = false;
        this.paso4 = false;
        this.paso5 = false;

        this.paso = true;
        break;
      case 1:
        this.paso = false;
        this.paso2 = false;
        this.paso3 = false;
        this.paso4 = false;
        this.paso5 = false;

        this.paso = true;
        break;
      case 2:
        this.paso = false;
        this.paso2 = false;
        this.paso3 = false;
        this.paso4 = false;
        this.paso5 = false;

        this.paso2 = true;
        break;
      case 3:
        if (this.nombreMantenimiento === '') {
          this.utils.toastPresent('Captura un nombre de mantenimiento');
        } else if (this.lugar === undefined) {
          this.utils.toastPresent('Selecciona un centro de servicio');
        } else if (this.medicion !== 'No Aplica' && ( this.horometro === undefined || this.horometro < 0)) {
          this.utils.toastPresent('Captura el horometro actual de la Maquinaria / Equipo');
        } else if (this.medicion !== 'No Aplica' && (this.horometroInicial > this.horometro)) {
          this.utils.toastPresent('Captura el horometro mayor o igual a ' + this.horometroInicial);
        } else {
          if (this.medicion === 'No Aplica') {
            this.horometro = 0;
          }
          this.paso = false;
          this.paso2 = false;
          this.paso3 = false;
          this.paso4 = false;
          this.paso5 = false;

          this.paso3 = true;
          if (flag) {
            this.initpaso3();
          }
        }
        break;
      case 4:
        if (this.consumible === undefined || this.consumible === '') {
          this.utils.toastPresent('Captura una descripción');
        } else if (this.cantidad === undefined || this.cantidad < 1) {
          this.utils.toastPresent('Captura una cantidad mayor a 0');
        } else if (this.pu === undefined || this.pu < 0) {
          this.utils.toastPresent('Captura un precio mayor a 0');
        } else if (this.parte === undefined || this.parte === '') {
          this.utils.toastPresent('Captura un número de parte');
        } else if (this.unidad === undefined || this.unidad === '') {
          this.utils.toastPresent('Selecciona una unidad');
        } else {
          this.paso = false;
          this.paso2 = false;
          this.paso3 = false;
          this.paso4 = false;
          this.paso5 = false;

          this.paso4 = true;
          this.initpaso4();
        }
        break;
      case 5:
        this.paso = false;
        this.paso2 = false;
        this.paso3 = false;
        this.paso4 = false;
        this.paso5 = false;

        this.paso5 = true;
        break;
    }
  }
  async cerrar() {
    if (this.finales === '') {
      this.utils.toastPresent('Captura las observaciones finales');
    } else {
      this.addmain('Observaciones', this.finales, this.mainobj);
      this.addmain('Costo de Servicio', this.total, this.mainobj);
      this.mainobj.ImagenBase64 = this.imagenes;
      this.mainobj._id = this.idmant;
      console.log(this.mainobj);
      await this.utils.presentLoader();
      await this.http.put(environment.api + 'DatosEntidad/api/datosentidad', this.mainobj, {}).then(async data => {
        await this.utils.dismissLoader();
        this.utils.toastPresent('Se registró correctamente');
        this.utils.navigate('home');
      }).catch(async error => {
        await this.utils.dismissLoader();
        console.log(JSON.stringify(error));
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
  async initpaso2() {
    await this.utils.presentLoader();
    // tslint:disable-next-line: max-line-length
    await this.http.get(environment.api + 'DatosEntidad/api/DatosEntidad?_id=Centros_de_Servicio&IdCompania=' + this.usuario.IdCompania, {}, {}).then(async data2 => {
      await this.utils.dismissLoader();
      const response = JSON.parse(data2.data);
      console.log(response);
      // tslint:disable-next-line: forin
      for ( const resp in response ) {
        this.servicios.push(response[resp].Campos[0].ValorCampo);
      }
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
  async initpaso3() {
    this.addmain('Horas de Servicio / Kilometraje', this.horometro, this.mainobj);
    this.addmain('Realizado Por', this.lugar, this.mainobj);
    this.addmain('Nombre Mantenimiento', this.nombreMantenimiento, this.mainobj);
    this.addmain('Nivel de Combustible', this.numimg * 0.125, this.mainobj);
    this.mainobj.IdCompania = this.usuario.IdCompania;
    await this.utils.presentLoader();
    await this.http.post(environment.api + 'DatosEntidad/api/datosentidad', this.mainobj, {}).then(async data => {
      await this.utils.dismissLoader();
      this.idmant = JSON.parse(data.data);
      console.log(this.idmant);
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
  async initpaso4() {
    this.addmain('Número de Parte', this.parte, this.consuobj);
    this.addmain('Descripción', this.consumible, this.consuobj);
    this.addmain('Cantidad', this.cantidad, this.consuobj);
    this.addmain('UDM', this.unidad, this.consuobj);
    this.addmain('ID Mantenimiento', this.idmant, this.consuobj);
    this.addmain('Costo Unitario', this.pu, this.consuobj);
    this.addmain('Costo Total', (this.cantidad * this.pu), this.consuobj);
    this.consuobj.IdCompania = this.usuario.IdCompania;
    await this.utils.presentLoader();
    await this.http.post(environment.api + 'DatosEntidad/api/datosentidad', this.consuobj, {}).then(async data => {
      await this.utils.dismissLoader();
      const idcon = JSON.parse(data.data);
      this.consumibles.push({
        consumible: this.consumible,
        cantidad: this.cantidad,
        pu: this.pu,
        obs: this.observaciones,
        total: (this.cantidad * this.pu),
        id: idcon
      });
      this.utils.toastPresent('Consumible agregado correctamente');
      this.parte = this.consumible = this.cantidad = this.unidad = this.pu = undefined;
      this.calculo();
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
  camimg( val ) {
    this.numimg = this.numimg + val;
    if ( this.numimg < 0 ) {
      this.numimg = 0;
    } else if (this.numimg > 8) {
      this.numimg = 8;
    }
    this.imagen = this.imagena[this.numimg];
  }
  openmenu(menu) {
    this.utils.openmenu(menu);
  }
  async presentAlert() {
    this.auth.alertcerrar();
  }
  menuItemForce(): void {
    this.showForce = !this.showForce;
    if (this.showForce) {
      this.nmicon = 'arrow-down';
    } else {
      this.nmicon = 'arrow-forward';
    }
  }
  logout() {
    this.auth.logout();
  }
  addmain(nombre, valor, obj) {
    let fup: any;
    fup = 0;
    for (const index in obj.Campos) {
      if (obj.Campos[index].NombreCampo === nombre) {
        fup = index;
      }
    }
    if (!fup) {
      obj.Campos.push({
        ValorCampo: valor,
        NombreCampo: nombre
      });
    } else {
      obj.Campos[fup] = {
        ValorCampo: valor,
        NombreCampo: nombre
      };
    }
  }
  async evento(x) {
    await this.utils.presentLoader();
    this.http.delete(environment.api + 'DatosEntidad/api/datosentidad?_id=' + this.consumibles[x].id, {}, {}).then(async data2 => {
      await this.utils.dismissLoader();
      this.consumibles.splice(x, 1);
      console.log(this.consumibles);
      this.calculo();
      this.utils.toastPresent('Se ha borrado el consumible');

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
  calculo() {
    const con = this.consumibles;
    this.subtotal = 0;
    // tslint:disable-next-line: forin
    for (const consu in this.consumibles) {
      this.total = this.subtotal += this.consumibles[consu].total;
    }
    this.consumibles = [];
    // tslint:disable-next-line: forin
    for (const consu in con) {
      this.consumibles.push(con[consu]);
    }
  }
  async agregarf() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Selecciona una opción',
      mode: 'ios',
      buttons: [{
        text: 'Galeria',
        icon: 'images',
        handler: () => {
          this.selectImage(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      }, {
        text: 'Cámara',
        icon: 'camera',
        handler: () => {
          this.selectImage(this.camera.PictureSourceType.CAMERA);
        }
      }, {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

  selectImage(source) {
    const options: CameraOptions = {
      quality: 30,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: source,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    this.camera.getPicture(options).then((base64) => {
      this.utils.toastPresent('Imagen agregada');
      this.imagenes.push(base64);
    }).catch(error => {
      console.log('Error obteniendo foto');
      console.log(error);
    });
  }

  borrarfactura(index) {
    this.names.completo.splice(index, 1);
    this.names.reducido.splice(index, 1);
  }
  validatepasos(paso: number) {
    switch (paso) {
      case 1:
        break;
      case 2:
        break;
      case 3:
        break;
      case 4:
        break;
      case 5:
        break;
    }
  }

}
