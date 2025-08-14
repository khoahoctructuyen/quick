const URL_GET = "https://api.nguyenminh.me/github-actions/get-email.php";
const URL_SAVE = "https://api.nguyenminh.me/github-actions/save-result.php";
const VERIFY_API = "http://api.quickemailverification.com/v1/verify";
const CHECK_LIMIT_API = "https://api.nguyenminh.me/github-actions/check-limit.php"; // API kiểm tra lượt
const API_KEY = "65f327333f59df925e1ec4c1f678205fd77b7d822e39282d53344bd0ff05";

async function main() {
  try {
    // 1. Kiểm tra lượt còn lại nganttk
    console.log("🔑 Đang kiểm tra giới hạn API...");
    const limitRes = await fetch(`${CHECK_LIMIT_API}?apikey=${API_KEY}`);
    if (!limitRes.ok) throw new Error(`Lỗi khi check limit: ${limitRes.statusText}`);
    const { allow } = await limitRes.json();

    if (!allow) {
      console.log("⛔ Đã hết lượt, bỏ qua lần chạy này.");
      process.exit(0);
    }

    console.log("🚀 Bắt đầu lấy email...");
    const emailRes = await fetch(URL_GET, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apikey: API_KEY })
    });
    if (!emailRes.ok) throw new Error(`Lỗi khi POST email: ${emailRes.statusText}`);
    const { email } = await emailRes.json();
    
    if (!email) {
      console.log("⛔ Không có email để xử lý, kết thúc job.");
      process.exit(0);
    }
    
    console.log(`📩 Email lấy được: ${email}`);
    
    // 3. Verify email
    console.log(`🔍 Đang verify: ${email}`);
    const verifyRes = await fetch(`${VERIFY_API}?email=${encodeURIComponent(email)}&apikey=${API_KEY}`);
    if (!verifyRes.ok) throw new Error(`Lỗi khi verify: ${verifyRes.statusText}`);
    const verifyData = await verifyRes.json();
    console.log("✅ Kết quả verify:", verifyData);


    // 4. Lưu kết quả
    console.log("💾 Đang lưu kết quả...");
    const saveRes = await fetch(URL_SAVE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, verify_data: verifyData })
    });
    if (!saveRes.ok) throw new Error(`Save thất bại: ${saveRes.statusText}`);

    console.log("🎉 Hoàn tất!");
    process.exit(0);

  } catch (err) {
    console.error("❌ Lỗi:", err.message);
    process.exit(1);
  }
}

main();
