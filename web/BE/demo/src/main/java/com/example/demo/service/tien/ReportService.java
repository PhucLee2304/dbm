package com.example.demo.service.tien;

import com.example.demo.repository.OrderRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final DashboardService dashboardService;

    public byte[] generatePdf() {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            // Load font từ classpath
            BaseFont baseFont = createCustomFont();
            Font titleFont = new Font(baseFont, 18, Font.BOLD);
            Font normalFont = new Font(baseFont, 12);

//            // Table header with no borders and alignment
//            PdfPTable table1 = new PdfPTable(2);
//            table1.setWidthPercentage(100);
//            table1.setSpacingBefore(10f);
//
//            PdfPCell h1 = new PdfPCell(new Phrase("CHUỖI CỬA HÀNG QUẦN ÁO ABC", normalFont));
//            h1.setHorizontalAlignment(Element.ALIGN_LEFT);
//            h1.setBorder(Rectangle.NO_BORDER);
//            table1.addCell(h1);
//
//            PdfPCell h2 = new PdfPCell(new Phrase("Mẫu số CH-ABC-01-TH", normalFont));
//            h2.setHorizontalAlignment(Element.ALIGN_CENTER);
//            h2.setBorder(Rectangle.NO_BORDER);
//            table1.addCell(h2);
//
//            PdfPCell h3 = new PdfPCell(new Phrase("Địa chỉ: 123/3 đường Lê Lợi, phường Bến Nghé, Quận 1, TP.HCM", normalFont));
////            h3.setColspan(2);
//            h3.setBorder(Rectangle.NO_BORDER);
//            table1.addCell(h3);
//
//            PdfPCell h4 = new PdfPCell(new Phrase("(Ban hành theo quyết định số 200/2025/GD-CH-ABC\nNgày 30/05/2025 của Chuỗi cửa hàng ABC", normalFont));
//            h4.setColspan(2);
//            h4.setBorder(Rectangle.NO_BORDER);
//            table1.addCell(h4);
//
//            PdfPCell h5 = new PdfPCell(new Phrase("MST: xxxxxxxxxxxx", normalFont));
//            h5.setColspan(2);
//            h5.setBorder(Rectangle.NO_BORDER);
//            table1.addCell(h5);
//
//            document.add(table1);
//            document.add(Chunk.NEWLINE);

            // ======= THÔNG TIN CỬA HÀNG =========
            document.add(new Paragraph("CHUỖI CỬA HÀNG QUẦN ÁO ABC", normalFont));
            document.add(new Paragraph("Địa chỉ: 123/3 đường Lê Lợi, phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh", normalFont));
            document.add(new Paragraph("MST: xxxxxxxxxxxx", normalFont));
            document.add(Chunk.NEWLINE);

            // ======= TIÊU ĐỀ =========
            Paragraph title = new Paragraph("BÁO CÁO TÀI CHÍNH TỔNG HỢP", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            // ======= NGÀY & NGƯỜI XUẤT =========
            document.add(new Paragraph("Người xuất báo cáo: Nguyễn Văn A", normalFont));
            document.add(new Paragraph("Ngày xuất: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont));
            document.add(Chunk.NEWLINE);

            // ======= DỮ LIỆU DOANH THU =========
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);

            addCellWithBorder(table, "Tiêu chí", normalFont, Element.ALIGN_CENTER);
            addCellWithBorder(table, "Giá trị", normalFont, Element.ALIGN_CENTER);

            addCellWithBorder(table, "Tổng doanh thu", normalFont, Element.ALIGN_LEFT);
            Double total = (Double) dashboardService.getTotalRevenue().getData();
            addCellWithBorder(table, formatCurrency(total), normalFont, Element.ALIGN_RIGHT);

            document.add(table);
            document.add(Chunk.NEWLINE);

            // ======= FOOTER =========
            Paragraph footer = new Paragraph("© CH-ABC 2025 - Hệ thống quản lý doanh thu", normalFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo file PDF: " + e.getMessage());
        }
    }

    private BaseFont createCustomFont() throws Exception {
        try {
            // Thử load font từ classpath trước
            ClassPathResource resource = new ClassPathResource("fonts/arial.ttf");
            if (resource.exists()) {
                try (InputStream fontStream = resource.getInputStream()) {
                    byte[] fontBytes = fontStream.readAllBytes();
                    return BaseFont.createFont("arial.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, true, fontBytes, null);
                }
            }
        } catch (Exception e) {
            // Nếu không tìm thấy font tùy chỉnh, sử dụng font có sẵn
            System.out.println("Không tìm thấy font tùy chỉnh, sử dụng font mặc định: " + e.getMessage());
        }

        // Fallback về font có sẵn
        return BaseFont.createFont(BaseFont.TIMES_ROMAN, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
    }

    // === HÀM HỖ TRỢ ===
    private void addCellWithBorder(PdfPTable table, String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(5);
        table.addCell(cell);
    }

    private String formatCurrency(double amount) {
        return String.format("%,.0f VNĐ", amount);
    }
}