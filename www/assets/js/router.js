const app =
    document.getElementById('app-content');

const historyStack = [];

window.navigate = async function(page, options = {})
{
    const current = {
        page: window.currentPage,
        query: window.currentQueryString || ''
    };

    if(current.page && !options.replace)
    {
        historyStack.push(current);
    }

    const [p, q = ''] = page.split('?');

    window.currentPage = p;
    window.currentQueryString = q;

    await loadPage(page);
};

window.goBack = async function()
{
    const previous = historyStack.pop();

    if(!previous)
    {
        await loadPage('clientes');
        return;
    }

    const route =
        previous.query
            ? `${previous.page}?${previous.query}`
            : previous.page;

    window.currentPage = previous.page;
    window.currentQueryString = previous.query;

    await loadPage(route);
};

async function renderFloatingButton(page)
{
    document
        .querySelector('#btnAddClient')
        ?.remove();

    if(page !== 'clientes')
    {
        return;
    }

    const { createFloatingButton } =
        await import('../../components/floating-button.js');

    document.body.insertAdjacentHTML(
        'beforeend',
        createFloatingButton()
    );

    document
        .getElementById('btnAddClient')
        ?.addEventListener(
            'click',
            () =>
            {
                loadPage('cliente-form');
            }
        );
}

async function initializePage(page)
{
    switch(page)
    {
        case 'cliente-form':
        {
            const module =
                await import('./cliente-form.js');

            module.initClienteForm();

            break;
        }

        case 'cliente-edit-form':
        {
            const module =
                await import('./cliente-form.js');

            const params =
                new URLSearchParams(
                    window.currentQueryString
                );

            const id =
                params.get('id');

            await module.initClienteEdit(id);

            break;
        }

        case 'cliente':
        {
            const module =
                await import('./cliente.js');

            const params =
                new URLSearchParams(
                    window.currentQueryString
                );

            const id =
                params.get('id');

            await module.initCliente(id);

            break;
        }

        case 'clientes':
        {
            try
            {
                const module =
                    await import('./clientes.js');

                module.initClientes?.();
            }
            catch(error)
            {
                console.error(error);
            }

            break;
        }

        case 'dashboard':
        {
            try
            {
                const module =
                    await import('./dashboard.js');

                module.initDashboard?.();
            }
            catch(error)
            {
                console.error(error);
            }

            break;
        }

        case 'comercio':
        {
            try
            {
                const module =
                    await import('./comercio.js');

                module.initComercio?.();
            }
            catch(error)
            {
                console.error(error);
            }

            break;
        }

        case 'cliente-fiado-form':
        {
            const module = await import('./cliente-fiado-form.js');

            const params = new URLSearchParams(window.currentQueryString);
            const id = params.get('id');

            await module.initFiadoForm(id);
            break;
        }

        case 'cliente-pagamento-form':
        {
            const module = await import('./cliente-pagamento-form.js');

            const params = new URLSearchParams(window.currentQueryString);
            const id = params.get('id');

            await module.initPagamentoForm(id);
            break;
        }

        case 'configuracoes':
        {
            try
            {
                const module =
                    await import('./configuracoes.js');

                module.initConfiguracoes?.();
            }
            catch(error)
            {
                console.error(error);
            }

            break;
        }
    }
}

async function loadPage(route)
{
    const [page, queryString = ''] = route.split('?');

    window.currentPage = page;
    window.currentQueryString = queryString;

    const response =
        await fetch(
            `pages/${page}.html`
        );

    const html =
        await response.text();

    const template =
        document.createElement('template');

    template.innerHTML = html;

    const header =
        template.content.querySelector('header');

    const headerContainer =
        document.getElementById('page-header');

    if(header && headerContainer)
    {
        headerContainer.innerHTML = '';
        headerContainer.appendChild(header);
    }
    else if(headerContainer)
    {
        headerContainer.innerHTML = '';
    }

    app.innerHTML =
        template.innerHTML;

    updateActiveButton(page);

    await renderFloatingButton(page);

    await initializePage(page);
}

function updateActiveButton(page)
{
    document
        .querySelectorAll('.nav-btn')
        .forEach(btn =>
        {
            btn.classList.remove('active');

            if(btn.dataset.page === page)
            {
                btn.classList.add('active');
            }
        });
}

document
    .querySelectorAll('.nav-btn')
    .forEach(btn =>
    {
        btn.addEventListener(
            'click',
            () =>
            {
                loadPage(
                    btn.dataset.page
                );
            }
        );
    });

loadPage('clientes');