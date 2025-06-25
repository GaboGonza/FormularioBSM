const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;  // Render usará el puerto dinámico

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Middleware para parsear datos de formularios y JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ruta principal para servir el HTML (para que Render no marque 404)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Endpoint para procesar el formulario
app.post("/enviar-formulario", async (req, res) => {
  try {
    const data = req.body;

    // Crear PDF
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `formulario_${Date.now()}.pdf`);
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.font('Helvetica-Bold').fontSize(18).text("Blue Sheet Support Request", { underline: true });
    doc.moveDown(1);

    const camposOrdenados = [
      "folio", "client", "date", "cordinador", "proyect",
      "milestones", "designation", "problem", "goal",
      "supplier", "location", "contact", "nominated_capacity",
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

    const longitud = (data["part_number[]"] || []).length;
    if (longitud > 0) {
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(14).text("🧾 Part Details Table");
      doc.moveDown(1);

      for (let i = 0; i < longitud; i++) {
        doc.font('Helvetica-Bold').text(`Part #${i + 1}`);
        doc.font('Helvetica').text(`Part Number: ${data["part_number[]"][i] || ''}`);
        doc.text(`Quantity Delivered: ${data["quantity_delivered[]"][i] || ''}`);
        doc.text(`Models Assembled In: ${data["models_assembled[]"][i] || ''}`);
        doc.text(`Refurbish: ${data["refurbish_date[]"][i] || ''}`);
        doc.text(`Estimated Quantity Until EOP: ${data["estimated_quantity[]"][i] || ''}`);
        doc.moveDown(1);
      }
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
        to: "ggonza1999@gmail.com",
        subject: "Formulario Blue Sheet recibido",
        text: "Adjunto encontrarás el formulario llenado.",
        attachments: [{
          filename: "formulario.pdf",
          path: filePath
        }]
      };

      await transporter.sendMail(mailOptions);

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
