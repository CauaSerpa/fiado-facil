function formatMoney(valor)
{
    return (Number(valor) || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

export function createClientCard(cliente, saldo)
{
    const nomeExibicao =
        cliente.apelido?.trim()
        ||
        cliente.nome?.trim()
        ||
        'Sem nome';

    return `
        <a
            href="#"
            class="list-group-item list-group-item-action client-item"
            data-id="${cliente.id}">

            <div class="d-flex align-items-center">

                <span class="avatar avatar-lg rounded-circle bg-primary text-white">

                    ${nomeExibicao
                        ?.charAt(0)
                        ?.toUpperCase()
                        || '?'}

                </span>

                <div class="flex-grow-1 ms-3">

                    <div class="fw-bold">

                        ${nomeExibicao}

                    </div>

                    ${
                        cliente.apelido
                            ? `
                            <small class="text-muted">
                                ${cliente.nome}
                            </small>
                            `
                            : ''
                    }

                </div>

                <div class="text-end">

                    <div
                        class="fw-bold ${saldo > 0 ? 'text-danger' : 'text-success'}">

                        ${formatMoney(saldo)}

                    </div>

                    <i
                        class="ti ti-chevron-right">
                    </i>

                </div>

            </div>

        </a>
    `;
}