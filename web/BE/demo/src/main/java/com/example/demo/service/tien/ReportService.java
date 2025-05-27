package com.example.demo.service.tien;

import com.example.demo.repository.OrderRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
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

            // Font
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            // Tiêu đề
            Paragraph title = new Paragraph("BÁO CÁO DOANH THU", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(Chunk.NEWLINE);

            // Thông tin người xuất và ngày
            document.add(new Paragraph("Người xuất báo cáo: Nguyễn Văn A", normalFont));
            document.add(new Paragraph("Người phê duyệt: Trần Văn B", normalFont));
            document.add(new Paragraph("Ngày xuất: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont));

            document.add(Chunk.NEWLINE);

            // Bảng dữ liệu doanh thu
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);

            table.addCell("Tiêu chí");
            table.addCell("Giá trị");

            table.addCell("Tổng doanh thu");

            // gọi service hoặc fetch dữ liệu thực tế
            Double total = (Double) dashboardService.getTotalRevenue().getData();
            table.addCell(formatCurrency(total));

            document.add(table);

            document.add(Chunk.NEWLINE);

            // Footer
            Paragraph footer = new Paragraph("© 2025 - Hệ thống quản lý doanh thu", normalFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();

            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo file PDF: " + e.getMessage());
        }
    }

    private String formatCurrency(double amount) {
        return String.format("%,.0f VNĐ", amount);
    }
}
