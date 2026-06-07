import { db } from '../../database/db.js';

async function exportarBanco()
{
    // try
    // {
    //     const backup =
    //     {
    //         versao: 1,
    //         dataExportacao: new Date().toISOString(),

    //         clientes:
    //             await db.clientes.toArray(),

    //         fiados:
    //             await db.fiados.toArray(),

    //         pagamentos:
    //             await db.pagamentos.toArray()
    //     };

    //     const json =
    //         JSON.stringify(
    //             backup,
    //             null,
    //             2
    //         );

    //     const blob =
    //         new Blob(
    //             [json],
    //             {
    //                 type: 'application/json'
    //             }
    //         );

    //     const url =
    //         URL.createObjectURL(blob);

    //     const a =
    //         document.createElement('a');

    //     a.href = url;

    //     a.download =
    //         `fiado-simples-backup-${new Date()
    //             .toISOString()
    //             .slice(0, 10)}.json`;

    //     document.body.appendChild(a);

    //     a.click();

    //     document.body.removeChild(a);

    //     URL.revokeObjectURL(url);

    //     return true;
    // }
    // catch(error)
    // {
    //     alert(
    //         'Ocorreu um erro ao exportar o banco de dados.'
    //     );

    //     console.error(
    //         'Erro ao exportar banco:',
    //         error
    //     );

    //     throw error;
    // }
}

async function importarBanco(file)
{
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data) {
        alert('Arquivo inválido');
        return;
    }

    const confirmar = confirm(
        'Isso irá MESCLAR os dados no banco. Deseja continuar?'
    );

    if (!confirmar) return;

    if (data.clientes)
        await db.clientes.bulkPut(data.clientes);

    if (data.fiados)
        await db.fiados.bulkPut(data.fiados);

    if (data.pagamentos)
        await db.pagamentos.bulkPut(data.pagamentos);

    alert('Importação concluída!');
}

async function resetBanco()
{
    const confirmar = confirm(
        'ATENÇÃO: Isso vai apagar TODOS os dados do sistema. Deseja continuar?'
    );

    if (!confirmar) return;

    await db.delete();
    await db.open();

    alert('Banco resetado com sucesso!');
}

export function initConfiguracoes()
{
    document.getElementById('btnExportar')
        .addEventListener('click', exportarBanco);

    document.getElementById('btnImportar')
        .addEventListener('click', () =>
        {
            document.getElementById('fileInput').click();
        });

    document.getElementById('fileInput')
        .addEventListener('change', (e) =>
        {
            const file = e.target.files[0];
            if (file) importarBanco(file);
        });

    document.getElementById('btnReset')
        .addEventListener('click', resetBanco);
}