import { db } from '../../database/db.js';

function formatMoney(valor)
{
    return (Number(valor) || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function parseMoney(value)
{
    return Number(
        value
            .replace(/\D/g, '')
    ) / 100;
}

function setFieldInvalid(input, message)
{
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');

    const el =
        document.getElementById('valorError');

    if(el && message)
    {
        el.textContent = message;
    }
}

export async function initPagamentoForm(clienteId)
{
    const cliente = await db.clientes.get(Number(clienteId));

    document
        .getElementById('btnBack')
        ?.setAttribute(
            'onClick',
            `window.navigate('cliente?id=${cliente.id}')`
        );

    const fiados = await db.fiados.where('clienteId').equals(Number(clienteId)).toArray();
    const pagamentos = await db.pagamentos.where('clienteId').equals(Number(clienteId)).toArray();

    const totalFiado = fiados.reduce((a, b) => a + b.valor, 0);
    const totalPago = pagamentos.reduce((a, b) => a + b.valor, 0);
    const totalAberto = totalFiado - totalPago;

    document.getElementById('clienteAvatar').textContent =
        cliente.apelido?.charAt(0) || cliente.nome.charAt(0);

    document.getElementById('clienteNome').textContent =
        cliente.apelido || cliente.nome;

    document.getElementById('cliente').textContent =
        cliente.apelido || cliente.nome;

    document.getElementById('totalAberto').textContent =
        formatMoney(totalAberto);

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
    const restanteInput = document.getElementById('restante');

    function validarValor()
    {
        valorInput.classList.remove('is-invalid', 'is-valid');

        const valor =
            parseMoney(valorInput.value);

        if(!valor || valor <= 0)
        {
            setFieldInvalid(
                valorInput,
                'Informe um valor maior que zero.'
            );
            return false;
        }

        if(valor > totalAberto)
        {
            setFieldInvalid(
                valorInput,
                'Valor não pode ser maior que o valor em aberto.'
            );

            return false;
        }

        return true;
    }

    function atualizar()
    {
        const valor = parseMoney(valorInput.value);

        const restante = totalAberto - valor;

        restanteInput.textContent = formatMoney(restante > 0 ? restante : 0);
        if (restante === 0) {
            restanteInput.classList.remove('text-warning');
            restanteInput.classList.add('text-success');
        }

        validarValor();
    }

    valorInput.addEventListener('input', e =>
    {
        let v = e.target.value.replace(/\D/g, '');

        if (!v)
        {
            e.target.value = '';
            atualizar();
            return;
        }

        v = (Number(v) / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        e.target.value = v;

        atualizar();
    });

    document.getElementById('btnTotal').addEventListener('click', () =>
    {
        valorInput.value = formatMoney(totalAberto);
        atualizar();
    });

    document.getElementById('btnSalvar').addEventListener('click', async () =>
    {
        const valor = parseMoney(valorInput.value);

        if(!validarValor())
        {
            valorInput.focus();
            return;
        }

        await db.pagamentos.add({
            clienteId: Number(clienteId),
            valor,
            data: dataInput.value,
            forma: document.getElementById('forma').value,
            descricao: document.getElementById('descricao').value.trim(),
            createdAt: Date.now()
        });

        window.navigate(
            `feedback?type=success&msg=${encodeURIComponent('Pagamento cadastrado com sucesso')}&redirect=${encodeURIComponent('cliente?id=' + clienteId)}`
        );
    });
}