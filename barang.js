
// ========== VARIABEL GLOBAL ==========
        let items = JSON.parse(localStorage.getItem('items')) || []; // Array untuk menyimpan semua barang
        let currentTrackingItem = null; // Barang yang sedang di-track
        let map = null; // Instance peta Leaflet
        let markers = []; // Array untuk marker di peta
        let polyline = null; // Garis rute di peta

        // User default untuk login
        const DEFAULT_USER = {
            username: 'admin',
            password: 'admin123'
        };

        // ========== FUNGSI CEK LOGIN ==========
        function checkLogin() {
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            if (isLoggedIn === 'true') {
                showMainApp();
            } else {
                showLoginPage();
            }
        }

        // ========== FUNGSI TAMPILKAN HALAMAN LOGIN ==========
        function showLoginPage() {
            document.getElementById('loginPage').classList.remove('hidden');
            document.getElementById('mainApp').classList.add('hidden');
        }

        // ========== FUNGSI TAMPILKAN APLIKASI UTAMA ==========
        function showMainApp() {
            document.getElementById('loginPage').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
        }

        // ========== FUNGSI LOGOUT ==========
        function logout() {
            if (confirm('Yakin ingin logout?')) {
                localStorage.removeItem('isLoggedIn');
                showLoginPage();
            }
        }

        // ========== EVENT LISTENER LOGIN FORM ==========
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            // Validasi username dan password
            if (username === DEFAULT_USER.username && password === DEFAULT_USER.password) {
                localStorage.setItem('isLoggedIn', 'true');
                showMainApp();
                alert('Login berhasil! Selamat datang, ' + username);
            } else {
                alert('Username atau password salah!');
            }
        });

        // ========== FUNGSI GENERATE KODE BARCODE UNIK ==========
        function generateCode() {
            const timestamp = Date.now(); // Timestamp unik
            const random = Math.floor(Math.random() * 1000); // Angka random
            return `BRG-${timestamp}-${random}`;
        }

        // ========== FUNGSI PINDAH SECTION/HALAMAN ==========
        function showSection(sectionName) {
            // Sembunyikan semua section
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            // Nonaktifkan semua tombol navbar
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            
            // Tampilkan section yang dipilih
            document.getElementById(sectionName).classList.add('active');
            
            // Aktifkan tombol navbar yang sesuai
            const buttons = document.querySelectorAll('.nav-btn');
            if (sectionName === 'input') buttons[0].classList.add('active');
            if (sectionName === 'tracking') buttons[1].classList.add('active');
            if (sectionName === 'list') buttons[2].classList.add('active');

            // Jika ke halaman list, tampilkan daftar barang
            if (sectionName === 'list') {
                displayItemsList();
            }
        }

        // ========== FUNGSI INISIALISASI PETA ==========
        function initMap(lat = 3.5952, lng = 98.6722) {
            // Default koordinat: Medan, Indonesia
            
            // Hapus peta lama jika ada
            if (map) {
                map.remove();
                map = null;
            }
            
            // Reset markers dan polyline
            markers = [];
            polyline = null;
            
            // Buat peta baru dengan Leaflet
            map = L.map('map').setView([lat, lng], 13);
            
            // Tambahkan layer tile OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);
            
            // Perbaiki render peta setelah dibuat
            setTimeout(() => {
                if (map) {
                    map.invalidateSize();
                }
            }, 200);
            
            return map;
        }

        // ========== FUNGSI TAMBAH MARKER KE PETA ==========
        function addMarkerToMap(lat, lng, title, isCurrentLocation = false) {
            const marker = L.marker([lat, lng]).addTo(map);
            
            // Popup berbeda untuk lokasi saat ini
            if (isCurrentLocation) {
                marker.bindPopup(`<b>📍 ${title}</b><br><small>Lokasi saat ini</small>`).openPopup();
            } else {
                marker.bindPopup(`<b>${title}</b>`);
            }
            
            markers.push(marker);
            return marker;
        }

        // ========== FUNGSI GAMBAR RUTE DI PETA ==========
        function drawRoute(locations) {
            // Minimal butuh 2 lokasi untuk membuat rute
            if (locations.length < 2) return;
            
            // Konversi array lokasi ke format koordinat Leaflet
            const latlngs = locations.map(loc => [loc.lat, loc.lng]);
            
            // Hapus polyline lama jika ada
            if (polyline) {
                map.removeLayer(polyline);
            }
            
            // Buat polyline (garis) baru
            polyline = L.polyline(latlngs, {
                color: '#667eea',
                weight: 3,
                opacity: 0.7,
                dashArray: '10, 10' // Garis putus-putus
            }).addTo(map);
            
            // Zoom peta untuk menampilkan seluruh rute
            map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
        }

        // ========== EVENT LISTENER FORM INPUT BARANG ==========
        document.getElementById('itemForm').addEventListener('submit', function(e) {
            e.preventDefault(); // Mencegah reload halaman
            
            // Generate kode barcode unik
            const code = generateCode();
            
            // Buat objek barang baru
            const item = {
                code: code,
                name: document.getElementById('itemName').value,
                description: document.getElementById('itemDesc').value,
                weight: document.getElementById('itemWeight').value,
                destination: document.getElementById('itemDestination').value,
                receiver: document.getElementById('itemReceiver').value,
                status: 'warehouse', // Status awal: di gudang
                createdAt: new Date().toISOString(),
                timeline: [
                    {
                        status: 'warehouse',
                        location: 'Gudang Pusat',
                        timestamp: new Date().toISOString(),
                        note: 'Barang diterima di gudang',
                        lat: 3.5952, // Koordinat Medan
                        lng: 98.6722
                    }
                ]
            };

            // Simpan ke array dan localStorage
            items.push(item);
            localStorage.setItem('items', JSON.stringify(items));

            // Generate barcode menggunakan JsBarcode
            JsBarcode("#barcode", code, {
                format: "CODE128",
                width: 2,
                height: 100,
                displayValue: true
            });

            // Tampilkan hasil barcode
            document.getElementById('generatedCode').textContent = code;
            document.getElementById('barcodeResult').style.display = 'block';
            
            // Reset form
            document.getElementById('itemForm').reset();
            
            // Notifikasi sukses
            setTimeout(() => {
                alert('Barang berhasil disimpan! Kode: ' + code);
            }, 100);
        });

        // ========== FUNGSI PRINT BARCODE ==========
        function printBarcode() {
            window.print();
        }

        // ========== FUNGSI TRACKING BARANG ==========
        function trackItem() {
            const code = document.getElementById('trackingCode').value.trim();
            
            // Reload data terbaru dari localStorage
            items = JSON.parse(localStorage.getItem('items')) || [];
            
            const item = items.find(i => i.code === code);

            // Validasi: barang tidak ditemukan
            if (!item) {
                alert('Barang tidak ditemukan! Periksa kembali kode barcode.');
                return;
            }

            currentTrackingItem = item;
            
            // Tampilkan informasi barang
            document.getElementById('trackItemCode').textContent = item.code;
            document.getElementById('trackItemName').textContent = item.name;
            document.getElementById('trackItemDest').textContent = item.destination;
            document.getElementById('trackItemReceiver').textContent = item.receiver || '-';
            
            // Mapping status
            const statusMap = {
                warehouse: { text: 'Di Gudang', class: 'status-warehouse' },
                transit: { text: 'Dalam Perjalanan', class: 'status-transit' },
                delivered: { text: 'Terkirim', class: 'status-delivered' }
            };
            
            const itemStatus = item.status || 'warehouse';
            const status = statusMap[itemStatus] || statusMap['warehouse'];
            
            // Update badge status
            const statusBadge = document.getElementById('trackItemStatus');
            statusBadge.textContent = status.text;
            statusBadge.className = 'status-badge ' + status.class;

            // Ambil semua lokasi yang punya koordinat
            const locations = item.timeline
                .filter(entry => entry.lat && entry.lng)
                .map(entry => ({
                    lat: parseFloat(entry.lat),
                    lng: parseFloat(entry.lng),
                    location: entry.location,
                    timestamp: entry.timestamp
                }));

            console.log('Locations with coordinates:', locations); // Debug

            // Inisialisasi peta
            if (locations.length > 0) {
                const lastLocation = locations[locations.length - 1];
                initMap(lastLocation.lat, lastLocation.lng);
                
                // Tunggu peta selesai di-render
                setTimeout(() => {
                    // Tambahkan marker untuk setiap lokasi
                    locations.forEach((loc, index) => {
                        const isLast = index === locations.length - 1;
                        addMarkerToMap(loc.lat, loc.lng, loc.location, isLast);
                    });
                    
                    // Gambar rute jika ada lebih dari 1 lokasi
                    if (locations.length > 1) {
                        drawRoute(locations);
                    }
                }, 300);
            } else {
                // Jika tidak ada koordinat, tampilkan peta default
                initMap();
                setTimeout(() => {
                    addMarkerToMap(3.5952, 98.6722, 'Gudang Pusat', true);
                }, 300);
            }

            // Tampilkan timeline riwayat perjalanan
            const timeline = document.getElementById('trackTimeline');
            timeline.innerHTML = '';
            
            item.timeline.slice().reverse().forEach((entry, index) => {
                const div = document.createElement('div');
                div.className = 'timeline-item' + (index === 0 ? ' active' : '');
                const date = new Date(entry.timestamp).toLocaleString('id-ID');
                const entryStatus = statusMap[entry.status] || statusMap['warehouse'];
                
                div.innerHTML = `
                    <strong>${entryStatus.text}</strong><br>
                    <small>${entry.location}</small><br>
                    <small style="color: #999;">${date}</small>
                    ${entry.note ? `<br><small>${entry.note}</small>` : ''}
                    ${entry.lat && entry.lng ? `<br><small style="color: #667eea;">📍 ${parseFloat(entry.lat).toFixed(4)}, ${parseFloat(entry.lng).toFixed(4)}</small>` : ''}
                `;
                timeline.appendChild(div);
            });

            // Tampilkan hasil tracking
            document.getElementById('trackingResult').style.display = 'block';
            
            // Scroll ke hasil
            setTimeout(() => {
                document.getElementById('trackingResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }

        // ========== FUNGSI BUKA MODAL UPDATE STATUS ==========
        function updateStatus() {
            document.getElementById('statusModal').classList.add('active');
        }

        // ========== FUNGSI TUTUP MODAL ==========
        function closeModal() {
            document.getElementById('statusModal').classList.remove('active');
        }

        // ========== EVENT LISTENER FORM UPDATE STATUS ==========
        document.getElementById('statusForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!currentTrackingItem) return;

            // Ambil data dari form
            const newStatus = document.getElementById('newStatus').value;
            const location = document.getElementById('currentLocation').value;
            const note = document.getElementById('statusNote').value;
            const lat = document.getElementById('locationLat').value;
            const lng = document.getElementById('locationLng').value;

            console.log('Form values:', { newStatus, location, lat, lng, note }); // Debug

            // Cari index barang di array
            const itemIndex = items.findIndex(i => i.code === currentTrackingItem.code);
            
            // Buat entry timeline baru
            const timelineEntry = {
                status: newStatus,
                location: location,
                timestamp: new Date().toISOString(),
                note: note
            };

            // Tambahkan koordinat jika diisi (dan valid)
            if (lat && lng && lat.trim() !== '' && lng.trim() !== '') {
                const latNum = parseFloat(lat);
                const lngNum = parseFloat(lng);
                
                if (!isNaN(latNum) && !isNaN(lngNum)) {
                    timelineEntry.lat = latNum;
                    timelineEntry.lng = lngNum;
                    console.log('Coordinates added:', latNum, lngNum); // Debug
                } else {
                    console.log('Invalid coordinates'); // Debug
                }
            }

            // Update status dan tambahkan ke timeline
            items[itemIndex].status = newStatus;
            items[itemIndex].timeline.push(timelineEntry);

            console.log('Updated item:', items[itemIndex]); // Debug

            // Simpan ke localStorage
            localStorage.setItem('items', JSON.stringify(items));
            
            // Tutup modal dan reset form
            closeModal();
            document.getElementById('statusForm').reset();
            
            // Refresh tampilan tracking dengan delay
            setTimeout(() => {
                document.getElementById('trackingCode').value = currentTrackingItem.code;
                trackItem();
            }, 100);
            
            alert('Status berhasil diupdate! Peta akan diperbarui.');
        });

        // ========== FUNGSI TAMPILKAN DAFTAR BARANG ==========
        function displayItemsList() {
            const container = document.getElementById('itemsList');
            
            // Reload data dari localStorage
            items = JSON.parse(localStorage.getItem('items')) || [];

            console.log('Total items:', items.length); // Debug
            console.log('Items data:', items); // Debug

            // Jika tidak ada barang
            if (items.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Belum ada barang yang terdaftar.</p>';
                return;
            }

            container.innerHTML = ''; // Kosongkan container

            // Mapping status
            const statusMap = {
                warehouse: { text: 'Di Gudang', class: 'status-warehouse' },
                transit: { text: 'Dalam Perjalanan', class: 'status-transit' },
                delivered: { text: 'Terkirim', class: 'status-delivered' }
            };

            // Loop setiap barang dan buat card
            items.forEach(item => {
                const itemStatus = item.status || 'warehouse';
                const status = statusMap[itemStatus] || statusMap['warehouse'];
                
                const card = document.createElement('div');
                card.className = 'item-card';
                card.innerHTML = `
                    <div class="item-header">
                        <div class="item-code">${item.code}</div>
                        <div class="status-badge ${status.class}">${status.text}</div>
                    </div>
                    <div class="item-details">
                        <p><strong>Nama:</strong> ${item.name || '-'}</p>
                        <p><strong>Tujuan:</strong> ${item.destination || '-'}</p>
                        <p><strong>Berat:</strong> ${item.weight || '-'} kg</p>
                        <p><strong>Penerima:</strong> ${item.receiver || '-'}</p>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-primary btn-small" onclick="viewDetail('${item.code}')">Detail</button>
                        <button class="btn btn-danger btn-small" onclick="deleteItem('${item.code}')">Hapus</button>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        // ========== FUNGSI LIHAT DETAIL BARANG ==========
        function viewDetail(code) {
            document.getElementById('trackingCode').value = code;
            showSection('tracking');
            document.querySelectorAll('.nav-btn')[1].classList.add('active');
            trackItem();
        }

        // ========== FUNGSI HAPUS BARANG ==========
        function deleteItem(code) {
            if (confirm('Yakin ingin menghapus barang ini?')) {
                items = items.filter(i => i.code !== code);
                localStorage.setItem('items', JSON.stringify(items));
                displayItemsList();
                alert('Barang berhasil dihapus!');
            }
        }

        // ========== FUNGSI FILTER/SEARCH DAFTAR BARANG ==========
        function filterList() {
            const search = document.getElementById('searchList').value.toLowerCase();
            const cards = document.querySelectorAll('#itemsList .item-card');
            
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(search) ? 'block' : 'none';
            });
        }

        // ========== EVENT LISTENER KLIK DI LUAR MODAL ==========
        window.onclick = function(event) {
            const modal = document.getElementById('statusModal');
            if (event.target === modal) {
                closeModal();
            }
        }

        // ========== JALANKAN CEK LOGIN SAAT HALAMAN DIMUAT ==========
        checkLogin();