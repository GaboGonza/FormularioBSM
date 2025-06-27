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

    // Tipo de formulario
    const tipoFormulario = data.form_type || "Desconocido";
    doc.font('Helvetica-Bold').fontSize(16).text(`Category: ${tipoFormulario}`);
    doc.moveDown(1);

    // =============================
    // SECCIONES DE DATOS
    // =============================
    const camposSecciones = [
      { label: "Requester Data", keys: ["Name", "user_email", "phone_number"] },
      { label: "Form Details", keys: ["date_today", "coordinator", "Statement_of_problem", "Goal_of_visit", "location"] },
      { label: "Supplier Contact Data", keys: ["Name_Supplier", "email_supplier", "phone_number_supplier"] },
      { label: "VWM Contact", keys: ["contact_vwm", "visit_date"] }
    ];

    // Folio primero
    if (data.folio) {
      doc.font('Helvetica-Bold').fontSize(12).text(`FOLIO:`);
      doc.font('Helvetica').fontSize(12).text(data.folio);
      doc.moveDown(0.5);
    }

    camposSecciones.forEach(section => {
      doc.moveDown(1);
      doc.font('Helvetica-Bold').fontSize(14).text(section.label);
      doc.moveDown(0.5);

      section.keys.forEach(key => {
        if (data[key]) {
          const value = Array.isArray(data[key]) ? data[key].join(", ") : data[key];
          doc.font('Helvetica-Bold').fontSize(12).text(`${key.replace(/_/g, " ").toUpperCase()}:`);
          doc.font('Helvetica').fontSize(12).text(value);
          doc.moveDown(0.3);
        }
      });
    });

    // =============================
    // TABLA DE DETALLES POR TIPO
    // =============================
    const toArray = (val) => Array.isArray(val) ? val : (val ? [val] : []);

    if (Array.isArray(data["part_number[]"]) || data["part_number[]"]) {
      const partNumbers = toArray(data["part_number[]"]);
      const formType = data.form_type || "Unknown";

      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(14).text(`Part Details Table - ${formType}`);
      doc.moveDown(1);

      partNumbers.forEach((_, i) => {
        doc.font('Helvetica-Bold').text(`Row #${i + 1}`);
        doc.font('Helvetica');

        doc.text(`Part Number: ${partNumbers[i] || ''}`);

        if (formType === "Tool Evaluation") {
          const quantityDelivered = toArray(data["quantity_delivered[]"]);
          const project = toArray(data["project[]"]);
          const nominatedCapacity = toArray(data["nominated_capacity[]"]);
          const currentCapacity = toArray(data["current_capacity[]"]);
          const tool = toArray(data["tool[]"]);
          const estimatedQuantity = toArray(data["estimated_quantity[]"]);

          doc.text(`Quantity Delivered: ${quantityDelivered[i] || ''}`);
          doc.text(`Project: ${project[i] || ''}`);
          doc.text(`Nominated Capacity: ${nominatedCapacity[i] || ''}`);
          doc.text(`Current Capacity: ${currentCapacity[i] || ''}`);
          doc.text(`Tool Refurbished (Yes/No): ${tool[i] || ''}`);
          doc.text(`Estimated Quantity Until EOP: ${estimatedQuantity[i] || ''}`);
        }

        else if (formType === "Capacity Evaluation") {
          const project = toArray(data["project[]"]);
          const nominatedCapacity = toArray(data["nominated_capacity[]"]);
          const currentCapacity = toArray(data["current_capacity[]"]);
          const ebr = toArray(data["ebr[]"]);
          const cycleTime = toArray(data["cycle_time[]"]);

          doc.text(`Project: ${project[i] || ''}`);
          doc.text(`Nominated Capacity: ${nominatedCapacity[i] || ''}`);
          doc.text(`Current Capacity: ${currentCapacity[i] || ''}`);
          doc.text(`EBR(%): ${ebr[i] || ''}`);
          doc.text(`Declared Cycle Time: ${cycleTime[i] || ''}`);
        }

        else if (formType === "Others") {
          const project = toArray(data["project[]"]);
          const nominatedCapacity = toArray(data["nominated_capacity[]"]);
          const currentCapacity = toArray(data["current_capacity[]"]);

          doc.text(`Project: ${project[i] || ''}`);
          doc.text(`Nominated Capacity: ${nominatedCapacity[i] || ''}`);
          doc.text(`Current Capacity: ${currentCapacity[i] || ''}`);
        }

        doc.moveDown(1);
      });
    }

    doc.end();

    // Envío de correo
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
        subject: "Blue Sheet form received.",
        text: "Attached you will find the completed form.",
        attachments: [{
          filename: `formulario_${cleanFolio}_${fechaHoy}.pdf`,
          path: filePath
        }]
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 Email successfully sent with attachment: formulario_${cleanFolio}_${fechaHoy}.pdf`);
      fs.unlinkSync(filePath);

      res.status(200).json({ success: true, message: "Email sent successfully" });
    });

    writeStream.on("error", (err) => {
      console.error("Error writing PDF:", err);
      res.status(500).json({ success: false, message: "Error generating PDF." });
    });

  } catch (err) {
    console.error("Error general:", err);
    res.status(500).json({ success: false, message: "Error processing form." });
  }
});

app.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});
