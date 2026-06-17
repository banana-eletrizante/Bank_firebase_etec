import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../service/firebase';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

@Component({
  selector: 'app-metas',
  templateUrl: './metas.page.html',
  styleUrls: ['./metas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink]
})
export class MetasPage implements OnInit {
  public metas: any[] = [];
  public idCliente: string = '';

  constructor(
    private fb: FirebaseService, 
    private alertCtrl: AlertController, 
    private toastCtrl: ToastController,
    private router: Router
  ) {
    addIcons(allIcons);
  }

  ngOnInit() {
    const cpf = localStorage.getItem('userCpf');
    if (!cpf) {
      this.router.navigate(['/login']);
    } else {
      this.idCliente = cpf;
      this.carregarMetas();
    }
  }

  carregarMetas() {
    this.fb.escutarMetas(this.idCliente, (dados: any[]) => {
      this.metas = dados;
    });
  }

  async abrirModalMeta() {
    const alert = await this.alertCtrl.create({
      header: 'Nova Meta',
      subHeader: 'O que você deseja conquistar?',
      inputs: [
        {
          name: 'titulo',
          type: 'text',
          placeholder: 'Ex: Viagem, Carro, Notebook'
        },
        {
          name: 'alvo',
          type: 'number',
          placeholder: 'Valor Alvo (R$)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Criar',
          handler: (data) => {
            const valorAlvo = parseFloat(data.alvo);
            if (!data.titulo || isNaN(valorAlvo) || valorAlvo <= 0) {
              this.exibirToast('Preencha os campos corretamente!', 'warning');
              return false;
            }
            this.salvarMeta(data.titulo, valorAlvo);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async salvarMeta(titulo: string, alvo: number) {
    try {
      await this.fb.adicionarMeta(this.idCliente, {
        titulo: titulo,
        alvo: alvo,
        atual: 0
      });
      this.exibirToast('Meta criada com sucesso!', 'success');
    } catch (e) {
      this.exibirToast('Erro ao salvar meta.', 'danger');
    }
  }
  
  async excluirMeta(id: string) {
    try {
      await this.fb.excluirMeta(this.idCliente, id);
      this.exibirToast('Meta removida!', 'warning');
    } catch (e) {
      this.exibirToast('Erro ao excluir.', 'danger');
    }
  }

  async exibirToast(msg: string, cor: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: cor,
      position: 'bottom'
    });
    toast.present();
  }
}
