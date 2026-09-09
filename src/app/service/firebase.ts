import { Injectable } from '@angular/core';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore, collection, addDoc, onSnapshot,
  query, Firestore, doc, updateDoc, orderBy, getDoc, setDoc, deleteDoc
} from 'firebase/firestore';
import { environment } from '../../environments/environment';

const firebaseConfig = environment.firebase;

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  private db: Firestore = getFirestore(this.app);

  async cadastrarCliente(dados: any) {
    const cpfLimpo = dados.cpf.replace(/\D/g, '');
    const docRef = doc(this.db, 'cliente', cpfLimpo);
    const snap = await getDoc(docRef);
    if (snap.exists()) throw new Error("CPF já cadastrado.");

    return await setDoc(docRef, {
      nome: dados.nome,
      cpf: cpfLimpo,
      idade: dados.idade,
      senha: dados.senha,
      saldo: 0,
      receita: 0,
      data_criacao: new Date().toISOString()
    });
  }

  async login(cpf: string, senha: string): Promise<any> {
    const cpfLimpo = cpf.replace(/\D/g, '');
    const docRef = doc(this.db, 'cliente', cpfLimpo);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data()['senha'] === senha) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  escutarUsuarioLogado(cpf: string, callback: any) {
    const docRef = doc(this.db, 'cliente', cpf);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) callback({ id: doc.id, ...doc.data() });
    });
  }

  async realizarMovimentacao(clienteId: string, novoSaldo: number, transacao: any) {
    const docRef = doc(this.db, 'cliente', clienteId);
    await updateDoc(docRef, { saldo: novoSaldo });
    const transacoesRef = collection(this.db, 'cliente', clienteId, 'transacoes');
    await addDoc(transacoesRef, { ...transacao, data_iso: new Date().toISOString() });
  }

  escutarTransacoes(clienteId: string, callback: any) {
    const q = query(collection(this.db, 'cliente', clienteId, 'transacoes'), orderBy('data_iso', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }

  async adicionarMeta(clienteId: string, meta: any) {
    const colRef = collection(this.db, 'cliente', clienteId, 'metas');
    return await addDoc(colRef, { ...meta, data_criacao: new Date().toISOString() });
  }

  escutarMetas(clienteId: string, callback: any) {
    const colRef = collection(this.db, 'cliente', clienteId, 'metas');
    const q = query(colRef, orderBy('data_criacao', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }

  async excluirMeta(clienteId: string, metaId: string) {
    const docRef = doc(this.db, 'cliente', clienteId, 'metas', metaId);
    return await deleteDoc(docRef);
  }
}
