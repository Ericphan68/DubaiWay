-- ============================================================================
-- DubaiWay — 0008 VAI TRÒ, QUYỀN, CẤU HÌNH MẶC ĐỊNH
-- ============================================================================
-- Đây là dữ liệu HỆ THỐNG (không phải dữ liệu demo) nên nằm trong migration.
-- ============================================================================

insert into public.roles (key, name, scope, description) values
  ('super_admin',       'Super Admin',        'platform', 'Toàn quyền, kể cả phân quyền và cấu hình hệ thống'),
  ('merchant_reviewer', 'Merchant Reviewer',  'platform', 'Xét duyệt hồ sơ KYC/KYB của merchant'),
  ('service_reviewer',  'Service Reviewer',   'platform', 'Xét duyệt dịch vụ đăng bán'),
  ('customer_support',  'Customer Support',   'platform', 'Hỗ trợ khách hàng, xem đơn, trả lời ticket'),
  ('finance',           'Finance',            'platform', 'Thanh toán, hoàn tiền, đối soát, rút tiền'),
  ('dispute_officer',   'Dispute Officer',    'platform', 'Xử lý khiếu nại và tranh chấp'),
  ('content_manager',   'Content Manager',    'platform', 'Trang nội dung, blog, danh mục'),
  ('marketing',         'Marketing',          'platform', 'Khuyến mãi, banner, chiến dịch'),
  ('merchant_owner',    'Chủ Merchant',       'merchant', 'Toàn quyền trong phạm vi merchant của mình'),
  ('merchant_staff',    'Nhân viên Merchant', 'merchant', 'Quản lý dịch vụ và đơn hàng của merchant'),
  ('merchant_scanner',  'Nhân viên quét mã',  'merchant', 'Chỉ quét voucher xác nhận khách sử dụng'),
  ('customer',          'Khách hàng',         'customer', 'Người dùng cuối')
on conflict (key) do nothing;

insert into public.permissions (key, description) values
  ('merchant.review',   'Duyệt/từ chối hồ sơ merchant, xem giấy tờ KYC/KYB'),
  ('service.review',    'Duyệt/từ chối dịch vụ'),
  ('category.manage',   'Quản lý danh mục dịch vụ'),
  ('booking.read_all',  'Xem mọi đơn hàng trên nền tảng'),
  ('booking.manage',    'Can thiệp đơn hàng: huỷ, đổi trạng thái'),
  ('finance.manage',    'Xem/xử lý thanh toán, đối soát, rút tiền, sổ cái'),
  ('refund.manage',     'Duyệt và thực hiện hoàn tiền'),
  ('dispute.manage',    'Xử lý khiếu nại'),
  ('review.moderate',   'Ẩn đánh giá vi phạm'),
  ('referral.manage',   'Xem và xử lý giới thiệu, thưởng, nghi vấn gian lận'),
  ('content.manage',    'Quản lý trang nội dung và blog'),
  ('marketing.manage',  'Quản lý khuyến mãi và banner'),
  ('support.manage',    'Xử lý ticket hỗ trợ'),
  ('audit.read',        'Đọc nhật ký hệ thống'),
  ('settings.manage',   'Đổi cấu hình nền tảng'),
  ('user.manage',       'Quản lý tài khoản người dùng'),
  ('role.manage',       'Cấp và thu hồi vai trò')
on conflict (key) do nothing;

-- Ma trận phân quyền
insert into public.role_permissions (role_key, permission_key) values
  -- Super Admin: mọi quyền
  ('super_admin','merchant.review'), ('super_admin','service.review'), ('super_admin','category.manage'),
  ('super_admin','booking.read_all'), ('super_admin','booking.manage'), ('super_admin','finance.manage'),
  ('super_admin','refund.manage'), ('super_admin','dispute.manage'), ('super_admin','review.moderate'),
  ('super_admin','referral.manage'), ('super_admin','content.manage'), ('super_admin','marketing.manage'),
  ('super_admin','support.manage'), ('super_admin','audit.read'), ('super_admin','settings.manage'),
  ('super_admin','user.manage'), ('super_admin','role.manage'),
  -- Merchant Reviewer
  ('merchant_reviewer','merchant.review'), ('merchant_reviewer','audit.read'),
  -- Service Reviewer
  ('service_reviewer','service.review'), ('service_reviewer','category.manage'),
  -- Customer Support
  ('customer_support','booking.read_all'), ('customer_support','support.manage'),
  -- Finance
  ('finance','finance.manage'), ('finance','refund.manage'), ('finance','booking.read_all'),
  ('finance','referral.manage'), ('finance','audit.read'),
  -- Dispute Officer
  ('dispute_officer','dispute.manage'), ('dispute_officer','booking.read_all'),
  ('dispute_officer','review.moderate'), ('dispute_officer','refund.manage'),
  -- Content Manager
  ('content_manager','content.manage'), ('content_manager','category.manage'),
  -- Marketing
  ('marketing','marketing.manage')
on conflict do nothing;

-- ─── CẤU HÌNH MẶC ĐỊNH ──────────────────────────────────────────────────────
insert into public.platform_settings (key, value, description) values
  ('commission.default_rate_bps',   '1000'::jsonb, 'Hoa hồng nền tảng mặc định, basis points. 1000 = 10%'),
  ('referral.default_share_bps',    '3000'::jsonb, 'Phần người giới thiệu hưởng TRÊN HOA HỒNG. 3000 = 30%'),
  ('referral.max_levels',           '1'::jsonb,    'Số tầng giới thiệu. LUÔN LÀ 1. Không được đổi thành nhiều tầng.'),
  ('commission.base',               '"subtotal_after_discount"'::jsonb, 'Cơ sở tính hoa hồng'),
  ('booking.dispute_window_hours',  '72'::jsonb,   'Thời hạn khiếu nại mặc định sau khi dùng dịch vụ'),
  ('booking.draft_ttl_minutes',     '30'::jsonb,   'Thời gian giữ chỗ cho đơn nháp trước khi nhả ra'),
  ('withdrawal.min_amount_minor',   '10000'::jsonb,'Số tiền rút tối thiểu (100,00 AED)'),
  ('platform.default_currency',     '"AED"'::jsonb,'Tiền tệ mặc định'),
  ('platform.supported_locales',    '["vi","en"]'::jsonb, 'Ngôn ngữ đang bật. Thêm "ar" khi sẵn sàng RTL.'),
  ('platform.default_locale',       '"vi"'::jsonb, 'Ngôn ngữ mặc định')
on conflict (key) do nothing;

-- Bản ghi hoa hồng toàn nền tảng — nguồn sự thật khi tính tiền.
insert into public.commissions (scope, commission_rate_bps, referral_share_bps, commission_base)
select 'platform', 1000, 3000, 'subtotal_after_discount'
where not exists (select 1 from public.commissions where scope = 'platform');
