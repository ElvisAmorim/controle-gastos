const Logic = {
    // Generate installments
    generateInstallments(baseEntry, totalInstallments) {
        const installments = [];
        const baseDate = new Date(baseEntry.date + 'T12:00:00'); // Use noon to avoid TZ issues
        const installmentValue = baseEntry.value / totalInstallments;
        const parentId = Date.now() + Math.random().toString(36).substr(2, 9);

        for (let i = 1; i <= totalInstallments; i++) {
            const entryDate = new Date(baseDate);
            if (i > 1) {
                entryDate.setMonth(baseDate.getMonth() + (i - 1));
            }

            installments.push({
                ...baseEntry,
                id: parentId + '_' + i,
                parentId: parentId,
                value: installmentValue,
                date: entryDate.toISOString().split('T')[0],
                installmentNumber: i,
                totalInstallments: totalInstallments,
                description: `${baseEntry.description} (${i}/${totalInstallments})`
            });
        }
        return installments;
    },

    // Calculate totals for a month/year
    getTotals(month, year) {
        const entries = Storage.getEntries();
        const fixed = Storage.getFixed();
        const subcategories = Storage.getSubcategories();
        const categories = Storage.getCategories();
        
        let revenue = 0;
        let expense = 0;
        let creditCard = 0;

        // Process Variable Entries & Installments
        entries.forEach(entry => {
            const entryDate = new Date(entry.date + 'T12:00:00');
            if (entryDate.getMonth() === (month - 1) && entryDate.getFullYear() === year) {
                const sub = subcategories.find(s => s.id == entry.subcategoryId);
                const cat = sub ? categories.find(c => c.id == sub.categoryId) : null;
                const type = cat ? cat.type : 'expense';

                if (type === 'revenue') {
                    revenue += parseFloat(entry.value);
                } else {
                    expense += parseFloat(entry.value);
                    if (entry.paymentMethod === 'Crédito') {
                        creditCard += parseFloat(entry.value);
                    }
                }
            }
        });

        // Process Fixed Costs
        fixed.forEach(f => {
            const sub = subcategories.find(s => s.id == f.subcategoryId);
            const cat = sub ? categories.find(c => c.id == sub.categoryId) : null;
            const type = cat ? cat.type : 'expense';
            
            if (type === 'revenue') {
                revenue += parseFloat(f.value);
            } else {
                expense += parseFloat(f.value);
                if (f.paymentMethod === 'Crédito') {
                    creditCard += parseFloat(f.value);
                }
            }
        });

        const pendingFixed = this.getPendingFixedCosts(month, year);

        return {
            revenue,
            expense,
            creditCard,
            balance: revenue - expense,
            pendingFixed,
            lastUpdate: this.getLastUpdateDays()
        };
    },

    getLastUpdateDays() {
        const entries = Storage.getEntries();
        if (entries.length === 0) return '-';
        
        let maxTime = 0;
        
        entries.forEach(e => {
            // Tenta extrair o timestamp do ID (gerado por Date.now())
            const timeFromId = parseInt(e.id);
            if (!isNaN(timeFromId) && timeFromId > 1600000000000) { // Maior que 2020
                if (timeFromId > maxTime) maxTime = timeFromId;
            } else {
                // Fallback: usar a data do registro, desde que não seja no futuro (parcelas)
                const entryDate = new Date(e.date + 'T12:00:00').getTime();
                if (entryDate <= Date.now() && entryDate > maxTime) {
                    maxTime = entryDate;
                }
            }
        });

        if (maxTime === 0) return '-'; // Só existem parcelas futuras

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lastUpdate = new Date(maxTime);
        lastUpdate.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - lastUpdate.getTime();
        const dias = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, dias); // Nunca retorna negativo
    },

    getPendingFixedCosts(month, year) {
        const fixed = Storage.getFixed();
        const statusList = Storage.getFixedStatus();
        const subcategories = Storage.getSubcategories();
        const categories = Storage.getCategories();

        let pending = 0;
        fixed.forEach(f => {
            const isPaid = statusList.some(s => s.fixedId === f.id && s.month === month && s.year === year && s.status === 'pago');
            if (!isPaid) {
                const sub = subcategories.find(s => s.id == f.subcategoryId);
                const cat = sub ? categories.find(c => c.id == sub.categoryId) : null;
                if (cat && cat.type === 'expense') {
                    pending += parseFloat(f.value);
                }
            }
        });
        return pending;
    },

    getCategoryReport(year) {
        const entries = Storage.getEntries();
        const fixed = Storage.getFixed();
        const subcategories = Storage.getSubcategories();
        const categories = Storage.getCategories();

        // Calculate total revenue for the year
        let totalRevenue = 0;
        
        // Data structure to hold report rows
        const reportMap = new Map();

        // Helper to process an item
        const processItem = (item, month, value) => {
            const sub = subcategories.find(s => s.id == item.subcategoryId);
            if (!sub) return;
            const cat = categories.find(c => c.id == sub.categoryId);
            if (!cat || cat.type !== 'expense') {
                if (cat && cat.type === 'revenue') {
                    totalRevenue += value;
                }
                return; // Only expenses in this report for the table body usually? Wait, reference project has both? 
                // Reference project title "Gastos vs Receita", but the % is usually over total revenue. 
                // Let's include expenses and let them be analyzed. The reference shows categories. 
                // We'll include all or just expenses. Reference shows both but calculates % s/ Receita.
            }

            const key = `${cat.id}_${sub.id}`;
            if (!reportMap.has(key)) {
                reportMap.set(key, {
                    categoryName: cat.name,
                    subcategoryName: sub.name,
                    months: Array(12).fill(0),
                    totalAno: 0
                });
            }
            
            const row = reportMap.get(key);
            row.months[month] += value;
            row.totalAno += value;
        };

        // Process entries
        entries.forEach(entry => {
            const entryDate = new Date(entry.date + 'T12:00:00');
            if (entryDate.getFullYear() === year) {
                processItem(entry, entryDate.getMonth(), parseFloat(entry.value));
            }
        });

        // Process fixed
        fixed.forEach(f => {
            // Fixed applies to all months starting from its start date
            const startDate = new Date(f.startDate + 'T12:00:00');
            for (let m = 0; m < 12; m++) {
                if (year > startDate.getFullYear() || (year === startDate.getFullYear() && m >= startDate.getMonth())) {
                    processItem(f, m, parseFloat(f.value));
                }
            }
        });

        const report = Array.from(reportMap.values());
        
        // Calculate averages and percentages
        report.forEach(r => {
            const monthsWithData = r.months.filter(v => v > 0).length;
            const divisor = Math.max(1, monthsWithData);
            r.media = r.totalAno / divisor;
            r.participacao = totalRevenue > 0 ? (r.totalAno / totalRevenue) * 100 : 0;
        });

        // Sort by totalAno descending
        report.sort((a, b) => b.totalAno - a.totalAno);

        return {
            report,
            totalRevenue
        };
    },

    getAnnualSummary(year) {
        const entries = Storage.getEntries();
        const fixed = Storage.getFixed();
        const statusList = Storage.getFixedStatus();
        const subcategories = Storage.getSubcategories();
        const categories = Storage.getCategories();

        const summary = Array.from({ length: 12 }, () => ({
            receita_fixa: 0,
            receita_variavel: 0,
            despesa_fixa: 0,
            despesa_variavel: 0,
            despesa_variavel_credito: 0,
            despesa_variavel_outros: 0,
            resultado: 0
        }));

        const isRevenue = (subcategoryId) => {
            const sub = subcategories.find(s => s.id == subcategoryId);
            if (!sub) return false;
            const cat = categories.find(c => c.id == sub.categoryId);
            return cat && cat.type === 'revenue';
        };

        // Process entries (variable)
        entries.forEach(entry => {
            const entryDate = new Date(entry.date + 'T12:00:00');
            if (entryDate.getFullYear() === year) {
                const month = entryDate.getMonth();
                const val = parseFloat(entry.value);
                if (isRevenue(entry.subcategoryId)) {
                    summary[month].receita_variavel += val;
                } else {
                    summary[month].despesa_variavel += val;
                    if (entry.paymentMethod === 'Crédito') {
                        summary[month].despesa_variavel_credito += val;
                    } else {
                        summary[month].despesa_variavel_outros += val;
                    }
                }
            }
        });

        // Process fixed costs (they apply from their start date onwards)
        fixed.forEach(f => {
            const startDate = new Date(f.startDate + 'T12:00:00');
            const isRev = isRevenue(f.subcategoryId);
            const val = parseFloat(f.value);
            
            for (let m = 0; m < 12; m++) {
                if (year > startDate.getFullYear() || (year === startDate.getFullYear() && m >= startDate.getMonth())) {
                    if (isRev) {
                        summary[m].receita_fixa += val;
                    } else {
                        summary[m].despesa_fixa += val;
                    }
                }
            }
        });

        // Calculate Result
        summary.forEach(m => {
            m.resultado = (m.receita_fixa + m.receita_variavel) - (m.despesa_fixa + m.despesa_variavel);
        });

        return summary;
    },

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    },

    formatDate(dateStr) {
        if (!dateStr) return '-';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    }
};
