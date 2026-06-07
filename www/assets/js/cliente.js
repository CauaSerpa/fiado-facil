import {
    buscarCliente
}
from '../../modules/clientes.js';

import { db }
from '../../database/db.js';

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

function formatDateBR(date)
{
    if (!date) return '';

    const d = new Date(date + 'T00:00:00');

    if (isNaN(d.getTime())) return '';

    return d.toLocaleDateString('pt-BR');
}

function formatPhoneBR(phone)
{
    if (!phone) return '';

    // remove tudo que não é número
    const digits = phone.replace(/\D/g, '');

    // remove código do país se vier (55)
    let d = digits;
    if (d.startsWith('55') && d.length > 11) {
        d = d.slice(2);
    }

    // celular com 9 dígitos
    if (d.length === 11) {
        return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    }

    // fixo com 10 dígitos
    if (d.length === 10) {
        return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    }

    // fallback (caso estranho)
    return phone;
}

export function processarMensagem(
    template = '',
    dados = {}
)
{
    return template
        .replaceAll('{cliente}', dados.cliente ?? '')
        .replaceAll('{valor}', dados.valor ?? '')
        .replaceAll('{comercio}', dados.comercio ?? '')
        .replaceAll('{telefone}', dados.telefone ?? '')
        .replaceAll('{pix}', dados.pix ?? '')
        .replaceAll('{tipo_pix}', dados.tipo_pix ?? '')
        .replaceAll('{ultima_compra}', dados.ultimaCompra ?? '');
}

export async function initCliente(id)
{
    const cliente =
        await buscarCliente(id);

    if(!cliente)
    {
        return;
    }

    const fiados =
        await db.fiados
            .where('clienteId')
            .equals(Number(id))
            .toArray();

    const pagamentos =
        await db.pagamentos
            .where('clienteId')
            .equals(Number(id))
            .toArray();

    const totalFiados =
        fiados.reduce(
            (sum, item) =>
                sum + item.valor,
            0
        );

    const totalPagamentos =
        pagamentos.reduce(
            (sum, item) =>
                sum + item.valor,
            0
        );

    const saldo =
        totalFiados -
        totalPagamentos;

    renderCliente(
        cliente,
        saldo,
        fiados,
        pagamentos
    );
}

