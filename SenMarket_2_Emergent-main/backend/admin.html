<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jënd-Ak-Jaay - Administration</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <div class="container mx-auto px-4 py-8">
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Jënd-Ak-Jaay - Administration MongoDB</h1>
            <p class="text-gray-600">Gérez votre base de données facilement</p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6" id="stats">
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="text-gray-600 text-sm">Utilisateurs</div>
                <div class="text-3xl font-bold text-blue-600" id="stat-users">-</div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="text-gray-600 text-sm">Produits</div>
                <div class="text-3xl font-bold text-green-600" id="stat-products">-</div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="text-gray-600 text-sm">Services</div>
                <div class="text-3xl font-bold text-purple-600" id="stat-services">-</div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="text-gray-600 text-sm">Messages</div>
                <div class="text-3xl font-bold text-orange-600" id="stat-messages">-</div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="text-gray-600 text-sm">Avis</div>
                <div class="text-3xl font-bold text-yellow-600" id="stat-reviews">-</div>
            </div>
        </div>

        <!-- Collections -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-xl font-bold mb-4">Collections</h2>
            <div class="flex gap-2 flex-wrap" id="collections-list"></div>
        </div>

        <!-- Data Display -->
        <div class="bg-white rounded-lg shadow-lg p-6" id="data-container" style="display: none;">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold" id="current-collection">Collection</h2>
                <div class="flex gap-2">
                    <input type="text" id="search-field" placeholder="Champ" class="border rounded px-3 py-2 text-sm">
                    <input type="text" id="search-value" placeholder="Valeur" class="border rounded px-3 py-2 text-sm">
                    <button onclick="searchData()" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
                        Rechercher
                    </button>
                    <button onclick="loadCollection(currentCollection)" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm">
                        Réinitialiser
                    </button>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm" id="data-table">
                    <thead class="bg-gray-100">
                        <tr id="table-header"></tr>
                    </thead>
                    <tbody id="table-body"></tbody>
                </table>
            </div>
            <div class="mt-4 text-sm text-gray-600" id="data-info"></div>
        </div>
    </div>

    <script>
        const API_BASE = window.location.origin + '/api/admin';
        let currentCollection = null;

        async function loadStats() {
            const response = await fetch(`${API_BASE}/stats`);
            const stats = await response.json();
            document.getElementById('stat-users').textContent = stats.users;
            document.getElementById('stat-products').textContent = stats.products;
            document.getElementById('stat-services').textContent = stats.services;
            document.getElementById('stat-messages').textContent = stats.messages;
            document.getElementById('stat-reviews').textContent = stats.reviews;
        }

        async function loadCollections() {
            const response = await fetch(`${API_BASE}/collections`);
            const collections = await response.json();
            const container = document.getElementById('collections-list');
            container.innerHTML = '';
            
            for (const [name, data] of Object.entries(collections)) {
                const btn = document.createElement('button');
                btn.className = 'bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition';
                btn.textContent = `${name} (${data.count})`;
                btn.onclick = () => loadCollection(name);
                container.appendChild(btn);
            }
        }

        async function loadCollection(collectionName) {
            currentCollection = collectionName;
            const response = await fetch(`${API_BASE}/collection/${collectionName}?limit=100`);
            const data = await response.json();
            
            document.getElementById('current-collection').textContent = collectionName;
            document.getElementById('data-container').style.display = 'block';
            document.getElementById('data-info').textContent = `Total: ${data.total} documents (affichage des ${data.documents.length} premiers)`;
            
            if (data.documents.length === 0) {
                document.getElementById('table-body').innerHTML = '<tr><td colspan="100" class="text-center py-4 text-gray-500">Aucun document</td></tr>';
                return;
            }

            // Build table header
            const keys = Object.keys(data.documents[0]);
            const headerRow = document.getElementById('table-header');
            headerRow.innerHTML = keys.map(key => `<th class="text-left p-2 border-b">${key}</th>`).join('') + '<th class="text-left p-2 border-b">Actions</th>';
            
            // Build table body
            const tbody = document.getElementById('table-body');
            tbody.innerHTML = data.documents.map(doc => {
                const cells = keys.map(key => {
                    let value = doc[key];
                    if (typeof value === 'object') value = JSON.stringify(value);
                    if (typeof value === 'string' && value.length > 50) value = value.substring(0, 50) + '...';
                    return `<td class="p-2 border-b">${value}</td>`;
                }).join('');
                
                return `<tr class="hover:bg-gray-50">
                    ${cells}
                    <td class="p-2 border-b">
                        <button onclick="deleteDoc('${doc.id || doc._id}')" class="text-red-600 hover:text-red-800 text-xs">Supprimer</button>
                    </td>
                </tr>`;
            }).join('');
        }

        async function searchData() {
            const field = document.getElementById('search-field').value;
            const value = document.getElementById('search-value').value;
            
            if (!field || !value) {
                alert('Veuillez remplir le champ et la valeur');
                return;
            }

            const response = await fetch(`${API_BASE}/collection/${currentCollection}/search?field=${field}&value=${value}`);
            const data = await response.json();
            
            document.getElementById('data-info').textContent = `Résultats: ${data.count} documents trouvés`;
            
            if (data.documents.length === 0) {
                document.getElementById('table-body').innerHTML = '<tr><td colspan="100" class="text-center py-4 text-gray-500">Aucun résultat</td></tr>';
                return;
            }

            const keys = Object.keys(data.documents[0]);
            const tbody = document.getElementById('table-body');
            tbody.innerHTML = data.documents.map(doc => {
                const cells = keys.map(key => {
                    let value = doc[key];
                    if (typeof value === 'object') value = JSON.stringify(value);
                    if (typeof value === 'string' && value.length > 50) value = value.substring(0, 50) + '...';
                    return `<td class="p-2 border-b">${value}</td>`;
                }).join('');
                
                return `<tr class="hover:bg-gray-50">
                    ${cells}
                    <td class="p-2 border-b">
                        <button onclick="deleteDoc('${doc.id || doc._id}')" class="text-red-600 hover:text-red-800 text-xs">Supprimer</button>
                    </td>
                </tr>`;
            }).join('');
        }

        async function deleteDoc(docId) {
            if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
            
            try {
                const response = await fetch(`${API_BASE}/collection/${currentCollection}/${docId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    alert('Document supprimé avec succès');
                    loadCollection(currentCollection);
                    loadStats();
                } else {
                    alert('Erreur lors de la suppression');
                }
            } catch (error) {
                alert('Erreur: ' + error.message);
            }
        }

        // Load initial data
        loadStats();
        loadCollections();
        
        // Auto-refresh stats every 30 seconds
        setInterval(loadStats, 30000);
    </script>
</body>
</html>
