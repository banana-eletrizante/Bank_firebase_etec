import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';
import { FirebaseService } from '../service/firebase';

@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.page.html',
  styleUrls: ['./configuracoes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink]
})
export class ConfiguracoesPage implements OnInit {
  public usuario: any = { nome: '...', cpf: '...', idade: 0 };

  constructor(
    private fb: FirebaseService, 
    private router: Router,
    private alertCtrl: AlertController
  ) {
    addIcons(allIcons);
  }

  ngOnInit() {
    const cpf = localStorage.getItem('userCpf');
    if (!cpf) {
      this.router.navigate(['/login']);
    } else {
      this.fb.escutarUsuarioLogado(cpf, (dados: any) => {
        this.usuario = dados;
      });
    }
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Sair',
      message: 'Deseja realmente sair da conta?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sair',
          cssClass: 'danger',
          handler: () => {
            localStorage.removeItem('userCpf');
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }
}