function renderCliente(
    cliente,
    saldo,
    fiados,
    pagamentos
)
{
    const nomeBase =
        cliente.apelido ||
        cliente.nome ||
        'C';

    const avatar =
        nomeBase.charAt(0).toUpperCase();

    const temDivida = saldo > 0;

    const headerContainer =
        document.getElementById('page-header');

    if(headerContainer)
    {
        headerContainer.innerHTML =
            `
            <header class="navbar navbar-dark bg-primary">

                <div class="container-fluid">

                    <div class="d-flex align-items-center gap-2">
                        <button class="btn btn-ghost btn-primary text-white p-0" onclick="goBack()">
                            <i class="ti ti-arrow-left"></i>
                        </button>

                        <span
                            id="page-title"
                            class="navbar-brand mb-0 h1">

                            Detalhes do Cliente

                        </span>
                    </div>

                    <div id="page-actions">
                        <button
                            id="btnEditarCliente"
                            class="btn btn-ghost btn-primary btn-icon text-white p-0">

                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil"><path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                <path d="M13.5 6.5l4 4" />
                            </svg>
                            
                        </button>
                    </div>

                </div>

                <div class="p-3 w-100">

                    <div class="d-flex align-items-center">

                        <div
                            class="avatar avatar-xl bg-white text-primary rounded-circle">

                            ${avatar}

                        </div>

                        <div class="ms-3">

                            <h2 class="text-white mb-0">

                                ${
                                    cliente.apelido
                                    ||
                                    cliente.nome
                                }

                            </h2>

                            ${
                                cliente.apelido
                                ?
                                `
                                <div>
                                    ${cliente.nome}
                                </div>
                                `
                                :
                                ''
                            }

                            ${
                                cliente.telefone
                                ?
                                `
                                <div
                                    class="mt-2">

                                    <i
                                        class="ti ti-phone">
                                    </i>

                                    ${formatPhoneBR(cliente.telefone)}

                                </div>
                                `
                                :
                                ''
                            }

                            ${
                                cliente.observacoes
                                ?
                                `
                                <div>

                                    ${cliente.observacoes}

                                </div>
                                `
                                :
                                ''
                            }

                        </div>

                    </div>

                    <div class="card mt-3" style="background: #4299e1;">
                        <div class="card-body text-white">

                            <div
                                class="text-white">

                                Total Devido

                            </div>

                            <h1 class="mb-0">
                                ${formatMoney(saldo)}
                            </h1>

                        </div>
                    </div>

                </div>

            </header>
            `;
    }

    document
        .getElementById(
            'cliente-page'
        )
        .innerHTML =
        `
        <div
            class="row g-2 mt-2 mb-2">

            <div class="col-6 mt-0">

                <button
                    id="btnNovoFiado"
                    class="btn btn-warning w-100">

                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-shopping-cart"><path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M6 2a1 1 0 0 1 .993 .883l.007 .117v1.068l13.071 .935a1 1 0 0 1 .929 1.024l-.01 .114l-1 7a1 1 0 0 1 -.877 .853l-.113 .006h-12v2h10a3 3 0 1 1 -2.995 3.176l-.005 -.176l.005 -.176c.017 -.288 .074 -.564 .166 -.824h-5.342a3 3 0 1 1 -5.824 1.176l-.005 -.176l.005 -.176a3.002 3.002 0 0 1 1.995 -2.654v-12.17h-1a1 1 0 0 1 -.993 -.883l-.007 -.117a1 1 0 0 1 .883 -.993l.117 -.007h2zm0 16a1 1 0 1 0 0 2a1 1 0 0 0 0 -2m11 0a1 1 0 1 0 0 2a1 1 0 0 0 0 -2" />
                    </svg>

                    Novo Fiado

                </button>

            </div>

            <div class="col-6 mt-0">

                <button
                    id="btnWhatsapp"
                    class="btn btn-success w-100" style="background: #25D366; border-color: #25D366;">

                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-brand-whatsapp">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
                        <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
                    </svg>

                    Lembrar

                </button>

            </div>

        </div>

        <button
            id="btnPagamento"
            class="btn ${temDivida ? 'btn-green' : 'btn-secondary disabled'} w-100 mb-3">

            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-cash-banknote-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                <path d="M12.25 18h-7.25a2 2 0 0 1 -2 -2v-8a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4.5" />
                <path d="M18 12h.01" />
                <path d="M6 12h.01" /><path d="M16 19h6" />
                <path d="M19 16v6" />
            </svg>

            Registrar Pagamento

        </button>

        <div
            id="historico">

        </div>
        `;

    document
        .getElementById('btnEditarCliente')
        ?.addEventListener('click', () => {
            window.navigate(`cliente-edit-form?id=${cliente.id}`);
        });

    document
        .getElementById('btnNovoFiado')
        ?.addEventListener('click', () => {
            window.navigate(`cliente-fiado-form?id=${cliente.id}`);
        });

    document
        .getElementById('btnPagamento')
        ?.addEventListener('click', () => {
            window.navigate(`cliente-pagamento-form?id=${cliente.id}`);
        });

    document
        .getElementById('btnWhatsapp')
        ?.addEventListener('click', async () =>
        {
            if (!cliente.telefone)
            {
                alert(
                    'Este cliente não o numero de telefone.'
                );
                return;
            }

            if(saldo <= 0)
            {
                alert(
                    'Este cliente não possui saldo pendente.'
                );

                return;
            }

            const numero =
                cliente.telefone.replace(/\D/g, '');

            if (!numero)
            {
                return;
            }

            const fiadosOrdenados =
                [...fiados].sort((a, b) =>
                {
                    const dataA =
                        a.data
                            ? new Date(a.data).getTime()
                            : 0;

                    const dataB =
                        b.data
                            ? new Date(b.data).getTime()
                            : 0;

                    if(dataA !== dataB)
                    {
                        return dataB - dataA;
                    }

                    return (b.createdAt || 0) -
                        (a.createdAt || 0);
                });

            const ultimaCompra =
                fiadosOrdenados.length
                    ? formatDateBR(fiadosOrdenados[0].data)
                    : 'Não informado';

            const configComercio =
                await db.configuracoes.get('comercio');

            const configMensagem =
                await db.configuracoes.get('mensagem');

            const template =
                configMensagem?.texto ||
                `Olá {cliente} 👋

Consta em nosso sistema um saldo pendente de {valor}.

Caso já tenha realizado o pagamento, desconsidere esta mensagem.`;

            const mensagem =
                processarMensagem(
                    template,
                    {
                        cliente:
                            cliente.apelido || cliente.nome,

                        valor:
                            formatMoney(saldo),

                        comercio:
                            configComercio?.nome || 'Nosso Comércio',

                        telefone:
                            configComercio?.telefone || '',

                        pix:
                            configComercio?.pix || '',

                        tipo_pix:
                            configComercio?.tipo || 'chave',

                        ultimaCompra
                    }
                );

            const url =
                `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`;

            window.open(url, '_blank');
        });

    const historicoContainer =
        document.getElementById('historico');

    if (!historicoContainer) return;

    const itens = [
        ...fiados.map(item => ({
            ...item,
            tipo: 'fiado'
        })),
        ...pagamentos.map(item => ({
            ...item,
            tipo: 'pagamento'
        }))
    ];

    // ordenação segura por data
    itens.sort((a, b) =>
    {
        // 1. ordena por data do evento (fiado/pagamento)
        if (b.data !== a.data) {
            return b.data.localeCompare(a.data);
        }

        // 2. se mesma data, ordena por criação real (mais novo primeiro)
        return (b.createdAt || 0) - (a.createdAt || 0);
    });

    if (itens.length === 0)
    {
        historicoContainer.innerHTML = `
            <div class="text-center text-muted">
                Nenhuma movimentação ainda
            </div>
        `;
        return;
    }

    historicoContainer.innerHTML =
        itens.map(createHistoricoItem).join('');
}

