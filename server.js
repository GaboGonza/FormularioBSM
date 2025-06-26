const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/enviar-formulario", async (req, res) => {
  try {
    const data = req.body;

    const doc = new PDFDocument();
    const folio = data.folio || `sin_folio`;
    const fechaHoy = new Date().toISOString().slice(0, 10); 

    const cleanFolio = folio.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filePath = path.join(__dirname, `formulario_${cleanFolio}_${fechaHoy}.pdf`);
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.font('Helvetica-Bold').fontSize(18).text("Blue Sheet Support Request", { underline: true, align: 'center' });
    doc.moveDown(1);

    const tipoFormulario = data.form_type || "Desconocido";
    doc.font('Helvetica-Bold').fontSize(16).text(`Category: ${tipoFormulario}`);
    doc.moveDown(1);

    const camposOrdenados = [
      "folio", "client", "user_email", "date", "cordinador", "proyect", "designation", "problem", "goal",
      "supplier", "location", "contact", "EBR(%)", "nominated_capacity",
      "current_capacity", "contact_vwm", "visit_date"
    ];

    camposOrdenados.forEach(key => {
      if (data[key]) {
        const value = Array.isArray(data[key]) ? data[key].join(", ") : data[key];
        doc.font('Helvetica-Bold').fontSize(12).text(`${key.toUpperCase()}:`);
        doc.font('Helvetica').fontSize(12).text(value);
        doc.moveDown(0.5);
      }
    });

    // Helper para convertir a array si es string
    const toArray = (val) => Array.isArray(val) ? val : (val ? [val] : []);

    const partNumbers = toArray(data["part_number[]"]);
    const quantityDelivered = toArray(data["quantity_delivered[]"]);
    const modelsAssembled = toArray(data["models_assembled[]"]);
    const refurbishDates = toArray(data["refurbish_date[]"]);
    const estimatedQuantities = toArray(data["estimated_quantity[]"]);

    if (partNumbers.length > 0) {
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(12).text("Part Details Table");
      doc.moveDown(1);

      partNumbers.forEach((_, i) => {
        doc.font('Helvetica-Bold').text(`No. #${i + 1}`);
        doc.font('Helvetica').text(`Part Number: ${partNumbers[i] || ''}`);
        doc.text(`Quantity Delivered: ${quantityDelivered[i] || ''}`);
        doc.text(`Models Assembled In: ${modelsAssembled[i] || ''}`);
        doc.text(`Refurbish: ${refurbishDates[i] || ''}`);
        doc.text(`Estimated Quantity Until EOP: ${estimatedQuantities[i] || ''}`);
        doc.moveDown(1);
      });
    }

    doc.end();

    writeStream.on("finish", async () => {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: ["gabriel.morales@proveed-vw.com.mx", data.user_email],
        subject: "Formulario Blue Sheet recibido",
        text: "Adjunto encontrarás el formulario llenado.",
        attachments: [{
          filename: `formulario_${cleanFolio}_${fechaHoy}.pdf`,
          path: filePath
        }]
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 Correo enviado con éxito con archivo: formulario_${cleanFolio}_${fechaHoy}.pdf`);
      fs.unlinkSync(filePath);

      res.status(200).json({ success: true, message: "Formulario enviado por correo con éxito." });
    });

    writeStream.on("error", (err) => {
      console.error("Error al escribir el PDF:", err);
      res.status(500).json({ success: false, message: "Error al generar el PDF." });
    });

  } catch (err) {
    console.error("Error general:", err);
    res.status(500).json({ success: false, message: "Error al enviar el formulario." });
  }
});

app.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});
