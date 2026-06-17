import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FirebaseService } from '../service/firebase';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CadastroPage {
  dados = { nome: '', cpf: '', idade: null, senha: '', confirma: '' };
  constructor(private fb: FirebaseService, private router: Router, private toast: ToastController) {}

  async onCadastrar() {
    if (this.dados.idade! < 18) return this.msg('Apenas para maiores de 18 anos', 'danger');
    if (this.dados.senha !== this.dados.confirma) return this.msg('Senhas não coincidem', 'danger');
    try {
      await this.fb.cadastrarCliente(this.dados);
      await this.msg('Conta criada!', 'success');
      this.router.navigate(['/login']);
    } catch (e: any) { this.msg(e.message, 'danger'); }
  }

  async msg(m: string, c: string) {
    const t = await this.toast.create({ message: m, duration: 2500, color: c });
    t.present();
  }
}