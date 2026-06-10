import { db } from '../../../database/db.js';

export async function importarBanco(file) {

    function fromBase64(base64) {
        return decodeURIComponent(escape(atob(base64)));
    }

    try {
        const text = fromBase64(await file.text());
        const backup = JSON.parse(text);

        // validação básica
        if (!backup || typeof backup !== 'object') {
            throw new Error('Arquivo inválido');
        }

        if (!backup.clientes || !backup.fiados || !backup.pagamentos) {
            throw new Error('Backup incompleto');
        }

        const confirmacao = confirm(
            'Isso irá substituir TODOS os dados atuais. Deseja continuar?'
        );

        if (!confirmacao) return;

        // limpa banco atual
        await db.transaction('rw',
            db.clientes,
            db.fiados,
            db.pagamentos,
            db.configuracoes,
            async () => {

                await db.clientes.clear();
                await db.fiados.clear();
                await db.pagamentos.clear();
                await db.configuracoes.clear();

                // restaura clientes
                if (backup.clientes.length) {
                    await db.clientes.bulkAdd(backup.clientes);
                }

                // restaura fiados
                if (backup.fiados.length) {
                    await db.fiados.bulkAdd(backup.fiados);
                }

                // restaura pagamentos
                if (backup.pagamentos.length) {
                    await db.pagamentos.bulkAdd(backup.pagamentos);
                }

                // configurações (chave única)
                if (backup.configuracoes.length) {
                    await db.configuracoes.bulkPut(backup.configuracoes);
                }
            }
        );

        alert('Banco importado com sucesso!');

        window.location.reload();

    } catch (e) {
        console.error(e);
        alert('Erro ao importar backup: ' + (e.message || 'arquivo inválido'));
    }
}