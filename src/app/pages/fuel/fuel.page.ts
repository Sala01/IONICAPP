import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http/ngx';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';

@Component({
  selector: 'app-fuel',
  templateUrl: './fuel.page.html',
  styleUrls: ['./fuel.page.scss'],
})
export class FuelPage implements OnInit {

  mainobj: any;
  usuario: any;
  nmicon = 'arrow-forward';
  showForce = false;
  codigoequipo = '';
  nombreobra = '';
  clabe: string;
  nombreequippo = '';
  paso = true;
  paso2 = false;
  paso3 = false;
  paso4 = false;
  fecha: any;
  hora: any;
  numimg = 0;
  numimg2 = 0;
  imagena = ['assets/img/1.png', 'assets/img/2.png', 'assets/img/3.png', 'assets/img/4.png', 'assets/img/5.png', 'assets/img/6.png', 'assets/img/7.png', 'assets/img/8.png', 'assets/img/9.png'];
  imagen = this.imagena[0];
  imagen2 = this.imagena[0];
  obras = {
    'cla be': {nombre: 'Obra tal'}
  };
  horometro: any;
  horometroInicial: any;
  litros: any;
  medicion: any;

  constructor(
    private http: HTTP,
    private storage: Storage,
    private utils: UtilsService,
    private auth: AuthenticationService
  ) { }

  ngOnInit() {
    this.http.setHeader('*', 'Access-Control-Allow-Origin' , '*');
    this.http.setHeader('*', 'Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
    this.http.setHeader('*', 'Accept', 'application/json');
    this.http.setHeader('*', 'Content-type', 'application/json');
    this.http.setDataSerializer('json');
    this.mainobj = {
      NombreEntidad: 'Registro de Combustible',
      Campos: [],
      IdCompania: ''
    };
  }

  async presentAlert() {
    this.auth.alertcerrar();
  }

  initscan() {
    this.utils.scan().then(async datascan => {
      this.usuario =  await this.storage.get('user');
      this.usuario = JSON.parse(this.usuario);
      this.http.setHeader('*', 'Authorization', this.usuario.Token);
      this.codigoequipo = datascan;
      // tslint:disable-next-line: no-shadowed-variable
      const response = await this.auth.getmaq(datascan, this.usuario.IdCompania);
      if (response.length > 0) {
        // tslint:disable-next-line: max-line-length
        this.nombreequippo = response[0].Campos[1].ValorCampo + ' ' + response[0].Campos[2].ValorCampo + ' ' + response[0].Campos[3].ValorCampo + ' ' + response[0].Campos[4].ValorCampo;
        this.nombreobra = response[0].Campos[10].ValorCampo;
        this.clabe = response[0].Campos[10].ValorCampo;
        this.horometroInicial = response[0].Campos[11].ValorCampo;
        this.medicion = response[0].Campos[13].ValorCampo;
        this.addmain('ID Maquina Equipo', response[0]._id, this.mainobj);
        this.addmain('Código de Identificacion', datascan, this.mainobj);
        this.addmain('Ubicación', this.clabe, this.mainobj);
        this.paso2 = true;
        this.paso = false;
        this.paso3 = false;
        this.paso4 = false;
      } else {
        this.utils.toastPresent('Maquinaria o equipo no registrado');
      }
    }).catch(() => {
      this.utils.toastPresent('Ocurrió un problema el leer un QR', 'Error');
      this.paso = true;
      this.paso2 = false;
      this.paso3 = false;
      this.paso4 = false;
    });
  }

  async save() {
    if (this.medicion !== 'No Aplica' && (this.horometro === undefined || this.horometro < 0)) {
      this.utils.toastPresent('Captura el horometro actual de la Maquinaria / Equipo');
    } else if (this.medicion !== 'No Aplica' && (this.horometroInicial > this.horometro)) {
      this.utils.toastPresent('Captura el horometro mayor o igual a ' + this.horometroInicial);
    } else if (this.litros === undefined || this.litros < 1) {
      this.utils.toastPresent('Captura correctamente el valor de litros');
    } else if (this.numimg > this.numimg2) {
      this.utils.toastPresent('Captura el medidor de combustible final mayor que el inicial ');
    } else {
      if (this.medicion === 'No Aplica') {
        this.horometro = 0;
      }
      this.paso3 = true;
      this.paso2 = false;
      this.paso = false;
      this.paso4 = false;
      const today = new Date();
      this.fecha = (today.getDate() < 10) ? '0' + today.getDate() : today.getDate();
      this.fecha += '/' + ((today.getMonth() + 1) < 10 ? '0' + (today.getMonth() + 1) : (today.getMonth() + 1));
      this.fecha += '/' + today.getFullYear();
      this.hora = today.getHours() < 10 ? '0' + today.getHours() : today.getHours();
      this.hora += ':' + (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes());
      // this.hora = new Date(Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, minute: 'numeric' });
      this.addmain('Horómetro', this.horometro, this.mainobj);
      this.addmain('Nivel Combustible Inicial', (this.numimg * 0.125), this.mainobj);
      this.addmain('Litros', this.litros, this.mainobj);
      this.addmain('Nivel Combustible Final', (this.numimg2 * 0.125), this.mainobj);
      this.addmain('Fecha', this.fecha, this.mainobj);
      this.addmain('Hora', this.hora, this.mainobj);
      this.mainobj.IdCompania = this.usuario.IdCompania;
      // guardar
      console.log(JSON.stringify(this.mainobj));
      await this.utils.presentLoader();
      await this.http.post(environment.api + 'DatosEntidad/api/datosentidad', this.mainobj, {}).then(async data => {
        await this.utils.dismissLoader();
        this.utils.toastPresent('Registro de combustible exitoso');
        console.log(this.mainobj);
      }).catch(async error => {
        await this.utils.dismissLoader();
      });
    }
  }

  cerrar() {
    this.utils.navigate('home');
  }

  camimg(val) {
    this.numimg = this.numimg + val;
    if ( this.numimg < 0 ) {
      this.numimg = 0;
    } else if (this.numimg > 8) {
      this.numimg = 8;
    }
    this.imagen = this.imagena[this.numimg];
  }

  camimg2(val) {
    this.numimg2 = this.numimg2 + val;
    if ( this.numimg2 < 0 ) {
      this.numimg2 = 0;
    } else if (this.numimg2 > 8) {
      this.numimg2 = 8;
    }
    this.imagen2 = this.imagena[this.numimg2];
  }

  openmenu(menu) {
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

}
