function showTab(tabId) {
    let tabs = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => tab.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
}

document.addEventListener("DOMContentLoaded", function () {
    showTab('cars');
});

function showAddCarForm() {
    showTab('add-car');
}

function showAddCarFormFix() {
    showTab('fix-car');
}