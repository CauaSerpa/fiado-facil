export const db = new Dexie('fiado_simples');

db.version(1).stores({
    clientes: '++id,nome,apelido,telefone,observacoes,createdAt',
    fiados: '++id,clienteId,valor,data,descricao,createdAt',
    pagamentos: '++id,clienteId,valor,data,descricao,createdAt',

    configuracoes: 'chave'
});