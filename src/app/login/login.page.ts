import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../service/firebase';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink]
})
export class LoginPage {
  cpf = ''; senha = '';
  constructor(private fb: FirebaseService, private router: Router, private toast: ToastController) {}

  async onLogin() {
    const user = await this.fb.login(this.cpf, this.senha);
    if (user) {
      localStorage.setItem('userCpf', user.id);
      this.router.navigate(['/home']);
    } else {
      const t = await this.toast.create({ message: 'CPF ou Senha incorretos', duration: 2000, color: 'danger' });
      t.present();
    }
  }
}