function createHistoricoItem(item)
{
    const isFiado =
        item.tipo === 'fiado';

    return `
        <div class="card mb-2">

            <div class="card-body">

                <div class="text-muted small mb-2">
                    ${formatDateBR(item.data)}
                </div>

                <div
                    class="d-flex justify-content-between">

                    <div class="d-flex">

                        <span class="avatar avatar-lg ${isFiado ? 'bg-warning' : 'bg-success'} text-white me-2">
                            ${
                                isFiado 
                                ? 
                                `
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-shopping-cart"><path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M6 2a1 1 0 0 1 .993 .883l.007 .117v1.068l13.071 .935a1 1 0 0 1 .929 1.024l-.01 .114l-1 7a1 1 0 0 1 -.877 .853l-.113 .006h-12v2h10a3 3 0 1 1 -2.995 3.176l-.005 -.176l.005 -.176c.017 -.288 .074 -.564 .166 -.824h-5.342a3 3 0 1 1 -5.824 1.176l-.005 -.176l.005 -.176a3.002 3.002 0 0 1 1.995 -2.654v-12.17h-1a1 1 0 0 1 -.993 -.883l-.007 -.117a1 1 0 0 1 .883 -.993l.117 -.007h2zm0 16a1 1 0 1 0 0 2a1 1 0 0 0 0 -2m11 0a1 1 0 1 0 0 2a1 1 0 0 0 0 -2" />
                                    </svg>
                                ` 
                                : 
                                `
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-currency-dollar">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2" />
                                        <path d="M12 3v3m0 12v3" />
                                    </svg>
                                `
                            }
                        </span>

                        <div>

                            <div
                                class="fw-bold mb-1">

                                ${
                                    isFiado
                                    ?
                                    'Nova Dívida'
                                    :
                                    'Pagamento'
                                }

                            </div>

                            <div
                                class="text-muted">

                                ${
                                    item.descricao
                                    ||
                                    'Sem descrição'
                                }

                            </div>

                        </div>

                    </div>

                    <div class="text-end">

                        <div
                            class="h4 mb-1 ${
                                isFiado
                                ?
                                'text-danger'
                                :
                                'text-success'
                            }">

                            ${
                                isFiado
                                ?
                                '+'
                                :
                                '-'
                            }

                            ${formatMoney(item.valor)}

                        </div>

                        <a
                            class="text-secondary fw-bold">

                            Ver detalhes

                        </a>

                    </div>

                </div>

            </div>

        </div>
    `;
}