const Storage = {
    KEYS: {
        ENTRIES: 'myfinance_entries',
        FIXED: 'myfinance_fixed',
        FIXED_STATUS: 'myfinance_fixed_status',
        CATEGORIES: 'myfinance_categories',
        SUBCATEGORIES: 'myfinance_subcategories'
    },

    // Initial default categories
    DEFAULT_CATEGORIES: [
        { id: 1, name: 'Receitas', type: 'revenue', icon: 'fa-money-bill-wave', color: '#1cc88a' },
        { id: 2, name: 'Moradia', type: 'expense', icon: 'fa-home', color: '#4e73df' },
        { id: 3, name: 'Alimentação', type: 'expense', icon: 'fa-shopping-cart', color: '#f6c23e' },
        { id: 4, name: 'Transporte', type: 'expense', icon: 'fa-car', color: '#36b9cc' },
        { id: 5, name: 'Saúde', type: 'expense', icon: 'fa-heartbeat', color: '#e74a3b' },
        { id: 6, name: 'Lazer', type: 'expense', icon: 'fa-cocktail', color: '#6f42c1' }
    ],

    DEFAULT_SUBCATEGORIES: [
        { id: 1, categoryId: 1, name: 'Salário' },
        { id: 2, categoryId: 1, name: 'Extras' },
        { id: 3, categoryId: 2, name: 'Aluguel' },
        { id: 4, categoryId: 2, name: 'Internet' },
        { id: 5, categoryId: 3, name: 'Supermercado' },
        { id: 6, categoryId: 3, name: 'Restaurante' }
    ],

    init() {
        if (!localStorage.getItem(this.KEYS.CATEGORIES)) {
            localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(this.DEFAULT_CATEGORIES));
        }
        if (!localStorage.getItem(this.KEYS.ENTRIES)) {
            localStorage.setItem(this.KEYS.ENTRIES, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.FIXED)) {
            localStorage.setItem(this.KEYS.FIXED, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.FIXED_STATUS)) {
            localStorage.setItem(this.KEYS.FIXED_STATUS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.SUBCATEGORIES)) {
            localStorage.setItem(this.KEYS.SUBCATEGORIES, JSON.stringify(this.DEFAULT_SUBCATEGORIES));
        }
    },

    getData(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    },

    saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    // Entries
    getEntries() { return this.getData(this.KEYS.ENTRIES); },
    addEntry(entry) {
        const entries = this.getEntries();
        entry.id = Date.now() + Math.random().toString(36).substr(2, 9);
        entries.push(entry);
        this.saveData(this.KEYS.ENTRIES, entries);
        return entry;
    },
    updateEntry(id, newData) {
        let entries = this.getEntries();
        const index = entries.findIndex(e => e.id === id);
        if (index > -1) {
            entries[index] = { ...entries[index], ...newData };
            this.saveData(this.KEYS.ENTRIES, entries);
            return true;
        }
        return false;
    },
    deleteEntry(id) {
        const entries = this.getEntries().filter(e => e.id !== id);
        this.saveData(this.KEYS.ENTRIES, entries);
    },

    // Fixed
    getFixed() { return this.getData(this.KEYS.FIXED); },
    addFixed(fixed) {
        const list = this.getFixed();
        fixed.id = Date.now();
        list.push(fixed);
        this.saveData(this.KEYS.FIXED, list);
    },
    updateFixed(id, newData) {
        let list = this.getFixed();
        const index = list.findIndex(f => f.id === id);
        if (index > -1) {
            list[index] = { ...list[index], ...newData };
            this.saveData(this.KEYS.FIXED, list);
            return true;
        }
        return false;
    },
    deleteFixed(id) {
        const list = this.getFixed().filter(f => f.id !== id);
        this.saveData(this.KEYS.FIXED, list);
    },

    // Fixed Status
    getFixedStatus() { return this.getData(this.KEYS.FIXED_STATUS); },
    updateFixedStatus(statusObj) {
        // statusObj: { fixedId, month, year, status, amountPaid, datePaid }
        let list = this.getFixedStatus();
        const index = list.findIndex(s => s.fixedId === statusObj.fixedId && s.month === statusObj.month && s.year === statusObj.year);
        
        if (index > -1) {
            list[index] = statusObj;
        } else {
            list.push(statusObj);
        }
        this.saveData(this.KEYS.FIXED_STATUS, list);
    },

    // Categories
    getCategories() { return this.getData(this.KEYS.CATEGORIES); },
    addCategory(cat) {
        const list = this.getCategories();
        cat.id = Date.now();
        cat.icon = cat.type === 'revenue' ? 'fa-money-bill-wave' : 'fa-tags';
        cat.color = cat.type === 'revenue' ? '#1cc88a' : '#4e73df';
        list.push(cat);
        this.saveData(this.KEYS.CATEGORIES, list);
    },
    updateCategory(id, newData) {
        let list = this.getCategories();
        const index = list.findIndex(c => c.id === id);
        if (index > -1) {
            list[index] = { ...list[index], ...newData };
            list[index].icon = list[index].type === 'revenue' ? 'fa-money-bill-wave' : 'fa-tags';
            list[index].color = list[index].type === 'revenue' ? '#1cc88a' : '#4e73df';
            this.saveData(this.KEYS.CATEGORIES, list);
            return true;
        }
        return false;
    },
    deleteCategory(id) {
        const list = this.getCategories().filter(c => c.id != id);
        this.saveData(this.KEYS.CATEGORIES, list);
        // Also delete subcategories
        const subs = this.getSubcategories().filter(s => s.categoryId != id);
        this.saveData(this.KEYS.SUBCATEGORIES, subs);
    },

    // Subcategories
    getSubcategories() { return this.getData(this.KEYS.SUBCATEGORIES); },
    addSubcategory(sub) {
        const list = this.getSubcategories();
        sub.id = Date.now();
        list.push(sub);
        this.saveData(this.KEYS.SUBCATEGORIES, list);
    },
    deleteSubcategory(id) {
        const list = this.getSubcategories().filter(s => s.id != id);
        this.saveData(this.KEYS.SUBCATEGORIES, list);
    },

    // Export/Import
    exportJSON() {
        const data = {
            entries: this.getEntries(),
            fixed: this.getFixed(),
            fixedStatus: this.getFixedStatus(),
            categories: this.getCategories(),
            subcategories: this.getSubcategories(),
            version: '1.1',
            exportedAt: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    },

    importJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.entries) this.saveData(this.KEYS.ENTRIES, data.entries);
            if (data.fixed) this.saveData(this.KEYS.FIXED, data.fixed);
            if (data.fixedStatus) this.saveData(this.KEYS.FIXED_STATUS, data.fixedStatus);
            if (data.categories) this.saveData(this.KEYS.CATEGORIES, data.categories);
            if (data.subcategories) this.saveData(this.KEYS.SUBCATEGORIES, data.subcategories);
            return true;
        } catch (e) {
            console.error('Erro na importação:', e);
            return false;
        }
    }
};

Storage.init();
