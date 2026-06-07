import { db } from '../../database/db.js';

export async function initDashboard()
{
    await carregarDashboard();
}

async function carregarDashboard()
{
    const totalClientes =
        await db.clientes.count();

    const fiados =
        await db.fiados.toArray();

    const pagamentos =
        await db.pagamentos.toArray();

    const totalFiados =
        fiados.reduce(
            (total, item) =>
                total + Number(item.valor || 0),
            0
        );

    const totalPagamentos =
        pagamentos.reduce(
            (total, item) =>
                total + Number(item.valor || 0),
            0
        );

    const saldoAberto =
        totalFiados - totalPagamentos;

    document.getElementById(
        'totalClientes'
    ).textContent =
        totalClientes;

    document.getElementById(
        'totalAberto'
    ).textContent =
        formatMoney(
            saldoAberto
        );
}

function formatMoney(valor)
{
    return valor.toLocaleString(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL'
        }
    );
}