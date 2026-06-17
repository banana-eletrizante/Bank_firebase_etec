import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonicModule, 
  ToastController, 
  LoadingController 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';
import { FirebaseService } from '../service/firebase';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink]
})
export class HomePage implements OnInit {
  // Variáveis da interface
  public idCliente: string = '';
  public nome: string = 'Carregando...';
  public saldo: number = 0;
  public receita: number = 0;

  constructor(
    private fb: FirebaseService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    // Registra os ícones usados no Dashboard e no TabBar
    addIcons({
      'speedometer-outline': allIcons.speedometerOutline,
      'wallet-outline': allIcons.walletOutline,
      'pie-chart-outline': allIcons.pieChartOutline,
      'settings-outline': allIcons.settingsOutline,
      'cash-outline': allIcons.cashOutline,
      'cart-outline': allIcons.cartOutline,
      'checkmark-circle-outline': allIcons.checkmarkCircleOutline,
      'alert-circle-outline': allIcons.alertCircleOutline
    });
  }

  ngOnInit() {
    this.verificarLogin();
  }

  // Verifica se existe um CPF salvo no navegador
  verificarLogin() {
    const cpfLogado = localStorage.getItem('userCpf');

    if (!cpfLogado) {
      this.router.navigate(['/login']);
    } else {
      this.carregarDados(cpfLogado);
    }
  }

  // Escuta os dados do Firebase em tempo real
  carregarDados(cpf: string) {
    this.fb.escutarUsuarioLogado(cpf, (usuario: any) => {
      if (usuario) {
        this.idCliente = usuario.id;
        this.nome = usuario.nome;
        this.saldo = usuario.saldo || 0;
        this.receita = usuario.receita || 0;
      }
    });
  }

  // Lógica de Saque e Depósito
  async executarOperacao(tipo: string, input: any) {
    const valor = parseFloat(input.value);

    // Validação básica
    if (!valor || valor <= 0) {
      this.exibirMensagem('Insira um valor válido para continuar.', 'warning');
      return;
    }

    if (tipo === 'saque' && valor > this.saldo) {
      this.exibirMensagem('Saldo insuficiente para realizar este saque.', 'danger');
      return;
    }

    // Calcula os novos valores
    let novoSaldo = this.saldo;
    let novaReceita = this.receita;

    if (tipo === 'saque') {
      novoSaldo -= valor;
    } else {
      novoSaldo += valor;
      novaReceita += valor; // Aumenta a receita total em caso de depósito
    }

    // Prepara o objeto da transação para o histórico (Extrato)
    const dadosTransacao = {
      titulo: tipo === 'deposito' ? 'Depósito Recebido' : 'Pagamento Realizado',
      valor: valor,
      tipo: tipo === 'deposito' ? 'receita' : 'despesa',
      icon: tipo === 'deposito' ? 'cash-outline' : 'cart-outline',
      color: tipo === 'deposito' ? 'success' : 'danger',
      data: new Date().toLocaleDateString('pt-BR')
    };

    const loading = await this.loadingController.create({ message: 'Processando...' });
    await loading.present();

    try {
      // Atualiza saldo e grava histórico no Firebase simultaneamente
      await this.fb.realizarMovimentacao(this.idCliente, novoSaldo, dadosTransacao);
      
      // Limpa o campo de input
      input.value = '';

      this.exibirMensagem(`${tipo === 'deposito' ? 'Depósito' : 'Saque'} concluído com sucesso!`, 'success');
    } catch (error) {
      console.error(error);
      this.exibirMensagem('Erro ao processar operação. Tente novamente.', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // Função auxiliar para exibir Toasts (mensagens na tela)
  async exibirMensagem(msg: string, cor: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: cor,
      position: 'bottom',
      icon: cor === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'
    });
    toast.present();
  }
}
