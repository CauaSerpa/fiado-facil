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

window.goBack = async function(page = null) {

    const previous = historyStack.pop();

    const target = page
        ? page
        : (previous
            ? (previous.query
                ? `${previous.page}?${previous.query}`
                : previous.page)
            : 'clientes');

    window.currentPage = target.split('?')[0];
    window.currentQueryString = target.split('?')[1] || '';

    await loadPage(target);
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

export function loadFeedbackPage(page) {
    const params = new URLSearchParams(page.split('?')[1] || '');

    const type = params.get('type') || 'success';
    const msg = params.get('msg') || '';
    const redirect = params.get('redirect') || 'clientes';
    const time = Number(params.get('time') || 2000);

    const elements = document.querySelectorAll('#page-header, #statusbar-bg');
    elements.forEach(el => {
        el.classList.add('d-none');
    });

    app.innerHTML = `
        <div class="feedback-container">
            <div class="anim-wrapper">
                <div id="animacao"></div>
            </div>
            <h1 id="msg"></h1>
            <p id="sub">${msg}</p>
        </div>
    `;

    document.body.classList.remove('success', 'error');
    document.body.classList.add(type);

    document.getElementById('msg').innerText = 
        type === 'success'
            ? 'Sucesso'
            : 'Erro';

    const animationPath =
        type === 'success'
            ? './assets/lottie/check.json'
            : './assets/lottie/error.json';

    if (window.__lottieInstance) {
        window.__lottieInstance.destroy();
    }

    window.__lottieInstance = lottie.loadAnimation({
        container: document.getElementById('animacao'),
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: animationPath
    });

    setTimeout(() => {
        elements.forEach(el => {
            el.classList.remove('d-none');
        });

        window.navigate(redirect);
    }, time);
}

async function loadPage(route)
{
    const [page, queryString = ''] = route.split('?');

    window.currentPage = page;
    window.currentQueryString = queryString;

    if (page.startsWith('feedback')) {
        return loadFeedbackPage(route);
    }

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