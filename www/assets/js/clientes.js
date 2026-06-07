import { db }
from '../../database/db.js';

import { listarClientes }
from '../../modules/clientes.js';

import { createClientCard }
from '../../components/client-card.js';

function normalizeText(text)
{
    return (text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

export async function initClientes()
{
    const clientsList =
        document.getElementById(
            'clientsList'
        );

    if(!clientsList)
    {
        return;
    }

    const clientes =
        await listarClientes();

    if(clientes.length === 0)
    {
        clientsList.innerHTML =
            `
            <div
                class="card">

                <div
                    class="card-body text-center">

                    <i
                        class="ti ti-users fs-1 text-muted">
                    </i>

                    <h3 class="mt-2">
                        Nenhum cliente
                    </h3>

                    <p class="text-muted mb-0">
                        Cadastre seu primeiro cliente.
                    </p>

                </div>

            </div>
            `;

        return;
    }

    const clientesComSaldo = await Promise.all(
        clientes.map(async (cliente) =>
        {
            const fiados = await db.fiados
                .where('clienteId')
                .equals(Number(cliente.id))
                .toArray();

            const pagamentos = await db.pagamentos
                .where('clienteId')
                .equals(Number(cliente.id))
                .toArray();

            const totalFiado = fiados.reduce((a, b) => a + b.valor, 0);
            const totalPago = pagamentos.reduce((a, b) => a + b.valor, 0);

            const saldo = totalFiado - totalPago;

            return {
                cliente,
                saldo
            };
        })
    );

    clientsList.innerHTML =
        clientesComSaldo
            .map(({ cliente, saldo }) =>
                createClientCard(cliente, saldo)
            )
            .join('') +
            `
            <div class="text-center text-muted mt-3 mb-2">
                Fim da lista
            </div>
            `;

    document
        .querySelectorAll(
            '.client-item'
        )
        .forEach(item =>
        {
            item.addEventListener(
                'click',
                () =>
                {
                    const id =
                        item.dataset.id;

                    window.navigate?.(
                        `cliente?id=${id}`
                    );
                }
            );
        });

    const searchInput =
        document.getElementById(
            'searchClient'
        );

    searchInput?.addEventListener(
        'input',
        async e =>
        {
            const termo =
                normalizeText(
                    e.target.value
                );

            const filtrados =
                clientes.filter(
                    cliente =>
                    {
                        const nome =
                            normalizeText(
                                cliente.nome
                            );

                        const apelido =
                            normalizeText(
                                cliente.apelido
                            );

                        return (
                            nome.includes(
                                termo
                            )
                            ||
                            apelido.includes(
                                termo
                            )
                        );
                    }
                );

            clientsList.innerHTML =
                filtrados
                    .map(
                        cliente =>
                            createClientCard(
                                cliente
                            )
                    )
                    .join('') +
                    `
                    <div class="text-center text-muted mt-3 mb-2">
                        Fim da lista
                    </div>
                    `;
        }
    );
}