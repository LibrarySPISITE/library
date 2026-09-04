// Vercel Serverless Function.
// The Web3Forms access key lives ONLY here, as an environment variable
// set in the Vercel dashboard - never in the HTML/JS the browser
// downloads, and never committed to the (public) GitHub repo.
//
// Set this in Vercel: Project Settings -> Environment Variables
//   Name:  WEB3FORMS_ACCESS_KEY
//   Value: your real key from web3forms.com

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return res.status(500).json({
      success: false,
      message: "Server is missing WEB3FORMS_ACCESS_KEY. Set it in Vercel project settings.",
    });
  }

  const {
    book_title,
    book_isbn,
    student_email,
    student_id,
    student_name,
    student_phone,
  } = req.body || {};

  if (!book_title || !student_email || !student_id || !student_name || !student_phone) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  try {
    const web3formsRes = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: "Library Borrow Request: " + book_title,
        from_name: "SPI and SITE Library",
        book_title,
        book_isbn,
        student_email,
        student_id,
        student_name,
        student_phone,
      }),
    });

    const data = await web3formsRes.json();
    return res.status(web3formsRes.ok ? 200 : 502).json(data);
  } catch (err) {
    return res.status(502).json({ success: false, message: "Could not reach Web3Forms." });
  }
}
