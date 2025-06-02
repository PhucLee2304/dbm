package com.example.demo.service.tien;

import com.example.demo.dto.tien.EachDayRevenueLastMonthDTO;
import com.example.demo.dto.tien.TopCustomerDTO;
import com.example.demo.dto.tien.TopProductDTO;
import com.example.demo.dto.tien.TopStaffDTO;
import com.example.demo.entity.User;
import com.example.demo.repository.OrderRepository;
import com.example.demo.utils.ResponseData;
import com.example.demo.utils.UserUtil;
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
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final DashboardService dashboardService;
    private final UserUtil userUtil;

    public byte[] generatePdf() {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            // Load font từ classpath
            BaseFont baseFont = createCustomFont();
            Font titleFont = new Font(baseFont, 18, Font.BOLD);
            Font subtitleFont = new Font(baseFont, 14, Font.BOLD);
            Font normalFont = new Font(baseFont, 12);

            // Thêm các phần của báo cáo
            addStoreInfo(document, normalFont);
            addReportTitle(document, titleFont);
            addReportMetadata(document, normalFont);
            
            // Thêm nội dung báo cáo
            addRevenueData(document, subtitleFont, normalFont);
            addOrderStatistics(document, subtitleFont, normalFont);
            addUserStatistics(document, subtitleFont, normalFont);
            addTopProductsTable(document, subtitleFont, normalFont);
            addTopStaffTable(document, subtitleFont, normalFont);
            addTopCustomersTable(document, subtitleFont, normalFont);
            
            // Footer
            addFooter(document, normalFont);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo file PDF: " + e.getMessage());
        }
    }

    private void addStoreInfo(Document document, Font font) throws DocumentException {
        document.add(new Paragraph("CHUỖI CỬA HÀNG QUẦN ÁO ABC", font));
        document.add(new Paragraph("Địa chỉ: 123/3 đường Lê Lợi, phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh", font));
        document.add(new Paragraph("MST: xxxxxxxxxxxx", font));
        document.add(Chunk.NEWLINE);
    }

    private void addReportTitle(Document document, Font titleFont) throws DocumentException {
        Paragraph title = new Paragraph("BÁO CÁO TÀI CHÍNH TỔNG HỢP", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(Chunk.NEWLINE);
    }

    private void addReportMetadata(Document document, Font normalFont) throws DocumentException {
        // Lấy thông tin người dùng hiện tại
        ResponseData userResponse = userUtil.getUserInfo();
        String userName = "Admin";
        
        if (userResponse.isSuccess() && userResponse.getData() != null) {
            User user = (User) userResponse.getData();
            userName = user.getName();
        }
        
        Font italicFont = new Font(normalFont.getBaseFont(), normalFont.getSize(), Font.ITALIC);
        
        document.add(new Paragraph("Người xuất báo cáo: " + userName, italicFont));
        document.add(new Paragraph("Ngày xuất: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), italicFont));
        document.add(Chunk.NEWLINE);
    }

    private void addRevenueData(Document document, Font subtitleFont, Font normalFont) throws DocumentException {
        Paragraph subtitle = new Paragraph("I. THỐNG KÊ DOANH THU", subtitleFont);
        subtitle.setAlignment(Element.ALIGN_LEFT);
        document.add(subtitle);
        document.add(Chunk.NEWLINE);
        
        // Thêm đơn vị tính
        Paragraph unit = new Paragraph("Đơn vị tính: VNĐ", normalFont);
        unit.setAlignment(Element.ALIGN_RIGHT);
        document.add(unit);
        
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);

        addCellWithBorder(table, "Tiêu chí", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "Giá trị", normalFont, Element.ALIGN_CENTER);
        
        // Thêm hàng STT cột
        addCellWithBorder(table, "1", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "2", normalFont, Element.ALIGN_CENTER);

        addCellWithBorder(table, "Tổng doanh thu", normalFont, Element.ALIGN_LEFT);
        Double total = (Double) dashboardService.getTotalRevenue().getData();
        addCellWithBorder(table, formatCurrency(total), normalFont, Element.ALIGN_RIGHT);

        document.add(table);
        document.add(Chunk.NEWLINE);
    }

    private void addOrderStatistics(Document document, Font subtitleFont, Font normalFont) throws DocumentException {
        Paragraph subtitle = new Paragraph("II. THỐNG KÊ ĐƠN HÀNG", subtitleFont);
        subtitle.setAlignment(Element.ALIGN_LEFT);
        document.add(subtitle);
        document.add(Chunk.NEWLINE);
        
        // Thêm đơn vị tính
        Paragraph unit = new Paragraph("Đơn vị tính: Đơn hàng", normalFont);
        unit.setAlignment(Element.ALIGN_RIGHT);
        document.add(unit);
        
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);

        addCellWithBorder(table, "Tiêu chí", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "Số lượng", normalFont, Element.ALIGN_CENTER);
        
        // Thêm hàng STT cột
        addCellWithBorder(table, "1", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "2", normalFont, Element.ALIGN_CENTER);

        Long totalOrders = (Long) dashboardService.getTotalOrders().getData();
        Long totalOnlineOrders = (Long) dashboardService.getTotalOnlineOrders().getData();
        Long totalOfflineOrders = (Long) dashboardService.getTotalOfflineOrders().getData();

        addCellWithBorder(table, "Tổng số đơn hàng", normalFont, Element.ALIGN_LEFT);
        addCellWithBorder(table, String.valueOf(totalOrders), normalFont, Element.ALIGN_RIGHT);

        addCellWithBorder(table, "Đơn hàng online", normalFont, Element.ALIGN_LEFT);
        addCellWithBorder(table, String.valueOf(totalOnlineOrders), normalFont, Element.ALIGN_RIGHT);

        addCellWithBorder(table, "Đơn hàng offline", normalFont, Element.ALIGN_LEFT);
        addCellWithBorder(table, String.valueOf(totalOfflineOrders), normalFont, Element.ALIGN_RIGHT);

        document.add(table);
        document.add(Chunk.NEWLINE);
    }

    private void addUserStatistics(Document document, Font subtitleFont, Font normalFont) throws DocumentException {
        Paragraph subtitle = new Paragraph("III. THỐNG KÊ NGƯỜI DÙNG", subtitleFont);
        subtitle.setAlignment(Element.ALIGN_LEFT);
        document.add(subtitle);
        document.add(Chunk.NEWLINE);
        
        // Thêm đơn vị tính
        Paragraph unit = new Paragraph("Đơn vị tính: Người/Sản phẩm", normalFont);
        unit.setAlignment(Element.ALIGN_RIGHT);
        document.add(unit);
        
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);

        addCellWithBorder(table, "Tiêu chí", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "Số lượng", normalFont, Element.ALIGN_CENTER);
        
        // Thêm hàng STT cột
        addCellWithBorder(table, "1", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "2", normalFont, Element.ALIGN_CENTER);

        Long totalUsers = (Long) dashboardService.getTotalUsers().getData();
        Long totalCustomers = (Long) dashboardService.getTotalCustomers().getData();
        Long totalStaffs = (Long) dashboardService.getTotalStaffs().getData();
        Long totalProducts = (Long) dashboardService.getTotalProducts().getData();

        addCellWithBorder(table, "Tổng người dùng", normalFont, Element.ALIGN_LEFT);
        addCellWithBorder(table, String.valueOf(totalUsers), normalFont, Element.ALIGN_RIGHT);

        addCellWithBorder(table, "Tổng số khách hàng", normalFont, Element.ALIGN_LEFT);
        addCellWithBorder(table, String.valueOf(totalCustomers), normalFont, Element.ALIGN_RIGHT);

        addCellWithBorder(table, "Tổng số nhân viên", normalFont, Element.ALIGN_LEFT);
        addCellWithBorder(table, String.valueOf(totalStaffs), normalFont, Element.ALIGN_RIGHT);
        
        addCellWithBorder(table, "Tổng số sản phẩm", normalFont, Element.ALIGN_LEFT);
        addCellWithBorder(table, String.valueOf(totalProducts), normalFont, Element.ALIGN_RIGHT);

        document.add(table);
        document.add(Chunk.NEWLINE);
    }

    private void addTopProductsTable(Document document, Font subtitleFont, Font normalFont) throws DocumentException {
        Paragraph subtitle = new Paragraph("IV. TOP 5 SẢN PHẨM BÁN CHẠY NHẤT", subtitleFont);
        subtitle.setAlignment(Element.ALIGN_LEFT);
        document.add(subtitle);
        document.add(Chunk.NEWLINE);

        ResponseData topProductsResponse = dashboardService.getTopProducts();
        if (!topProductsResponse.isSuccess() || topProductsResponse.getData() == null) {
            document.add(new Paragraph("Không có dữ liệu sản phẩm", normalFont));
            document.add(Chunk.NEWLINE);
            return;
        }

        List<TopProductDTO> topProducts = (List<TopProductDTO>) topProductsResponse.getData();
        if (topProducts.isEmpty()) {
            document.add(new Paragraph("Không có dữ liệu sản phẩm", normalFont));
            document.add(Chunk.NEWLINE);
            return;
        }
        
        // Thêm đơn vị tính
        Paragraph unit = new Paragraph("Đơn vị tính: Cái/VNĐ", normalFont);
        unit.setAlignment(Element.ALIGN_RIGHT);
        document.add(unit);

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);

        addCellWithBorder(table, "STT", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "Tên sản phẩm", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "Số lượng đã bán", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "Doanh thu", normalFont, Element.ALIGN_CENTER);
        
        // Thêm hàng STT cột
        addCellWithBorder(table, "1", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "2", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "3", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "4", normalFont, Element.ALIGN_CENTER);

        int stt = 1;
        for (TopProductDTO product : topProducts) {
            addCellWithBorder(table, String.valueOf(stt++), normalFont, Element.ALIGN_CENTER);
            addCellWithBorder(table, product.getName(), normalFont, Element.ALIGN_LEFT);
            addCellWithBorder(table, String.valueOf(product.getTotalQuantitySold()), normalFont, Element.ALIGN_RIGHT);
            addCellWithBorder(table, formatCurrency(product.getTotalRevenue()), normalFont, Element.ALIGN_RIGHT);
        }

        document.add(table);
        document.add(Chunk.NEWLINE);
    }

    private void addTopStaffTable(Document document, Font subtitleFont, Font normalFont) throws DocumentException {
        Paragraph subtitle = new Paragraph("V. TOP 5 NHÂN VIÊN KINH DOANH", subtitleFont);
        subtitle.setAlignment(Element.ALIGN_LEFT);
        document.add(subtitle);
        document.add(Chunk.NEWLINE);

        ResponseData topStaffResponse = dashboardService.getTopStaff();
        if (!topStaffResponse.isSuccess() || topStaffResponse.getData() == null) {
            document.add(new Paragraph("Không có dữ liệu nhân viên", normalFont));
            document.add(Chunk.NEWLINE);
            return;
        }

        List<TopStaffDTO> topStaffList = (List<TopStaffDTO>) topStaffResponse.getData();
        if (topStaffList.isEmpty()) {
            document.add(new Paragraph("Không có dữ liệu nhân viên", normalFont));
            document.add(Chunk.NEWLINE);
            return;
        }
        
        // Thêm đơn vị tính
        Paragraph unit = new Paragraph("Đơn vị tính: Cái/VNĐ", normalFont);
        unit.setAlignment(Element.ALIGN_RIGHT);
        document.add(unit);

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);

        addCellWithBorder(table, "STT", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "Mã NV", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "Tên nhân viên", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "Số lượng đã bán", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "Doanh thu", normalFont, Element.ALIGN_CENTER);
        
        // Thêm hàng STT cột
        addCellWithBorder(table, "1", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "2", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "3", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "4", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "5", normalFont, Element.ALIGN_CENTER);

        int stt = 1;
        for (TopStaffDTO staff : topStaffList) {
            addCellWithBorder(table, String.valueOf(stt++), normalFont, Element.ALIGN_CENTER);
            addCellWithBorder(table, staff.getStaffCode(), normalFont, Element.ALIGN_CENTER);
            addCellWithBorder(table, staff.getStaffName(), normalFont, Element.ALIGN_LEFT);
            addCellWithBorder(table, String.valueOf(staff.getTotalQuantitySold()), normalFont, Element.ALIGN_RIGHT);
            addCellWithBorder(table, formatCurrency(staff.getTotalRevenue()), normalFont, Element.ALIGN_RIGHT);
        }

        document.add(table);
        document.add(Chunk.NEWLINE);
    }

    private void addTopCustomersTable(Document document, Font subtitleFont, Font normalFont) throws DocumentException {
        Paragraph subtitle = new Paragraph("VI. TOP 5 KHÁCH HÀNG MUA NHIỀU NHẤT", subtitleFont);
        subtitle.setAlignment(Element.ALIGN_LEFT);
        document.add(subtitle);
        document.add(Chunk.NEWLINE);

        ResponseData topCustomerResponse = dashboardService.getTopCustomer();
        if (!topCustomerResponse.isSuccess() || topCustomerResponse.getData() == null) {
            document.add(new Paragraph("Không có dữ liệu khách hàng", normalFont));
            document.add(Chunk.NEWLINE);
            return;
        }

        List<TopCustomerDTO> topCustomers = (List<TopCustomerDTO>) topCustomerResponse.getData();
        if (topCustomers.isEmpty()) {
            document.add(new Paragraph("Không có dữ liệu khách hàng", normalFont));
            document.add(Chunk.NEWLINE);
            return;
        }
        
        // Thêm đơn vị tính
        Paragraph unit = new Paragraph("Đơn vị tính: Cái/VNĐ", normalFont);
        unit.setAlignment(Element.ALIGN_RIGHT);
        document.add(unit);

        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);

        addCellWithBorder(table, "STT", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "Tên khách hàng", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "Email", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "SĐT", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "Số lượng mua", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "Tổng chi tiêu", normalFont, Element.ALIGN_CENTER);
        
        // Thêm hàng STT cột
        addCellWithBorder(table, "1", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "2", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "3", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "4", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "5", normalFont, Element.ALIGN_CENTER);
        addCellWithBorder(table, "6", normalFont, Element.ALIGN_CENTER);

        int stt = 1;
        for (TopCustomerDTO customer : topCustomers) {
            addCellWithBorder(table, String.valueOf(stt++), normalFont, Element.ALIGN_CENTER);
            addCellWithBorder(table, customer.getName(), normalFont, Element.ALIGN_LEFT);
            addCellWithBorder(table, customer.getEmail(), normalFont, Element.ALIGN_LEFT);
            addCellWithBorder(table, customer.getPhone(), normalFont, Element.ALIGN_LEFT);
            addCellWithBorder(table, String.valueOf(customer.getTotalQuantityBought()), normalFont, Element.ALIGN_RIGHT);
            addCellWithBorder(table, formatCurrency(customer.getTotalSpent()), normalFont, Element.ALIGN_RIGHT);
        }

        document.add(table);
        document.add(Chunk.NEWLINE);
    }

    private void addFooter(Document document, Font normalFont) throws DocumentException {
        // Get current user info for signature
        ResponseData userResponse = userUtil.getUserInfo();
        String userName = "Admin";
        
        if (userResponse.isSuccess() && userResponse.getData() != null) {
            User user = (User) userResponse.getData();
            userName = user.getName();
        }
        
        // Create signature table
        PdfPTable sigTable = new PdfPTable(3);
        sigTable.setWidthPercentage(100);
        sigTable.setSpacingBefore(50f);
        
        // Add signature header cells
        PdfPCell cell1 = new PdfPCell(new Phrase("Người lập biểu", normalFont));
        cell1.setBorder(0);
        cell1.setHorizontalAlignment(Element.ALIGN_CENTER);
        sigTable.addCell(cell1);
        
        PdfPCell cell2 = new PdfPCell(new Phrase("Kế toán trưởng", normalFont));
        cell2.setBorder(0);
        cell2.setHorizontalAlignment(Element.ALIGN_CENTER);
        sigTable.addCell(cell2);
        
        PdfPCell cell3 = new PdfPCell(new Phrase("Người đại diện theo pháp luật", normalFont));
        cell3.setBorder(0);
        cell3.setHorizontalAlignment(Element.ALIGN_CENTER);
        sigTable.addCell(cell3);
        
        // Add signature subtitle cells
        PdfPCell subtitle1 = new PdfPCell(new Phrase("(Ký, họ tên)", normalFont));
        subtitle1.setBorder(0);
        subtitle1.setHorizontalAlignment(Element.ALIGN_CENTER);
        sigTable.addCell(subtitle1);
        
        PdfPCell subtitle2 = new PdfPCell(new Phrase("(Ký, họ tên)", normalFont));
        subtitle2.setBorder(0);
        subtitle2.setHorizontalAlignment(Element.ALIGN_CENTER);
        sigTable.addCell(subtitle2);
        
        PdfPCell subtitle3 = new PdfPCell(new Phrase("(Ký, họ tên)", normalFont));
        subtitle3.setBorder(0);
        subtitle3.setHorizontalAlignment(Element.ALIGN_CENTER);
        sigTable.addCell(subtitle3);
        
        // Add empty space for signatures
        PdfPCell sig1 = new PdfPCell(new Phrase("\n\n\n" + userName, normalFont));
        sig1.setBorder(0);
        sig1.setHorizontalAlignment(Element.ALIGN_CENTER);
        sigTable.addCell(sig1);
        
        PdfPCell sig2 = new PdfPCell(new Phrase("\n\n\n", normalFont));
        sig2.setBorder(0);
        sigTable.addCell(sig2);
        
        PdfPCell sig3 = new PdfPCell(new Phrase("\n\n\n", normalFont));
        sig3.setBorder(0);
        sigTable.addCell(sig3);
        
        document.add(sigTable);
        document.add(Chunk.NEWLINE);
        
        // Add copyright footer
        Paragraph footer = new Paragraph("© CH-ABC 2025 - Hệ thống quản lý doanh thu", normalFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
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