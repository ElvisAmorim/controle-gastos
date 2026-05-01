const Backup = {
    exportData() {
        const data = Storage.exportJSON();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    },

    importData(file, callback) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const success = Storage.importJSON(event.target.result);
            if (callback) callback(success);
        };
        reader.readAsText(file);
    }
};
