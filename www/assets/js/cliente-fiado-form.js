import { db } from '../../database/db.js';

function setFieldInvalid(input)
{
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
}

export async function initFiadoForm(clienteId)
{
    const cliente = await db.clientes.get(Number(clienteId));

    document
        .getElementById('btnBack')
        ?.setAttribute(
            'onClick',
            `window.navigate('cliente?id=${cliente.id}')`
        );

    document.getElementById('clienteAvatar').textContent =
        cliente.apelido?.charAt(0) || cliente.nome.charAt(0);

    document.getElementById('clienteNome').textContent =
        cliente.apelido || cliente.nome;

    document.getElementById('cliente').textContent =
        cliente.apelido || cliente.nome;

    const dataInput = document.getElementById('data');

    const hoje = new Date();
    const dataLocal = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate()
    ).toISOString().split('T')[0];

    dataInput.value = dataLocal;
    dataInput.max = dataLocal;

    const valorInput = document.getElementById('valor');

    valorInput.addEventListener('input', e =>
    {
        let v = e.target.value.replace(/\D/g, '');
        v = (Number(v) / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        e.target.value = v;
    });

    document.getElementById('btnSalvar').addEventListener('click', async () =>
    {
        const valor = Number(valorInput.value.replace(/\D/g, '')) / 100;

        if (!valor || valor <= 0)
        {
            setFieldInvalid(valorInput);
            valorInput.focus();
            return;
        }

        await db.fiados.add({
            clienteId: Number(clienteId),
            valor,
            data: dataInput.value,
            descricao: document.getElementById('descricao').value,
            createdAt: Date.now()
        });

        window.location.href =
            `/feedback.html?type=success&msg=Fiado cadastrado com sucesso&redirect=cliente?id=${clienteId}`;
    });
}