import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http/ngx';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { AuthenticationService } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  showForce = false;
  menuobj = [];
  name = '';
  usuario: any;
  nmicon = 'arrow-forward';

  constructor(
    private storage: Storage,
    private http: HTTP,
    private utils: UtilsService,
    private auth: AuthenticationService
    ) { }

  async ngOnInit() {
    this.usuario =  await this.storage.get('user');
    this.usuario = JSON.parse(this.usuario);
    this.name = this.usuario.Nombre + ' ' + this.usuario.ApellidoPaterno;
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

  openmenu(menu) {
      this.utils.openmenu(menu);
  }

}
