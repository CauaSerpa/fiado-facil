import { db } from '../../database/db.js';
import { exportarBanco } from './backup/exportBackup.js';
import { importarBanco } from './backup/importBackup.js';

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
        .addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

    document.getElementById('fileInput')
        .addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) importarBanco(file);
        });

    document.getElementById('btnReset')
        .addEventListener('click', resetBanco);
}