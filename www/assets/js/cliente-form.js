import { db }
from '../../database/db.js';

import { criarCliente, buscarCliente }
from '../../modules/clientes.js';

function formatPhone(value)
{
    const numbers =
        value.replace(/\D/g, '').substring(0, 11);

    if(numbers.length <= 2)
    {
        return numbers.length
            ? `(${numbers}`
            : '';
    }

    if(numbers.length <= 10)
    {
        const ddd = numbers.substring(0, 2);
        const first = numbers.substring(2, 6);
        const second = numbers.substring(6);

        let result = `(${ddd})`;

        if(first)
        {
            result += ` ${first}`;
        }

        if(second)
        {
            result += `-${second}`;
        }

        return result;
    }

    const ddd = numbers.substring(0, 2);
    const first = numbers.substring(2, 7);
    const second = numbers.substring(7);

    let result = `(${ddd}) ${first}`;

    if(second)
    {
        result += `-${second}`;
    }

    return result;
}

function setFieldValid(input)
{
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
}

function setFieldInvalid(input)
{
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
}

function clearFieldValidation(input)
{
    input.classList.remove(
        'is-valid',
        'is-invalid'
    );
}

export function initClienteForm()
{
    const btn =
        document.getElementById(
            'btnSalvarCliente'
        );

    if(!btn)
    {
        return;
    }

    const nomeInput =
        document.getElementById(
            'nome'
        );

    const telefoneInput =
        document.getElementById(
            'telefone'
        );

    nomeInput?.addEventListener(
        'input',
        () =>
        {
            clearFieldValidation(
                nomeInput
            );
        }
    );

    telefoneInput?.addEventListener(
        'input',
        e =>
        {
            e.target.value =
                formatPhone(
                    e.target.value
                );

            clearFieldValidation(
                telefoneInput
            );
        }
    );

    btn.addEventListener(
        'click',
        async () =>
        {
            let hasError = false;

            const nome =
                nomeInput.value.trim();

            const telefone =
                telefoneInput.value
                    .replace(/\D/g, '');

            /*
             * Nome obrigatório
             */

            if(!nome)
            {
                setFieldInvalid(
                    nomeInput
                );

                hasError = true;
            }
            else
            {
                setFieldValid(
                    nomeInput
                );
            }

            /*
             * Telefone opcional
             * Mas se informado,
             * deve ser válido
             */

            if(
                telefone &&
                telefone.length !== 10 &&
                telefone.length !== 11
            )
            {
                setFieldInvalid(
                    telefoneInput
                );

                hasError = true;
            }
            else if(telefone)
            {
                setFieldValid(
                    telefoneInput
                );
            }
            else
            {
                clearFieldValidation(
                    telefoneInput
                );
            }

            if(hasError)
            {
                return;
            }

            const clienteId =
                await criarCliente({
                    nome,

                    apelido:
                        document
                            .getElementById(
                                'apelido'
                            )
                            .value
                            .trim(),

                    telefone,

                    observacoes:
                        document
                            .getElementById(
                                'observacoes'
                            )
                            .value
                            .trim()
                });

            window.navigate(
                `feedback?type=success&msg=${encodeURIComponent('Cliente salvo com sucesso')}&redirect=${encodeURIComponent('cliente?id=' + clienteId)}`
            );
        }
    );
}

export async function initClienteEdit(clienteId)
{
    const cliente = await buscarCliente(clienteId);

    if (!cliente) return;

    // preencher campos
    document.getElementById('nome').value = cliente.nome || '';
    document.getElementById('apelido').value = cliente.apelido || '';
    document.getElementById('telefone').value = cliente.telefone || '';
    document.getElementById('observacoes').value = cliente.observacoes || '';

    const btn =
        document.getElementById(
            'btnSalvarCliente'
        );

    if(!btn)
    {
        return;
    }

    const nomeInput =
        document.getElementById(
            'nome'
        );

    const telefoneInput =
        document.getElementById(
            'telefone'
        );

    nomeInput?.addEventListener(
        'input',
        () =>
        {
            clearFieldValidation(
                nomeInput
            );
        }
    );

    telefoneInput?.addEventListener(
        'input',
        e =>
        {
            e.target.value =
                formatPhone(
                    e.target.value
                );

            clearFieldValidation(
                telefoneInput
            );
        }
    );

    btn.addEventListener('click', async () =>
    {
        let hasError = false;

        const nome = document.getElementById('nome').value.trim();
        const apelido = document.getElementById('apelido').value.trim();
        const telefone = document.getElementById('telefone').value.replace(/\D/g, '');
        const observacoes = document.getElementById('observacoes').value.trim();

        /*
            * Nome obrigatório
            */

        if(!nome)
        {
            setFieldInvalid(
                nomeInput
            );

            hasError = true;
        }
        else
        {
            setFieldValid(
                nomeInput
            );
        }

        /*
            * Telefone opcional
            * Mas se informado,
            * deve ser válido
            */

        if(
            telefone &&
            telefone.length !== 10 &&
            telefone.length !== 11
        )
        {
            setFieldInvalid(
                telefoneInput
            );

            hasError = true;
        }
        else if(telefone)
        {
            setFieldValid(
                telefoneInput
            );
        }
        else
        {
            clearFieldValidation(
                telefoneInput
            );
        }

        if(hasError)
        {
            return;
        }

        await db.clientes.update(Number(clienteId), {
            nome,
            apelido,
            telefone,
            observacoes
        });

        window.navigate(
            `feedback?type=success&msg=${encodeURIComponent('Cliente editado com sucesso')}&redirect=${encodeURIComponent('cliente?id=' + clienteId)}`
        );
    });

    // DELETAR
    document.getElementById('btnDeletarCliente').addEventListener('click', async () =>
    {
        const confirmacao = confirm(
            'Tem certeza que deseja deletar este cliente?\n\n' +
            'Todos os fiados e pagamentos também serão removidos.'
        );

        if (!confirmacao) return;

        // remove fiados e pagamentos relacionados
        await db.fiados.where('clienteId').equals(Number(clienteId)).delete();
        await db.pagamentos.where('clienteId').equals(Number(clienteId)).delete();

        // remove cliente
        await db.clientes.delete(Number(clienteId));

        window.navigate?.('home');
    });
}