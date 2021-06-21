import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;
  validationMessages = {
    Usuario: [{type: 'required', message: 'Usuario requerido.'}],
    Password: [{type: 'required', message: 'Contraseña requerida.'}]
  };
  isActiveToggleTextPassword = true;
  pressed = false;

  constructor(
    public navCtrl: NavController,
    private formBuilder: FormBuilder,
    private authService: AuthenticationService
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      Usuario: new FormControl('', Validators.compose([ // fernando.morales@neoteck.com.mx
        Validators.required,
      ])),
      Password: new FormControl('', Validators.compose([ // ThUU!xt3qJrMRML
        Validators.required
      ])),
    });
  }

  login() {
    this.pressed = true;
    this.authService.login(this.loginForm.value).then(() => {
      this.pressed = false;
      this.navCtrl.navigateRoot('home');
    }).catch(() => {
      this.pressed = false;
    });
  }

}
