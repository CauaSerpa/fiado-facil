import { db } from '../../database/db.js';

export async function exportarBanco() {

    try {

        const Filesystem =
            window.Capacitor.Plugins.Filesystem;

        const Share =
            window.Capacitor.Plugins.Share;

        const backup = {

            clientes:
                await db.clientes.toArray(),

            fiados:
                await db.fiados.toArray(),

            pagamentos:
                await db.pagamentos.toArray(),

            configuracoes:
                await db.configuracoes.toArray(),

            exportadoEm:
                new Date().toISOString()

        };

        const json =
            JSON.stringify(
                backup,
                null,
                2
            );

        const nomeArquivo =
            `fiado_simples_backup_${Date.now()}.json`;

        console.log(
            window.Capacitor.Plugins.Filesystem
        );

        console.log(
            window.Capacitor.Plugins.Share
        );

        const resultado =
            await Filesystem.writeFile({

                path: nomeArquivo,

                data: json,

                directory: 'DOCUMENTS',

                recursive: true

            });

        console.log(resultado);

        await Share.share({

            title:
                'Backup Fiado Simples',

            text:
                'Backup do banco',

            url:
                resultado.uri

        });

    }
    catch (e)
    {
        console.error(e);

        alert(
            JSON.stringify(e)
        );
    }
}