const UI = {
    elements: {
        lastUpdate: document.getElementById('last-update'),
        totalBalance: document.getElementById('total-balance'),
        pendingFixed: document.getElementById('pending-fixed'),
        totalCreditCard: document.getElementById('total-credit-card'),
        monthFilter: document.getElementById('month-filter'),
        reportYearFilter: document.getElementById('report-year-filter'),
        tableEntriesBody: document.getElementById('table-entries-body'),
        tableReportBody: document.getElementById('table-report-body'),
        tableAnnualSummary: document.getElementById('table-annual-summary'),
        summaryYearSpan: document.getElementById('summary-year'),
        recentEntries: document.getElementById('recent-entries'),
        selectCategory: document.getElementById('select-category'),
        formEntry: document.getElementById('form-entry'),
        switchInstallment: document.getElementById('switch-installment'),
        installmentFields: document.getElementById('installment-fields'),
        menuToggle: document.getElementById('menu-toggle'),
        sidebar: document.getElementById('sidebar-wrapper'),
        sectionTitle: document.getElementById('section-title'),
        btnExport: document.getElementById('btn-export'),
        inputImport: document.getElementById('input-import'),
        entryMonthInput: document.getElementById('entry-month-input'),
        fixedMonthInput: document.getElementById('fixed-month-input'),
        formFixed: document.getElementById('form-fixed'),
        formIncrement: document.getElementById('form-increment'),
        formCategory: document.getElementById('form-category'),
        formSubcategory: document.getElementById('form-subcategory'),
        selectCategoryEntry: document.getElementById('select-category-entry'),
        selectSubcategoryEntry: document.getElementById('select-subcategory-entry'),
        selectCategoryFixed: document.getElementById('select-category-fixed'),
        selectSubcategoryFixed: document.getElementById('select-subcategory-fixed')
    },

    currentMonth: new Date().getMonth() + 1,
    currentYear: new Date().getFullYear(),
    mainChart: null,
    initialized: false,
    editingFixedId: null,
    editingCategoryId: null,
    init() {
        if (!this.initialized) {
            this.setupEventListeners();
            this.initialized = true;
        }

        this.setDefaultDates();

        // Populate report year filter
        if (this.elements.reportYearFilter) {
            let options = '';
            for (let y = this.currentYear - 2; y <= this.currentYear + 2; y++) {
                options += `<option value="${y}" ${y === this.currentYear ? 'selected' : ''}>${y}</option>`;
            }
            this.elements.reportYearFilter.innerHTML = options;
        }

        this.populateCategories();
        this.refresh();
    },
    setDefaultDates() {
        const monthStr = this.currentMonth < 10 ? '0' + this.currentMonth : this.currentMonth;
        const currentMonthValue = `${this.currentYear}-${monthStr}`;
        this.elements.monthFilter.value = currentMonthValue;
        this.elements.entryMonthInput.value = currentMonthValue;
        this.elements.fixedMonthInput.value = currentMonthValue;
    },

    setupEventListeners() {
        // Sidebar Navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.switchSection(section);
                
                // Active class
                document.querySelectorAll('[data-section]').forEach(l => l.classList.remove('active'));
                document.querySelectorAll(`[data-section="${section}"]`).forEach(l => l.classList.add('active'));

                // Close sidebar on mobile
                if (window.innerWidth < 992) {
                    document.getElementById('wrapper').classList.add('toggled');
                }
            });
        });

        // Trigger section from links
        document.addEventListener('click', (e) => {
            if (e.target.dataset.sectionTrigger) {
                const target = e.target.dataset.sectionTrigger;
                const navLink = document.querySelector(`[data-section="${target}"]`);
                if (navLink) navLink.click();
            }
        });

        // Month Filter
        this.elements.monthFilter.addEventListener('change', (e) => {
            const [year, month] = e.target.value.split('-');
            this.currentMonth = parseInt(month);
            this.currentYear = parseInt(year);
            this.refresh();
        });

        // Report Year Filter
        if (this.elements.reportYearFilter) {
            this.elements.reportYearFilter.addEventListener('change', (e) => {
                this.renderReport(parseInt(e.target.value));
            });
        }

        // Installment Switch
        this.elements.switchInstallment.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.elements.installmentFields.classList.remove('d-none');
            } else {
                this.elements.installmentFields.classList.add('d-none');
            }
        });

        // Sidebar Toggle
        this.elements.menuToggle.addEventListener('click', () => {
            document.getElementById('wrapper').classList.toggle('toggled');
        });

        // Form Submit
        this.elements.formEntry.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Form Fixed Submit
        if (this.elements.formFixed) {
            this.elements.formFixed.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFixedFormSubmit();
            });
        }

        // Form Increment Submit
        if (this.elements.formIncrement) {
            this.elements.formIncrement.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleIncrementSubmit();
            });
        }

        // Form Category Submit
        if (this.elements.formCategory) {
            this.elements.formCategory.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCategoryFormSubmit();
            });
        }

        // Form Subcategory Submit
        if (this.elements.formSubcategory) {
            this.elements.formSubcategory.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubcategorySubmit();
            });
        }

        // Category Select Change (Dynamic Subcategories)
        if (this.elements.selectCategoryEntry) {
            this.elements.selectCategoryEntry.addEventListener('change', (e) => {
                this.populateSubcategories(e.target.value, this.elements.selectSubcategoryEntry);
            });
        }
        if (this.elements.selectCategoryFixed) {
            this.elements.selectCategoryFixed.addEventListener('change', (e) => {
                this.populateSubcategories(e.target.value, this.elements.selectSubcategoryFixed);
            });
        }

        // Modal Reset on Open
        document.getElementById('modalEntry').addEventListener('show.bs.modal', () => {
            this.elements.formEntry.reset();
            this.setDefaultDates();
            this.elements.installmentFields.classList.add('d-none');
        });
        document.getElementById('modalFixed').addEventListener('show.bs.modal', () => {
            this.elements.formFixed.reset();
            this.setDefaultDates();
        });

        // Export
        this.elements.btnExport.addEventListener('click', () => {
            const data = Storage.exportJSON();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
        });

        // Import
        this.elements.inputImport.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const success = Storage.importJSON(event.target.result);
                if (success) {
                    alert('Dados importados com sucesso!');
                    window.location.reload();
                } else {
                    alert('Erro ao importar arquivo. Verifique se o formato está correto.');
                }
            };
            reader.readAsText(file);
        });
    },

    switchSection(sectionId) {
        document.querySelectorAll('.section-content').forEach(s => s.classList.add('d-none'));
        document.getElementById(`${sectionId}-section`).classList.remove('d-none');
        
        const titles = {
            'dashboard': 'Dashboard',
            'entries': 'Lançamentos',
            'fixed': 'Custos Fixos',
            'categories': 'Gerenciar Categorias',
            'reports': 'Relatórios',
            'settings': 'Configurações'
        };
        this.elements.sectionTitle.innerText = titles[sectionId];
    },

    populateCategories() {
        const categories = Storage.getCategories();
        const options = '<option value="">Selecione...</option>' + categories
            .map(c => `<option value="${c.id}">${c.name} (${c.type === 'revenue' ? 'R' : 'D'})</option>`)
            .join('');
        
        document.querySelectorAll('.select-category-main').forEach(sel => {
            sel.innerHTML = options;
        });
    },

    populateSubcategories(categoryId, selectElement) {
        if (!categoryId) {
            selectElement.innerHTML = '<option value="">Selecione...</option>';
            selectElement.disabled = true;
            return;
        }

        const subcategories = Storage.getSubcategories().filter(s => s.categoryId == categoryId);
        selectElement.innerHTML = '<option value="">Selecione...</option>' + subcategories
            .map(s => `<option value="${s.id}">${s.name}</option>`)
            .join('');
        selectElement.disabled = false;
    },

    refresh() {
        const totals = Logic.getTotals(this.currentMonth, this.currentYear);
        
        // Update Stats
        this.elements.lastUpdate.innerHTML = `${totals.lastUpdate} <small class="fs-6">dias</small>`;
        this.elements.totalBalance.innerText = Logic.formatCurrency(totals.balance);
        this.elements.pendingFixed.innerText = Logic.formatCurrency(totals.pendingFixed);
        this.elements.totalCreditCard.innerText = Logic.formatCurrency(totals.creditCard);

        // Render Tables/Lists
        this.renderEntriesTable();
        this.renderRecentEntries();
        this.renderChart(totals);
        this.renderFixedCosts();
        this.renderCategoriesManagement();
        this.renderAnnualSummary();
        
        if (this.elements.reportYearFilter) {
            this.renderReport(parseInt(this.elements.reportYearFilter.value) || this.currentYear);
        }
    },

    renderEntriesTable() {
        const entries = Storage.getEntries()
            .filter(e => {
                const d = new Date(e.date + 'T12:00:00');
                return d.getMonth() === (this.currentMonth - 1) && d.getFullYear() === this.currentYear;
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        this.elements.tableEntriesBody.innerHTML = entries.length ? entries.map(e => {
            const sub = Storage.getSubcategories().find(s => s.id == e.subcategoryId);
            const cat = sub ? Storage.getCategories().find(c => c.id == sub.categoryId) : null;
            const typeClass = cat && cat.type === 'revenue' ? 'entry-row-revenue' : 'entry-row-expense';
            const icon = cat ? cat.icon : 'fa-tags';
            const color = cat ? cat.color : '#858796';

            return `
                <tr>
                    <td class="ps-4 small text-muted">${Logic.formatDate(e.date)}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="category-icon" style="background-color: ${color}20; color: ${color}">
                                <i class="fas ${icon}"></i>
                            </div>
                            <span class="fw-medium">${e.description}</span>
                        </div>
                    </td>
                    <td>
                        <small class="text-muted d-block" style="font-size: 0.7rem;">${cat ? cat.name : '-'}</small>
                        <span class="badge bg-light text-dark fw-normal">${sub ? sub.name : '-'}</span>
                    </td>
                    <td><small class="text-muted">${e.paymentMethod}</small></td>
                    <td class="${typeClass} fw-bold">${Logic.formatCurrency(e.value)}</td>
                    <td class="text-end pe-4">
                        ${!e.totalInstallments || e.totalInstallments <= 1 ? `
                            <button class="btn btn-sm btn-link text-info me-1" onclick="UI.openIncrementModal('${e.id}')" title="Incrementar">
                                <i class="fas fa-plus-circle"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-link text-danger" onclick="UI.handleDeleteEntry('${e.id}')" title="Excluir">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('') : '<tr><td colspan="6" class="text-center py-5 text-muted">Nenhum lançamento neste mês.</td></tr>';
    },

    renderRecentEntries() {
        const entries = Storage.getEntries()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        if (entries.length === 0) {
            this.elements.recentEntries.innerHTML = '<div class="text-center py-5 opacity-50">Nenhum lançamento encontrado.</div>';
            return;
        }

        this.elements.recentEntries.innerHTML = entries.map(e => {
            const sub = Storage.getSubcategories().find(s => s.id == e.subcategoryId);
            const cat = sub ? Storage.getCategories().find(c => c.id == sub.categoryId) : null;
            const color = cat ? cat.color : '#858796';
            const sign = cat && cat.type === 'revenue' ? '+' : '-';
            const colorClass = cat && cat.type === 'revenue' ? 'text-success' : 'text-danger';

            return `
                <div class="list-group-item border-0 border-bottom d-flex justify-content-between align-items-center py-3 px-4">
                    <div class="d-flex align-items-center">
                        <div class="category-icon" style="background-color: ${color}15; color: ${color}">
                            <i class="fas ${cat ? cat.icon : 'fa-tags'}"></i>
                        </div>
                        <div>
                            <p class="mb-0 fw-bold small">${e.description}</p>
                            <small class="text-muted">${sub ? sub.name : '-'}</small>
                        </div>
                    </div>
                    <span class="fw-bold small ${colorClass}">${sign}${Logic.formatCurrency(e.value)}</span>
                </div>
            `;
        }).join('');
    },

    renderFixedCosts() {
        const fixed = Storage.getFixed().sort((a, b) => (a.dueDay || 1) - (b.dueDay || 1));
        const statusList = Storage.getFixedStatus();
        const container = document.getElementById('fixed-costs-container');
        
        if (fixed.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="opacity-50 mb-3"><i class="fas fa-calendar-alt fa-3x"></i></div>
                    <p class="text-muted">Nenhum custo fixo cadastrado.</p>
                    <button class="btn btn-outline-primary btn-sm" onclick="UI.openNewFixedModal()">Adicionar Primeiro</button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="col-12 mb-3 d-flex justify-content-between align-items-center">
                <h6 class="fw-bold mb-0">Gestão de Mensalidades</h6>
                <button class="btn btn-dark btn-sm rounded-pill px-3" onclick="UI.openNewFixedModal()">
                    <i class="fas fa-plus me-1"></i> Adicionar Fixo
                </button>
            </div>
        ` + fixed.map(f => {
            const status = statusList.find(s => s.fixedId === f.id && s.month === this.currentMonth && s.year === this.currentYear);
            const isPaid = status && status.status === 'pago';
            const sub = Storage.getSubcategories().find(s => s.id == f.subcategoryId);
            const cat = sub ? Storage.getCategories().find(c => c.id == sub.categoryId) : null;
            const color = cat ? cat.color : '#858796';
            const icon = cat ? cat.icon : 'fa-tags';
            const dueDayFormatted = String(f.dueDay || 1).padStart(2, '0');

            return `
                <div class="col-md-4">
                    <div class="card border-0 shadow-sm h-100 card-premium">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div class="category-icon" style="background-color: ${color}20; color: ${color}">
                                    <i class="fas ${icon}"></i>
                                </div>
                                <div class="dropdown">
                                    <button class="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-end shadow border-0">
                                        <li><a class="dropdown-item" href="#" onclick="UI.handleEditFixed(${f.id})">Editar</a></li>
                                        <li><a class="dropdown-item text-danger" href="#" onclick="UI.handleDeleteFixed(${f.id})">Excluir</a></li>
                                    </ul>
                                </div>
                            </div>
                            <div class="mb-2">
                                <span class="badge bg-light text-muted fw-normal">Dia ${dueDayFormatted}</span>
                            </div>
                            <h6 class="fw-bold mb-1">${f.description}</h6>
                            <p class="text-muted small mb-3">${sub ? sub.name : '-'} • ${f.paymentMethod}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="fw-bold mb-0">${Logic.formatCurrency(f.value)}</h5>
                                <button class="btn btn-sm ${isPaid ? 'btn-success' : 'btn-outline-secondary'} rounded-pill px-3" 
                                        onclick="UI.toggleFixedStatus(${f.id}, ${isPaid})">
                                    ${isPaid ? '<i class="fas fa-check me-1"></i> Pago' : 'Marcar Pago'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderChart(totals) {
        const ctx = document.getElementById('mainChart').getContext('2d');
        
        if (this.mainChart) {
            this.mainChart.destroy();
        }

        this.mainChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Receitas', 'Despesas', 'Fatura'],
                datasets: [{
                    label: 'Valores do Mês',
                    data: [totals.revenue, totals.expense, totals.creditCard],
                    backgroundColor: ['#1cc88a', '#e74a3b', '#f6c23e'],
                    borderRadius: 8,
                    barThickness: 50
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    },

    renderCategoriesManagement() {
        const categories = Storage.getCategories();
        const subcategories = Storage.getSubcategories();

        document.getElementById('table-categories-body').innerHTML = categories.map(c => `
            <tr>
                <td class="ps-4 fw-medium">${c.name}</td>
                <td><span class="badge ${c.type === 'revenue' ? 'bg-success' : 'bg-danger'}">${c.type === 'revenue' ? 'Receita' : 'Despesa'}</span></td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-link text-primary" onclick="UI.handleEditCategory(${c.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-link text-danger" onclick="UI.handleDeleteCategory(${c.id})"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `).join('');

        document.getElementById('table-subcategories-body').innerHTML = subcategories.map(s => {
            const cat = categories.find(c => c.id == s.categoryId);
            return `
                <tr>
                    <td class="ps-4 fw-medium">${s.name}</td>
                    <td><small class="text-muted">${cat ? cat.name : '?'}</small></td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-link text-danger" onclick="UI.handleDeleteSubcategory(${s.id})"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    renderAnnualSummary() {
        if (!this.elements.tableAnnualSummary) return;

        this.elements.summaryYearSpan.innerText = this.currentYear;
        const summary = Logic.getAnnualSummary(this.currentYear);

        const formatCell = (val, colorClass, isItalic = false) => {
            return `<td class="${colorClass} small ${isItalic ? 'fst-italic' : ''}">${val !== 0 ? Logic.formatCurrency(val).replace('R$', '').trim() : '-'}</td>`;
        };

        this.elements.tableAnnualSummary.innerHTML = `
            <tr>
                <td class="text-start fw-bold ps-4">Receita Fixa</td>
                ${summary.map(m => formatCell(m.receita_fixa, 'text-success')).join('')}
            </tr>
            <tr>
                <td class="text-start fw-bold ps-4">Receita Variável</td>
                ${summary.map(m => formatCell(m.receita_variavel, 'text-success')).join('')}
            </tr>
            <tr>
                <td class="text-start fw-bold ps-4">Contas Fixas</td>
                ${summary.map(m => formatCell(m.despesa_fixa, 'text-danger')).join('')}
            </tr>
            <tr>
                <td class="text-start fw-bold ps-4">Despesas Variáveis</td>
                ${summary.map(m => formatCell(m.despesa_variavel, 'text-danger')).join('')}
            </tr>
            <tr>
                <td class="text-start ps-5 text-muted small">↳ No Cartão (Crédito)</td>
                ${summary.map(m => formatCell(m.despesa_variavel_credito, 'text-muted', true)).join('')}
            </tr>
            <tr>
                <td class="text-start ps-5 text-muted small">↳ Outros (Pix/Débito)</td>
                ${summary.map(m => formatCell(m.despesa_variavel_outros, 'text-muted')).join('')}
            </tr>
            <tr class="table-secondary">
                <td class="text-start fw-bold ps-4">Resultado do Mês</td>
                ${summary.map(m => `<td class="${m.resultado >= 0 ? 'text-primary' : 'text-danger'} fw-bold">${Logic.formatCurrency(m.resultado).replace('R$', '').trim()}</td>`).join('')}
            </tr>
        `;
    },

    renderReport(year) {
        if (!this.elements.tableReportBody) return;

        const { report } = Logic.getCategoryReport(year);

        if (report.length === 0) {
            this.elements.tableReportBody.innerHTML = '<tr><td colspan="15" class="text-center text-muted py-4">Nenhum dado encontrado para o ano selecionado.</td></tr>';
            return;
        }

        this.elements.tableReportBody.innerHTML = report.map(r => `
            <tr>
                <td class="ps-4">
                    <strong>${r.categoryName}</strong><br>
                    <small class="text-muted">${r.subcategoryName}</small>
                </td>
                <td class="small fw-medium">${Logic.formatCurrency(r.media)}</td>
                <td>
                    <div class="progress mb-1" style="height: 5px; width: 60px;">
                        <div class="progress-bar bg-danger" role="progressbar" style="width: ${r.participacao}%"></div>
                    </div>
                    <small class="text-muted" style="font-size: 0.7rem;">${r.participacao.toFixed(1).replace('.', ',')}%</small>
                </td>
                ${r.months.map(m => `<td class="small text-center">${m > 0 ? Logic.formatCurrency(m).replace('R$', '').trim() : '-'}</td>`).join('')}
            </tr>
        `).join('');
    },

    handleFormSubmit() {
        const formData = new FormData(this.elements.formEntry);
        const monthValue = formData.get('month'); // YYYY-MM
        const data = {
            description: formData.get('description'),
            value: parseFloat(formData.get('value')),
            date: `${monthValue}-01`,
            subcategoryId: formData.get('subcategoryId'),
            paymentMethod: formData.get('paymentMethod'),
            isInstallment: formData.get('isInstallment') === 'on'
        };

        if (data.isInstallment) {
            const total = parseInt(formData.get('totalInstallments'));
            const installments = Logic.generateInstallments(data, total);
            installments.forEach(ins => Storage.addEntry(ins));
        } else {
            Storage.addEntry(data);
        }

        // Reset and close
        this.elements.formEntry.reset();
        this.setDefaultDates();
        this.elements.installmentFields.classList.add('d-none');
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEntry'));
        modal.hide();

        this.refresh();
    },

    handleDeleteEntry(id) {
        if (confirm('Deseja realmente excluir este lançamento?')) {
            Storage.deleteEntry(id);
            this.refresh();
        }
    },

    openNewFixedModal() {
        this.editingFixedId = null;
        this.elements.formFixed.reset();
        document.querySelector('#modalFixed .modal-title').innerText = 'Novo Custo Fixo';
        this.elements.fixedMonthInput.value = `${this.currentYear}-${this.currentMonth < 10 ? '0' + this.currentMonth : this.currentMonth}`;
        new bootstrap.Modal(document.getElementById('modalFixed')).show();
    },

    handleEditFixed(id) {
        const fixed = Storage.getFixed().find(f => f.id === id);
        if (!fixed) return;

        this.editingFixedId = id;
        this.elements.formFixed.elements['description'].value = fixed.description;
        this.elements.formFixed.elements['value'].value = fixed.value;
        this.elements.formFixed.elements['startMonth'].value = fixed.startDate.substring(0, 7);
        this.elements.formFixed.elements['paymentMethod'].value = fixed.paymentMethod;
        this.elements.formFixed.elements['dueDay'].value = fixed.dueDay || 1;
        
        // Auto-select category based on subcategory
        const sub = Storage.getSubcategories().find(s => s.id == fixed.subcategoryId);
        if (sub) {
            this.elements.selectCategoryFixed.value = sub.categoryId;
            // Trigger change to populate subcategories
            this.elements.selectCategoryFixed.dispatchEvent(new Event('change'));
            this.elements.selectSubcategoryFixed.value = fixed.subcategoryId;
        }

        document.querySelector('#modalFixed .modal-title').innerText = 'Editar Custo Fixo';
        new bootstrap.Modal(document.getElementById('modalFixed')).show();
    },

    handleFixedFormSubmit() {
        const formData = new FormData(this.elements.formFixed);
        const startMonth = formData.get('startMonth'); // YYYY-MM
        const data = {
            description: formData.get('description'),
            value: parseFloat(formData.get('value')),
            startDate: `${startMonth}-01`,
            subcategoryId: formData.get('subcategoryId'),
            paymentMethod: formData.get('paymentMethod'),
            dueDay: parseInt(formData.get('dueDay'))
        };

        if (this.editingFixedId) {
            Storage.updateFixed(this.editingFixedId, data);
        } else {
            Storage.addFixed(data);
        }

        bootstrap.Modal.getInstance(document.getElementById('modalFixed')).hide();
        this.refresh();
    },

    toggleFixedStatus(fixedId, currentIsPaid) {
        const statusObj = {
            fixedId: fixedId,
            month: this.currentMonth,
            year: this.currentYear,
            status: currentIsPaid ? 'pendente' : 'pago',
            amountPaid: 0, // Could add input for this later
            datePaid: new Date().toISOString().split('T')[0]
        };

        Storage.updateFixedStatus(statusObj);
        this.refresh();
    },

    handleDeleteFixed(id) {
        if (confirm('Deseja realmente excluir este custo fixo?')) {
            Storage.deleteFixed(id);
            this.refresh();
        }
    },

    handleEditCategory(id) {
        const cat = Storage.getCategories().find(c => c.id === id);
        if (!cat) return;
        
        this.editingCategoryId = id;
        this.elements.formCategory.elements['name'].value = cat.name;
        this.elements.formCategory.elements['type'].value = cat.type;
        document.querySelector('#form-category button').innerText = 'Atualizar';
    },

    handleCategoryFormSubmit() {
        const formData = new FormData(this.elements.formCategory);
        const data = {
            name: formData.get('name'),
            type: formData.get('type')
        };
        
        if (this.editingCategoryId) {
            Storage.updateCategory(this.editingCategoryId, data);
            this.editingCategoryId = null;
            document.querySelector('#form-category button').innerText = 'Adicionar';
        } else {
            Storage.addCategory(data);
        }
        
        this.elements.formCategory.reset();
        this.populateCategories();
        this.refresh();
        this.renderCategoriesManagement();
    },

    handleSubcategorySubmit() {
        const formData = new FormData(this.elements.formSubcategory);
        const data = {
            categoryId: formData.get('categoryId'),
            name: formData.get('name')
        };
        Storage.addSubcategory(data);
        this.elements.formSubcategory.reset();
        this.renderCategoriesManagement();
    },

    handleDeleteCategory(id) {
        if (confirm('Excluir esta categoria removerá todas as suas subcategorias. Confirma?')) {
            Storage.deleteCategory(id);
            this.populateCategories();
            this.refresh();
        }
    },

    handleDeleteSubcategory(id) {
        if (confirm('Deseja excluir esta subcategoria?')) {
            Storage.deleteSubcategory(id);
            this.refresh();
        }
    },

    openIncrementModal(id) {
        const entry = Storage.getEntries().find(e => e.id === id);
        if (!entry) return;

        document.getElementById('increment-entry-id').value = id;
        document.getElementById('increment-entry-desc').innerText = `Adicionar valor a: ${entry.description} (${Logic.formatCurrency(entry.value)})`;
        
        const modal = new bootstrap.Modal(document.getElementById('modalIncrement'));
        modal.show();
    },

    handleIncrementSubmit() {
        const formData = new FormData(this.elements.formIncrement);
        const id = formData.get('entryId');
        const extraValue = parseFloat(formData.get('extraValue'));

        const entry = Storage.getEntries().find(e => e.id === id);
        if (entry) {
            const newValue = entry.value + extraValue;
            Storage.updateEntry(id, { value: newValue });
            
            // Reset and close
            this.elements.formIncrement.reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalIncrement'));
            modal.hide();

            this.refresh();
        }
    },

    openNewFixedModal() {
        const modal = new bootstrap.Modal(document.getElementById('modalFixed'));
        modal.show();
    }
};
