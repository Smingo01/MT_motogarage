/* ================================
   SUPABASE CONFIG & AUTH (ฉบับแก้ไข)
================================ */

const ADMIN_EMAIL = "name2015za@gmail.com";
const SB_URL = "https://hnepbmkiibeiwinxjpwj.supabase.co"; 
const SB_KEY = "sb_publishable_1MesXNX8mMgwhCyboN2Qlw_HU6M3gFM"; 

const supabase = window.supabase.createClient(SB_URL, SB_KEY);

// ... (openLogin/closeLogin คงเดิม)

async function login() {
    const emailInput = document.getElementById("email").value.trim();
    const passwordInput = document.getElementById("password").value;

    if (!emailInput || !passwordInput) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ 
        email: emailInput, 
        password: passwordInput 
    });

    if (error) {
        alert("เข้าสู่ระบบไม่สำเร็จ: " + error.message);
        return;
    }

    closeLogin();

    // ส่วนที่แก้ไข: ดักจับอีเมลให้แม่นยำ 100%
    const userEmail = data.user.email.toLowerCase().trim();
    const adminEmailTarget = ADMIN_EMAIL.toLowerCase().trim();

    if (userEmail === adminEmailTarget) {
        alert("ยินดีต้อนรับคุณแอดมิน! กำลังพาไปหน้าจัดการสต็อก...");
        // บังคับเปลี่ยนหน้า (ใช้ URL ตรงเพื่อป้องกันปัญหา Live Server)
        window.location.assign("admin.html"); 
    } else {
        alert("คุณคือ: " + userEmail + " (ไม่มีสิทธิ์แอดมิน)");
    }
}

/* ================================
   PAGE SWITCH (คงเดิม)
================================ */
window.showPage = function(pageId) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    const target = document.getElementById('page-' + pageId);
    if(target) target.classList.remove('hidden');
    if (pageId === 'inventory') fetchBikes();
    if (pageId === 'calc') calculateLoan();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* ================================
   LOAN CALCULATOR (คงเดิม)
================================ */
window.calculateLoan = function() {
    const price = Number(document.getElementById('c_price').value) || 0;
    const downPercent = Number(document.getElementById('c_down').value) || 0;
    const ratePercent = Number(document.getElementById('c_rate').value) || 5;
    const months = Number(document.getElementById('c_months').value) || 48;
    const downPayment = price * (downPercent / 100);
    const finance = price - downPayment;
    const years = months / 12;
    const totalInterest = finance * (ratePercent / 100) * years;
    const totalAmount = finance + totalInterest;
    const monthly = totalAmount / months;
    document.getElementById('calc-result').innerText = '฿' + Math.round(monthly).toLocaleString();
    document.getElementById('finance-amount').innerText = '฿' + Math.round(finance).toLocaleString();
    document.getElementById('total-interest').innerText = '฿' + Math.round(totalInterest).toLocaleString();
    document.getElementById('total-amount').innerText = '฿' + Math.round(totalAmount).toLocaleString();
};

window.fillCalc = function(price) {
    document.getElementById('c_price').value = price;
    showPage('calc');
};

/* ================================
   FETCH BIKES (คงเดิม)
================================ */
async function fetchBikes() {
    const list = document.getElementById('bike-list');
    if (!list) return;
    list.innerHTML = `<p class="col-span-full text-center py-20 text-gray-500 animate-pulse">กำลังค้นหารถในสต็อก...</p>`;
    const { data, error } = await supabase.from('bikes').select('*').order('created_at', { ascending: false });
    if (error) {
        list.innerHTML = `<p class="text-red-500 text-center col-span-full">เกิดข้อผิดพลาด: ${error.message}</p>`;
        return;
    }
    if (!data || data.length === 0) {
        list.innerHTML = `<p class="col-span-full text-center py-20 text-gray-500 italic">ขออภัย ยังไม่มีรถในสต็อกตอนนี้</p>`;
        return;
    }
    list.innerHTML = data.map(bike => `
        <div class="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-800 hover:border-red-600 transition-all duration-300 group shadow-lg">
            <div class="relative h-64 overflow-hidden">
                <img src="${bike.image_url || 'https://via.placeholder.com/600x400'}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                <div class="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded italic uppercase">${bike.brand || 'Bigbike'}</div>
            </div>
            <div class="p-6">
                <h3 class="text-2xl font-bold mb-2 group-hover:text-red-500 transition">${bike.name}</h3>
                <div class="flex justify-between items-end mt-6">
                    <div>
                        <p class="text-gray-500 text-[10px] uppercase font-bold tracking-widest">ราคาเงินสด</p>
                        <p class="text-3xl font-black text-white italic">฿${Number(bike.price).toLocaleString()}</p>
                    </div>
                    <div class="flex flex-col gap-2">
                         <button onclick="fillCalc(${bike.price})" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition">คำนวณผ่อน</button>
                         <a href="https://line.me/ti/p/~0910078100" target="_blank" class="bg-white text-black px-3 py-1.5 rounded-lg font-bold text-xs text-center">สนใจทักแชท</a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/* ================================
   INIT (คงเดิม)
================================ */
document.addEventListener('DOMContentLoaded', function() {
    fetchBikes();
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            const loginBtn = document.getElementById('loginBtn');
            if(loginBtn) loginBtn.innerText = "Dashboard";
        }
    });
});