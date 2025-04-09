// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

admin.initializeApp();
const db = admin.firestore();

exports.createInvoice = onRequest(async (req, res) => {
  const orderId = req.query.orderId;

  if (!orderId) {
    res.status(400).send("Missing orderId");
    return;
  }

  try {
    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      res.status(404).send("Order not found");
      return;
    }

    const order = orderSnap.data();

    // PDF作成
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let y = 760;
    const drawText = (text, x = 50, size = 12) => {
      page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });
      y -= size + 4;
    };

    drawText("発注書", 50, 20);
    drawText(`注文番号: ${orderId}`);
    drawText(`会社名: ${order.companyName}`);
    drawText(`現場名: ${order.siteName || "-"}`);
    drawText(`担当者: ${order.personName || "-"}`);
    drawText(`納品場所: ${order.deliveryLocation || "-"}`);
    drawText("--------------------------------------");

    order.items.forEach((item, index) => {
      drawText(`${index + 1}. ${item.name} - 数量: ${item.quantity} - 単価: ¥${item.price}`);
    });

    const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    drawText("--------------------------------------");
    drawText(`合計金額: ¥${total.toLocaleString()}`);

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=invoice_${orderId}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error("Error creating invoice:", err);
    res.status(500).send("Internal Server Error");
  }
});
