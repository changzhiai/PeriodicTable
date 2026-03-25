// Dynamic Global Header Component
(function () {
    const pathname = window.location.pathname;

    // Scoped styles to ensure no underlines and reset header h1
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        /* Force scrollbar to prevent layout jump on different page lengths */
        html { overflow-y: scroll; }
        #global-header { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important; }
        #global-header a { text-decoration: none !important; }
        #global-header h1, #global-header span { border-bottom: none !important; }
        .logo-icon-svg { stroke-width: 2.25px; transition: transform 0.3s ease; }
        #global-header a:hover .logo-icon-svg { transform: rotate(15deg); }
    `;
    document.head.appendChild(styleTag);

    // Header HTML Structure
    const headerHTML = `
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm safe-pt">
        <div class="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <a href="/" class="flex items-center gap-1.5 hover:opacity-80 transition-opacity no-underline group">
                <div class="bg-blue-600 p-1.5 rounded-xl text-white shadow-sm flex items-center justify-center">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="logo-icon-svg">
                        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                        <path d="M20.2 20.2c2.04-2.03.02-7.36-4.52-11.9s-9.87-6.56-11.9-4.52c-2.04 2.03-.02 7.36 4.52 11.9s9.87 6.56 11.9 4.52z"/>
                        <path d="M3.8 20.2c-2.04-2.03-.02-7.36 4.52-11.9s9.87-6.56 11.9-4.52c2.04 2.03.02 7.36-4.52 11.9s-9.87 6.56-11.9 4.52z"/>
                    </svg>
                </div>
                <span class="text-xl font-bold tracking-tight text-gray-900 m-0 whitespace-nowrap">Periodic Table</span>
            </a>
            <div class="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
                <a href="/about" data-path="/about"
                    class="nav-link px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-blue-600 transition-all text-sm font-bold whitespace-nowrap no-underline border border-transparent shrink-0">About</a>
                <a href="/how-it-works" data-path="/how-it-works"
                    class="nav-link px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-blue-600 transition-all text-sm font-bold whitespace-nowrap no-underline border border-transparent shrink-0">How</a>
                <a href="/glossary" data-path="/glossary"
                    class="nav-link px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-blue-600 transition-all text-sm font-bold whitespace-nowrap no-underline border border-transparent shrink-0">Glossary</a>
                <a href="/history" data-path="/history"
                    class="nav-link px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-blue-600 transition-all text-sm font-bold whitespace-nowrap no-underline border border-transparent shrink-0">History</a>
                <a href="/privacy" data-path="/privacy"
                    class="nav-link px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-blue-600 transition-all text-sm font-bold whitespace-nowrap no-underline border border-transparent shrink-0">Privacy</a>
                <a href="/download" data-path="/download"
                    class="nav-link px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-blue-600 transition-all text-sm font-bold whitespace-nowrap no-underline border border-transparent shrink-0">Download</a>
                <a href="/site-index" data-path="/site-index"
                    class="nav-link px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-blue-600 transition-all text-sm font-bold whitespace-nowrap no-underline border border-transparent shrink-0">Directory</a>
                <a href="/" data-path="/"
                    class="nav-link px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-blue-600 transition-all text-sm font-bold shrink-0 no-underline border border-transparent">
                    Home
                </a>
            </div>
        </div>
    </header>
    `;

    // Inject the header
    const target = document.getElementById('global-header');
    if (target) {
        target.innerHTML = headerHTML;

        // Highlight active link
        const links = target.querySelectorAll('.nav-link');
        links.forEach(link => {
            const linkPath = link.getAttribute('data-path');
            if (pathname === linkPath || pathname === linkPath + '/' || (pathname === '/' && linkPath === '/')) {
                link.classList.remove('text-gray-500', 'hover:text-blue-600', 'border-transparent');
                link.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
            }
        });

        // Initialize Lucide Icons if available
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
})();
