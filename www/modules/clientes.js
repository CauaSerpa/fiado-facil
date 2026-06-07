import { db } from '../database/db.js';
import { createClientCard } from '../components/client-card.js';

export async function criarCliente(data)
{
    return await db.clientes.add({
        nome: data.nome,
        apelido: data.apelido || '',
        telefone: data.telefone || '',
        observacoes: data.observacoes || '',
        createdAt: new Date().toISOString()
    });
}

export async function buscarCliente(id)
{
    return await db.clientes.get(Number(id));
}

export async function listarClientes()
{
    return await db.clientes.toArray();
}