import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';
import { FirebaseService } from '../service/firebase';

@Component({
  selector: 'app-transacoes',
  templateUrl: './transacoes.page.html',
  styleUrls: ['./transacoes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink]
})
export class TransacoesPage implements OnInit {
  // Variáveis para a interface
  public transacoes: any[] = [];
  public receitaTotal: number = 0;
  public despesaTotal: number = 0;
  public idCliente: string = '';

  constructor(
    private fb: FirebaseService,
    private router: Router
  ) {
    // Registrar ícones usados na lista de extrato e no menu inferior
    addIcons({
      'speedometer-outline': allIcons.speedometerOutline,
      'wallet-outline': allIcons.walletOutline,
      'pie-chart-outline': allIcons.pieChartOutline,
      'settings-outline': allIcons.settingsOutline,
      'cash-outline': allIcons.cashOutline, // Ícone para receitas
      'cart-outline': allIcons.cartOutline,   // Ícone para despesas
      'arrow-up-circle-outline': allIcons.arrowUpCircleOutline,
      'arrow-down-circle-outline': allIcons.arrowDownCircleOutline
    });
  }

  ngOnInit() {
    this.verificarAcesso();
  }

  // Garante que o usuário está logado antes de carregar os dados
  verificarAcesso() {
    const cpfLogado = localStorage.getItem('userCpf');

    if (!cpfLogado) {
      this.router.navigate(['/login']);
    } else {
      this.idCliente = cpfLogado;
      this.carregarHistorico();
    }
  }

  // Busca as transações da sub-coleção no Firebase
  carregarHistorico() {
    this.fb.escutarTransacoes(this.idCliente, (dados: any[]) => {
      this.transacoes = dados;
      this.calcularResumo();
    });
  }

  // Soma os valores de acordo com o tipo (receita ou despesa)
  calcularResumo() {
    this.receitaTotal = 0;
    this.despesaTotal = 0;

    this.transacoes.forEach(t => {
      const valor = parseFloat(t.valor || 0);
      
      if (t.tipo === 'receita') {
        this.receitaTotal += valor;
      } else if (t.tipo === 'despesa') {
        this.despesaTotal += valor;
      }
    });
  }

  // Função para formatar a cor do texto no HTML de forma dinâmica
  getColor(tipo: string) {
    return tipo === 'receita' ? 'success' : 'danger';
  }
}
