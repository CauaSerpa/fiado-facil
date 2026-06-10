import { db } from '../../database/db.js';
import { listarClientes } from '../../modules/clientes.js';
import { createClientCard } from '../../components/client-card.js';

function normalizeText(text) {
    return (text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

export async function initClientes() {

    const clientsList = document.getElementById('clientsList');
    const searchInput = document.getElementById('searchClient');

    if (!clientsList) return;

    let clientes = await listarClientes();

    async function calcularClientesComSaldo(lista) {
        return await Promise.all(
            lista.map(async (cliente) => {

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

                return { cliente, saldo };
            })
        );
    }

    function bindClicks() {
        document.querySelectorAll('.client-item')
            .forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.dataset.id;
                    window.navigate?.(`cliente?id=${id}`);
                });
            });
    }

    function render(listaComSaldo) {

        if (listaComSaldo.length === 0) {
            clientsList.innerHTML = `
                <div class="card">
                    <div class="card-body text-center">
                        <i class="ti ti-users fs-1 text-muted"></i>
                        <h3 class="mt-2">Nenhum cliente</h3>
                        <p class="text-muted mb-0">Nenhum resultado encontrado.</p>
                    </div>
                </div>
            `;
            return;
        }

        clientsList.innerHTML =
            listaComSaldo
                .map(({ cliente, saldo }) =>
                    createClientCard(cliente, saldo)
                )
                .join('') +
            `
            <div class="text-center text-muted mt-3 mb-2">
                Fim da lista
            </div>
            `;

        bindClicks();
    }

    // render inicial
    const initialData = await calcularClientesComSaldo(clientes);
    render(initialData);

    // search
    searchInput?.addEventListener('input', async (e) => {

        const termo = normalizeText(e.target.value);

        const filtrados = clientes.filter(cliente => {
            const nome = normalizeText(cliente.nome);
            const apelido = normalizeText(cliente.apelido);

            return nome.includes(termo) || apelido.includes(termo);
        });

        const data = await calcularClientesComSaldo(filtrados);

        render(data);
    });
}