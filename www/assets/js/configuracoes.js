import { db } from '../../database/db.js';
import { exportarBanco } from './backup.js';

// async function exportarBanco() {

//     try {

//         const dados = {

//             versao: 1,

//             data_exportacao: new Date().toISOString(),

//             clientes: await db.clientes.toArray(),

//             fiados: await db.fiados.toArray()

//         };

//         const json = JSON.stringify(
//             dados,
//             null,
//             2
//         );

//         const nomeArquivo =
//             `backup-fiado-simples-${Date.now()}.json`;

//         await Filesystem.writeFile({

//             path: nomeArquivo,

//             data: json,

//             directory: Directory.Documents,

//             encoding: Encoding.UTF8

//         });

//         const arquivo = await Filesystem.getUri({

//             path: nomeArquivo,

//             directory: Directory.Documents

//         });

//         await Share.share({

//             title: 'Backup Fiado Simples',

//             text: 'Backup do banco de dados',

//             url: arquivo.uri

//         });

//     } catch (erro) {

//         console.error(erro);

//         alert(
//             'Erro ao exportar backup'
//         );

//     }

// }

async function importarBanco(file)
{
    // const text = await file.text();
    // const data = JSON.parse(text);

    // if (!data) {
    //     alert('Arquivo inválido');
    //     return;
    // }

    // const confirmar = confirm(
    //     'Isso irá MESCLAR os dados no banco. Deseja continuar?'
    // );

    // if (!confirmar) return;

    // if (data.clientes)
    //     await db.clientes.bulkPut(data.clientes);

    // if (data.fiados)
    //     await db.fiados.bulkPut(data.fiados);

    // if (data.pagamentos)
    //     await db.pagamentos.bulkPut(data.pagamentos);

    // alert('Importação concluída!');
}

async function resetBanco()
{
    // const confirmar = confirm(
    //     'ATENÇÃO: Isso vai apagar TODOS os dados do sistema. Deseja continuar?'
    // );

    // if (!confirmar) return;

    // await db.delete();
    // await db.open();

    // alert('Banco resetado com sucesso!');
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