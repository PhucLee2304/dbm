package com.example.demo.utils;

import com.example.demo.dto.vanh.SalaryInvoiceDTO;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;

import java.io.OutputStream;
import java.time.format.DateTimeFormatter;

public class PdfInvoiceExporter {

    public static void exportInvoice(OutputStream outputStream, SalaryInvoiceDTO invoice) throws Exception {
        Document document = new Document();
        PdfWriter.getInstance(document, outputStream);
        document.open();

        Font titleFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD);
        Font labelFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
        Font textFont = new Font(Font.FontFamily.HELVETICA, 12);

        // Tiêu đề
        Paragraph title = new Paragraph("EMPLOYEE SALARY INVOICE", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20f);
        document.add(title);

// Basic information
        document.add(new Paragraph("Staff ID: " + invoice.getStaffId(), textFont));
        document.add(new Paragraph("Staff Name: " + invoice.getStaffName(), textFont));
        document.add(new Paragraph("Period: " + invoice.getMonth() + "/" + invoice.getYear(), textFont));
        document.add(new Paragraph("Invoice Date: " + invoice.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), textFont));
        document.add(Chunk.NEWLINE);

// Detailed info table
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new int[]{1, 2});

        addRow(table, "Total Hours Worked:", invoice.getTotalHours() + " hours", labelFont, textFont);
        addRow(table, "Hourly Rate:", String.format("%,.0f VND", invoice.getHourlySalary()), labelFont, textFont);
        addRow(table, "Total Salary:", String.format("%,.0f VND", invoice.getTotalSalary()), labelFont, textFont);
        addRow(table, "Payment Status:", invoice.isPaid() ? "✓ Paid" : "✗ Unpaid", labelFont, textFont);

        document.add(table);

        document.close();
    }

    private static void addRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell cell1 = new PdfPCell(new Phrase(label, labelFont));
        PdfPCell cell2 = new PdfPCell(new Phrase(value, valueFont));
        cell1.setBorder(Rectangle.NO_BORDER);
        cell2.setBorder(Rectangle.NO_BORDER);
        table.addCell(cell1);
        table.addCell(cell2);
    }
}
