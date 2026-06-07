export async function calcularSaldo(clienteId)
{
    const fiados = await db.fiados
        .where('clienteId')
        .equals(clienteId)
        .toArray();

    const pagamentos = await db.pagamentos
        .where('clienteId')
        .equals(clienteId)
        .toArray();

    const totalFiados =
        fiados.reduce((s,f)=>s+f.valor,0);

    const totalPagamentos =
        pagamentos.reduce((s,p)=>s+p.valor,0);

    return totalFiados - totalPagamentos;
}